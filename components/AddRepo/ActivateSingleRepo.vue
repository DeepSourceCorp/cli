<template>
  <z-tab-pane class="flex flex-col h-full">
    <div class="p-4 pb-0 space-y-2">
      <z-input
        v-focus
        ref="search-repo-input"
        :show-border="false"
        :value="searchCandidate"
        background-color="ink-400"
        icon="search"
        placeholder="Search repositories..."
        class="flex-grow"
        @debounceInput="searchRepo"
      >
        <template #left>
          <z-icon icon="search" class="ml-1.5" />
        </template>
      </z-input>
    </div>
    <div class="flex-grow overflow-x-hidden">
      <div v-if="reposToActivateList.length" class="p-4 space-y-2">
        <repo-card
          v-for="repo in reposToActivateList"
          :key="repo.id"
          v-bind="repo"
          :analyzer-shortcode="analyzerShortcode"
          :remove-default-style="true"
          :show-info="false"
          :transformer-shortcode="transformerShortcode"
          route="generate-config"
          size="small"
          class="border rounded-lg hover:bg-ink-200 border-ink-200"
        />

        <div
          v-if="$route.params.provider === 'gl'"
          class="flex flex-col items-center p-4 space-y-4"
        >
          <p class="text-sm font-normal text-vanilla-100">
            Can't find the repository that you're looking for?
          </p>

          <z-button
            v-if="repoSyncLoading"
            :disabled="true"
            button-type="ghost"
            size="small"
            class="flex items-center bg-ink-200 text-vanilla-100"
          >
            <z-icon icon="spin-loader" color="vanilla-100" class="mr-2 animate-spin" />
            <span>Syncing repositories</span>
          </z-button>
          <z-button
            v-else
            button-type="ghost"
            icon="refresh-cw"
            icon-color="vanilla-100"
            size="small"
            class="bg-ink-200 text-vanilla-100 hover:bg-opacity-80"
            @click="syncRepos"
          >
            Sync repositories
          </z-button>
        </div>
      </div>
      <div v-else-if="$fetchState.pending" class="p-4 space-y-2 animate-pulse">
        <div
          v-for="loopIndex in 4"
          :key="loopIndex"
          class="rounded-md opacity-50 h-17 bg-ink-200"
        ></div>
      </div>
      <div v-else class="flex flex-col items-center justify-center p-2 mt-10 space-y-5 text-center">
        <img
          v-if="searchCandidate"
          :alt="searchCandidate"
          height="100px"
          src="~/assets/images/ui-states/directory/empty-search.gif"
          width="auto"
          class="mx-auto"
        />
        <div>
          <p class="font-semibold text-vanilla-100">
            {{
              searchCandidate
                ? `No results found for "${searchCandidate}"`
                : 'We couldn’t find any repositories linked to this account.'
            }}
          </p>

          <p class="max-w-md mt-1 text-sm text-vanilla-400">
            {{
              owner.hasGrantedAllRepoAccess
                ? `You can sync your repositories from ${activeProviderName}`
                : 'Make sure to grant DeepSource access to the Git repositories you’d like to import.'
            }}
          </p>
        </div>
        <div class="flex gap-x-2">
          <z-button
            rel="noopener noreferrer"
            v-if="!owner.hasGrantedAllRepoAccess && owner.appConfigurationUrl"
            :to="owner.appConfigurationUrl"
            icon="settings"
            icon-color="vanilla-100"
            label="Manage Permissions"
            size="small"
            target="_blank"
            class="bg-ink-200 hover:bg-ink-200 hover:opacity-80 text-vanilla-100"
          />
          <z-button
            :is-loading="repoSyncLoading"
            :disabled="repoSyncLoading"
            icon="refresh-cw"
            label="Sync repositories"
            loading-label="Syncing repositories"
            size="small"
            @click="syncRepos"
          />
        </div>
      </div>
      <div v-if="totalPageCount > 1" class="flex justify-center my-6 text-sm">
        <z-pagination
          :page="currentPage"
          :total-pages="totalPageCount"
          :total-visible="5"
          @selected="updatePageNum"
        />
      </div>
    </div>
  </z-tab-pane>
</template>
<script lang="ts">
import { Component, mixins, Prop } from 'nuxt-property-decorator'
import { ZInput, ZButton, ZIcon, ZTabPane, ZPagination } from '@deepsourcelabs/zeal'
import { RepoCard } from '@/components/AddRepo'

import RepositoriesActivationListQuery from '~/apollo/queries/repository/activateList.gql'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import RepoListMixin from '~/mixins/repoListMixin'
import RepoSyncMixin from '~/mixins/repoSyncMixin'
import PaginationMixin from '~/mixins/paginationMixin'
import { Repository, RepositoryToActivateListQueryVariables } from '~/types/types'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { resolveNodes } from '~/utils/array'

interface ZInputT extends Vue {
  focus: () => void
}

/**
 * Component to activate new repositories
 */
@Component({
  components: {
    ZInput,
    ZButton,
    ZIcon,
    ZTabPane,
    ZPagination,
    RepoCard
  }
})
export default class ActivateSingleRepo extends mixins(
  ActiveUserMixin,
  OwnerDetailMixin,
  RepoListMixin,
  RepoSyncMixin,
  PaginationMixin
) {
  @Prop({ default: '' })
  analyzerShortcode: string

  @Prop({ default: '' })
  transformerShortcode: string

  reposToActivateList: Repository[] = []
  public searchCandidate = ''
  public perPageCount = 30

  /**
   * Mounted hook for Vue component
   *
   * @returns {void}
   */
  mounted(): void {
    this.$socket.$on('vcs-installed-repos-updated', this.refetchData)
  }

  /**
   * Proxy for fetch repos
   *
   * @return {Promise<void>}
   */
  async fetchReposAfterSync(): Promise<void> {
    this.$fetch()
  }

  /**
   * Search repo input change handler
   *
   * @param {string} val
   * @returns {Promise<void>}
   */
  async searchRepo(val: string): Promise<void> {
    this.searchCandidate = val
    this.currentPage = 1
    const response = await this.fetchReposToActivate(
      {
        login: this.activeOwner,
        provider: this.$providerMetaMap[this.activeProvider].value,
        limit: this.perPageCount,
        offset: this.queryOffset,
        query: this.searchCandidate ? this.searchCandidate : null
      },
      true
    )
    this.reposToActivateList = response ?? []
    const searchBox = this.$refs['search-repo-input'] as ZInputT
    if (searchBox) {
      searchBox.focus()
    }
  }

  /**
   * The fetch hook
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    await this.refetchData()
  }

  /**
   * Refetch repo list and app config
   *
   * @returns {Promise<void>}
   */
  async refetchData(): Promise<void> {
    await Promise.all([
      this.fetchReposToActivate({
        login: this.activeOwner,
        provider: this.$providerMetaMap[this.activeProvider].value,
        limit: this.perPageCount,
        offset: this.queryOffset,
        query: this.searchCandidate ? this.searchCandidate : null
      }).then((response) => (this.reposToActivateList = response ?? [])),
      this.fetchAppConfig({
        login: this.activeOwner,
        provider: this.activeProvider,
        refetch: true
      })
    ])
  }

  /**
   * beforeDestroy hook for Vue component
   *
   * @returns {void}
   */
  beforeDestroy(): void {
    this.$socket.$off('repo-sync', this.repoSyncCallback)
    this.$socket.$off('vcs-installed-repos-updated', this.refetchData)
    this.repoSyncLoading = false
  }

  /**
   * Fetch list of repositories that need to be activated.
   *
   * @param {RepositoryToActivateListQueryVariables} args - Arguments for the fetch query.
   * @param {boolean} [refetch] - Whether to do a `network-only` query or not.
   * @returns {Promise<Repository[] | undefined>}
   */
  async fetchReposToActivate(
    args: RepositoryToActivateListQueryVariables,
    refetch?: boolean
  ): Promise<Repository[] | undefined> {
    try {
      const response = (await this.$fetchGraphqlData(
        RepositoriesActivationListQuery,
        { ...args, isActivated: false },
        refetch
      )) as GraphqlQueryResponse

      if (response.data.owner?.repositories) {
        this.totalCount = response.data.owner.repositories.totalCount ?? 0
        return resolveNodes(response.data.owner.repositories) as Repository[]
      }
    } catch (e) {
      this.$logErrorAndToast(
        e as Error,
        'We encountered an error while trying to fetch your repositories. Please try refreshing this page and try again. If the issue keeps happening, contact our support.'
      )
    }
  }
}
</script>
