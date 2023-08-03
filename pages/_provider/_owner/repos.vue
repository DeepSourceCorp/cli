<template>
  <div class="repos-page grid grid-cols-1 lg:grid-cols-16-fr">
    <nav
      class="hide-scroll vertical-sidebar hidden gap-x-8 overflow-x-auto border-b border-slate-400 px-4 pt-2 lg:sticky lg:flex lg:flex-col lg:gap-y-1 lg:border-r lg:p-2"
    >
      <template v-for="item in navItems">
        <nuxt-link
          v-if="item.visible"
          :key="item.value"
          :to="$generateRoute(['repos', item.value])"
          class="group flex-shrink-0 rounded-md text-sm hover:bg-ink-300"
        >
          <span
            class="flex items-center justify-between rounded-md p-2 group-hover:text-vanilla-100"
            :class="isCurrentRoute(item.value) ? 'bg-ink-300 text-vanilla-100' : 'text-vanilla-400'"
            >{{ item.label }}
            <z-tag
              v-if="Number.isFinite(computedRepoCount[item.value])"
              :bg-color="isCurrentRoute(item.value) ? 'ink-200' : 'ink-300'"
              text-size="xs"
              spacing="py-1 px-2"
              class="leading-none group-hover:bg-ink-200"
            >
              <span v-if="repoCountsLoading" class="h-3 w-4 animate-pulse"></span>
              <span v-else class="mt-px">
                {{ shortenLargeNumber(computedRepoCount[item.value]) }}
              </span>
            </z-tag>
          </span>
        </nuxt-link>
      </template>
    </nav>

    <div class="mb-28 max-w-2xl space-y-4 p-4 lg:mb-24">
      <div>
        <h2 class="font-medium leading-8 text-vanilla-100">
          {{ activeRepoConfig.label }}
        </h2>
        <p class="text-sm leading-6 text-vanilla-400">{{ activeRepoConfig.description }}</p>
      </div>

      <div class="flex gap-x-2">
        <z-input
          :value="queryParams.q"
          :show-border="false"
          background-color="ink-300"
          icon="search"
          placeholder="Search for repository name"
          size="small"
          class="w-full"
          @debounceInput="handleSearch"
        >
          <template #left>
            <z-icon icon="search" class="ml-1.5" />
          </template>
        </z-input>
        <z-button v-if="canActivateRepo" icon="plus" size="small" @click="showAddRepoModal = true">
          Activate <span class="hidden sm:inline">repository</span>
        </z-button>
      </div>

      <nuxt-child
        :per-page-count="perPageCount"
        :repo-list="repoList"
        :repo-list-loading="repoListLoading"
        :search-candidate="queryParams.q"
      />

      <z-pagination
        v-if="totalPageCount > 1"
        :page="currentPage"
        :total-pages="totalPageCount"
        :total-visible="5"
        class="flex justify-center"
        @selected="updatePageNum"
      />

      <floating-button-mobile :nav-items="navListForMobile" />

      <add-repo-modal :show-modal="showAddRepoModal" @close="showAddRepoModal = false" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Watch } from 'nuxt-property-decorator'

import PaginationMixin from '~/mixins/paginationMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import RouteQueryMixin from '~/mixins/routeQueryMixin'

import { resolveNodes } from '~/utils/array'
import { shortenLargeNumber } from '~/utils/string'

import OwnerRepoListQuery from '~/apollo/queries/owner/ownerRepoList.gql'
import RepoCountsQuery from '~/apollo/queries/owner/ownerRepoCounts.gql'

import {
  OwnerRepoCountsQuery,
  Repository,
  RepositoryKindChoices,
  TeamMemberRoleChoices
} from '~/types/types'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { AppFeatures, TeamPerms } from '~/types/permTypes'
import { RepoStatusType, OwnerRepoCountT } from '~/types/repository'
import { OwnerFeatureType } from '~/types/ownerTypes'

interface RepoStatusTypeQueryArgs {
  isActivated: boolean
  kindIn: Array<RepositoryKindChoices>
  getSubrepoCount: boolean
}

export interface RepoTypeConfigData {
  label: string
  description: string
  value: RepoStatusType
  queryArgs: RepoStatusTypeQueryArgs
  visible: boolean
}

@Component({
  middleware: [
    'validateProvider',
    async function ({ route, redirect }) {
      const { provider, owner, repoType } = route.params
      if (!repoType) {
        redirect(`/${provider}/${owner}/repos/${RepoStatusType.ACTIVATED}`)
      }
    }
  ],
  methods: { shortenLargeNumber },
  layout: 'dashboard'
})
export default class AllRepos extends mixins(ActiveUserMixin, PaginationMixin, RouteQueryMixin) {
  readonly perPageCount = 30

  showAddRepoModal = false

  repoList: Array<Repository> = []
  repoListLoading = false

  repoCounts: OwnerRepoCountT = {}
  repoCountsLoading = false

  monorepoFeatureAllowed = false

  async fetch() {
    const { owner, provider } = this.$route.params

    const refetch = this.$localStore.get(
      `${provider}-${owner}`,
      'refetch-team-repo-list'
    ) as boolean

    this.$localStore.set(`${provider}-${owner}`, 'refetch-team-repo-list', false)

    await Promise.allSettled([
      this.fetchRepoList(refetch),
      this.fetchRepoCounts(refetch),
      this.fetchOwnerFeatures()
    ])
  }

  async fetchRepoList(refetch = false) {
    const { owner: login, provider } = this.$route.params

    this.repoListLoading = true

    try {
      const response: GraphqlQueryResponse = await this.$fetchGraphqlData(
        OwnerRepoListQuery,
        {
          login,
          query: this.queryParams.q,
          provider: this.$providerMetaMap[provider].value,
          limit: this.perPageCount,
          after: this.queryAfter,
          ...this.activeRepoConfig.queryArgs
        },
        refetch
      )

      this.repoList = resolveNodes(response.data.owner?.repositories)
      this.totalCount = response.data.owner?.repositories?.totalCount ?? 0
    } catch (e) {
      const err = e as Error

      this.$logErrorAndToast(err, `${err.message.replace('GraphQL error: ', '')}.` as `${string}.`)
    } finally {
      this.repoListLoading = false
    }
  }

  async fetchRepoCounts(refetch = false) {
    const { owner: login, provider } = this.$route.params

    this.repoCountsLoading = true

    try {
      const response: GraphqlQueryResponse = await this.$fetchGraphqlData(
        RepoCountsQuery,
        {
          login,
          provider: this.$providerMetaMap[provider].value
        },
        refetch
      )

      const data: OwnerRepoCountsQuery = response.data

      this.repoCounts = data.owner ?? {}
    } catch (e) {
      const err = e as Error

      this.$logErrorAndToast(err, `${err.message.replace('GraphQL error: ', '')}.` as `${string}.`)
    } finally {
      this.repoCountsLoading = false
    }
  }

  async fetchOwnerFeatures() {
    try {
      this.monorepoFeatureAllowed = await this.$isFeatureAvailable(OwnerFeatureType.MONOREPO, {
        login: this.$route.params.owner,
        provider: this.$providerMetaMap[this.$route.params.provider].value
      })
    } catch (error) {
      this.$logErrorAndToast(
        error as Error,
        'Unable to fetch details about the team. Please contact support.'
      )
    }
  }

  isCurrentRoute(candidate: string): boolean {
    return this.$route.params.repoType === candidate
  }

  handleSearch(query: string) {
    this.currentPage = 1
    this.addFilters({ q: query })
  }

  get repoTypeConfig(): Record<RepoStatusType, RepoTypeConfigData> {
    return {
      [RepoStatusType.ACTIVATED]: {
        label: 'Activated',
        description: 'Manage your activated repositories.',
        value: RepoStatusType.ACTIVATED,
        queryArgs: {
          isActivated: true,
          kindIn: [RepositoryKindChoices.Repo, RepositoryKindChoices.Subrepo],
          getSubrepoCount: false
        },
        visible: true
      },
      [RepoStatusType.INACTIVE]: {
        label: 'Inactive',
        description: 'Manage your inactive repositories.',
        value: RepoStatusType.INACTIVE,
        queryArgs: {
          isActivated: false,
          kindIn: [RepositoryKindChoices.Repo, RepositoryKindChoices.Subrepo],
          getSubrepoCount: false
        },
        visible: true
      },
      [RepoStatusType.MONOREPO]: {
        label: 'Monorepo',
        description: 'Manage your monorepos.',
        value: RepoStatusType.MONOREPO,
        queryArgs: {
          isActivated: false,
          kindIn: [RepositoryKindChoices.Monorepo],
          getSubrepoCount: true
        },
        visible: this.showMonorepoSection
      }
    }
  }

  get navItems(): Array<RepoTypeConfigData> {
    return Object.values(this.repoTypeConfig)
  }

  get navListForMobile() {
    return this.navItems
      .filter(({ visible }) => visible)
      .map(({ label, value }) => {
        return {
          label,
          routePath: this.$generateRoute(['repos', value])
        }
      })
  }

  get activeRepotype(): RepoStatusType {
    const currentNavItem = this.navItems.find((item) => this.isCurrentRoute(item.value))
    return currentNavItem?.value ?? RepoStatusType.ACTIVATED
  }

  get activeRepoConfig(): RepoTypeConfigData {
    return this.repoTypeConfig[this.activeRepotype]
  }

  get canActivateRepo(): boolean {
    const role = this.activeDashboardContext.role as TeamMemberRoleChoices
    return this.$gateKeeper.team(TeamPerms.ACTIVATE_ANALYSIS, role)
  }

  get computedRepoCount(): Record<RepoStatusType, number> {
    return {
      [RepoStatusType.ACTIVATED]: this.repoCounts?.activeRepoCount?.totalCount ?? 0,
      [RepoStatusType.INACTIVE]: this.repoCounts?.inactiveRepoCount?.totalCount ?? 0,
      [RepoStatusType.MONOREPO]: this.repoCounts?.monorepoCount?.totalCount ?? 0
    }
  }

  get showMonorepoSection(): boolean {
    const { provider } = this.$route.params

    return this.monorepoFeatureAllowed && this.$gateKeeper.provider(AppFeatures.MONOREPO, provider)
  }

  @Watch('$route.params.repoType')
  async refetchOnRepoTypeChange() {
    await this.fetchRepoList()
  }

  head(): Record<string, string> {
    const { owner } = this.$route.params
    return {
      title: `Repositories • ${owner}`,
      description:
        'DeepSource is an automated code review tool that helps developers automatically find and fix issues in their code.'
    }
  }
}
</script>

<style scoped lang="postcss">
.repos-page {
  /* The dashboard header comprising of the team/user avatar, VCS icon, etc. */
  --dashboard-header-height: 53px;

  /* The horizontal navbar as part of `dashboard`` layout */
  --horizontal-navbar-height: 44.5px;

  /* The vertical sidebar top position would be the sum of aforementioned values */
  --vertical-sidebar-top-offset: calc(
    var(--dashboard-header-height) + var(--horizontal-navbar-height)
  );
}

@screen lg {
  .vertical-sidebar {
    top: var(--vertical-sidebar-top-offset);
    height: calc(100vh - var(--vertical-sidebar-top-offset));
  }
}
</style>
