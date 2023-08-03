<template>
  <z-tab-pane class="flex h-full flex-col">
    <div class="space-y-2 p-4 pb-0">
      <z-input
        ref="search-repo-input"
        v-focus
        :show-border="false"
        :value="searchCandidate"
        background-color="ink-400"
        icon="search"
        :placeholder="`Search for ${listMonoreposOnly ? 'monorepos' : 'repositories'}...`"
        class="flex-grow"
        @input="debounceSearchRepo"
      >
        <template #left>
          <z-icon icon="search" class="ml-1.5" />
        </template>
      </z-input>
    </div>
    <div class="flex-grow overflow-x-hidden p-4">
      <div v-if="reposListLoading" class="animate-pulse space-y-2">
        <div
          v-for="loopIndex in 4"
          :key="loopIndex"
          class="h-17 rounded-md bg-ink-200 opacity-50"
        ></div>
      </div>

      <template v-else-if="reposToActivateList.length === 0">
        <lazy-empty-state-card
          v-if="listMonoreposOnly && !searchCandidate"
          :webp-image-path="require('~/assets/images/ui-states/runs/no-recent-autofixes.webp')"
          content-styles="md:text-left text-center px-4 max-w-sm"
          image-classes="md:mx-auto px-4 md:px-0 mx-auto w-full md:w-auto md:-mt-16"
          subtitle="You need to define a repository as a monorepo either from the repository settings or while activating a repository."
          title="You don't have a monorepo yet"
          class="h-full max-w-sm items-center md:max-w-xl"
        >
          <template #action>
            <button
              class="auxillary-button flex w-full items-center justify-center py-1.5 text-xs text-vanilla-400 hover:text-vanilla-100 md:w-auto"
              @click="$router.push($generateRoute(['repos'], false))"
            >
              <span> Open a repository </span>
              <z-icon icon="arrow-right" color="vanilla-400" />
            </button>
          </template>
        </lazy-empty-state-card>

        <div v-else :class="listMonoreposOnly ? 'h-full' : 'space-y-5'">
          <lazy-empty-state
            :use-v2="true"
            :show-border="true"
            :title="
              searchCandidate
                ? `No results found for '${searchCandidate}'`
                : 'We couldn’t find any repositories linked to this account'
            "
            :subtitle="
              owner.hasGrantedAllRepoAccess
                ? `You can sync your repositories from ${activeProviderName}.`
                : 'Make sure to grant DeepSource access to the Git repositories you’d like to import.'
            "
            :padding="
              listMonoreposOnly ? 'px-3.5 md:px-12 py-19' : 'px-3.5 py-12 md:px-12 md:py-19'
            "
            :webp-image-path="
              searchCandidate
                ? require('~/assets/images/ui-states/directory/empty-search.webp')
                : undefined
            "
            :png-image-path="
              searchCandidate
                ? require('~/assets/images/ui-states/directory/empty-search.gif')
                : undefined
            "
            class="border-ink-100"
            :class="{ 'h-full items-center': listMonoreposOnly }"
          >
            <template #action>
              <div class="flex justify-center gap-x-2 md:justify-start">
                <z-button
                  v-if="!owner.hasGrantedAllRepoAccess && owner.appConfigurationUrl"
                  :to="owner.appConfigurationUrl"
                  label="Manage Permissions"
                  size="small"
                  target="_blank"
                  rel="noopener noreferrer"
                  icon="settings"
                  icon-color="vanilla-100"
                  class="bg-ink-200 text-vanilla-100 hover:bg-ink-200 hover:opacity-80"
                />

                <z-button
                  v-if="!listMonoreposOnly"
                  :is-loading="repoSyncLoading"
                  :disabled="repoSyncLoading"
                  label="Sync repositories"
                  icon="refresh-cw"
                  loading-label="Syncing repositories"
                  size="small"
                  @click="syncRepos"
                />
              </div>
            </template>
          </lazy-empty-state>

          <sync-repo-alert
            v-if="!listMonoreposOnly"
            :initial-repo-name="repoToSync"
            :loading="singleRepoSyncLoading"
            :error-message="singleRepoSyncErrMsg"
            @sync-repo="(repoName) => syncSingleRepo(repoName, owner.id)"
          />
        </div>
      </template>

      <div v-else class="space-y-2">
        <repo-card
          v-for="repo in reposToActivateList"
          :key="repo.id"
          v-bind="repo"
          :analyzer-shortcode="analyzerShortcode"
          :is-exact-route="isMonorepo(repo.kind)"
          :remove-default-style="true"
          :route="getRoute(repo)"
          :show-info="false"
          :subrepo-count="repo.subRepos && repo.subRepos.totalCount"
          :transformer-shortcode="transformerShortcode"
          size="small"
          class="rounded-lg border border-slate-400 hover:bg-ink-200"
        />

        <div
          v-if="!listMonoreposOnly && $route.params.provider === 'gl'"
          class="flex flex-col items-center space-y-4 p-4"
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
            class="bg-ink-200 text-vanilla-100 hover:bg-ink-200/80"
            @click="syncRepos"
          >
            Sync repositories
          </z-button>
        </div>
      </div>

      <div v-if="totalPageCount > 1 && !reposListLoading" class="my-6 flex justify-center text-sm">
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
import { Component, mixins, Prop, Watch } from 'nuxt-property-decorator'

import RepositoriesActivationListQuery from '~/apollo/queries/repository/activateList.gql'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import PaginationMixin from '~/mixins/paginationMixin'
import RepoListMixin from '~/mixins/repoListMixin'
import RepoSyncMixin from '~/mixins/repoSyncMixin'

import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import {
  Repository,
  RepositoryKindChoices,
  RepositoryToActivateListQueryVariables
} from '~/types/types'

import { resolveNodes } from '~/utils/array'
import { debounceAsync } from '~/utils/debounce'

/**
 * Component to activate new repositories
 */
@Component({
  name: 'ActivateSingleRepo'
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

  @Prop({ default: false })
  listMonoreposOnly: boolean

  reposToActivateList: Repository[] = []
  searchCandidate = ''
  perPageCount = 30
  reposListLoading = false
  timeoutId: ReturnType<typeof setTimeout>

  debouncedSearchRepo = debounceAsync(this.searchRepo, 400)

  /**
   * The fetch hook
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    this.reposListLoading = true

    await this.refetchData()
  }

  /**
   * Mounted hook for Vue component
   *
   * @returns {void}
   */
  mounted(): void {
    this.$socket.$on('vcs-installed-repos-updated', this.refetchData)
  }

  get repoKindInArg(): RepositoryKindChoices[] {
    return this.listMonoreposOnly
      ? [RepositoryKindChoices.Monorepo]
      : [RepositoryKindChoices.Repo, RepositoryKindChoices.Subrepo]
  }

  // Ensures the re-fetch happens when switching between `Activate a repository` and `Monorepos` tabs
  @Watch('listMonoreposOnly')
  onTabChange() {
    this.$fetch()
  }

  /**
   * Proxy for fetch repos
   *
   * @return {Promise<void>}
   */
  async fetchReposAfterSync(): Promise<void> {
    this.refetchData()
  }

  /**
   * Handler method for the `ZInput` `input` event
   * Debounce API calls
   *
   * @param {string} val
   * @returns {void}
   */
  async debounceSearchRepo(val: string): Promise<void> {
    this.searchCandidate = val
    this.reposListLoading = true

    await this.debouncedSearchRepo()
  }

  /**
   * Search repo input change handler
   *
   * @param {string} val
   * @returns {Promise<void>}
   */
  async searchRepo(): Promise<void> {
    this.currentPage = 1

    const response = await this.fetchReposToActivate(
      {
        login: this.activeOwner,
        provider: this.$providerMetaMap[this.activeProvider].value,
        limit: this.perPageCount,
        offset: this.queryOffset,
        query: this.searchCandidate ? this.searchCandidate : null,
        kindIn: this.repoKindInArg
      },
      true
    )

    this.reposToActivateList = response ?? []

    const searchBox = this.$refs['search-repo-input'] as HTMLInputElement
    if (searchBox) {
      searchBox.focus()
    }
  }

  /**
   * Refetch repo list and app config
   *
   * @returns {Promise<void>}
   */
  async refetchData(refetch = true): Promise<void> {
    this.repoToSync = ''
    this.singleRepoSyncErrMsg = ''

    if (!this.owner.id) {
      await this.fetchOwnerID({
        login: this.activeOwner,
        provider: this.$providerMetaMap[this.activeProvider].value
      })
    }

    await Promise.all([
      this.fetchReposToActivate(
        {
          login: this.activeOwner,
          provider: this.$providerMetaMap[this.activeProvider].value,
          limit: this.perPageCount,
          offset: this.queryOffset,
          query: this.searchCandidate ? this.searchCandidate : null,
          kindIn: this.repoKindInArg
        },
        refetch
      ).then((response) => (this.reposToActivateList = response ?? [])),
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
      if (this.timeoutId) {
        clearTimeout(this.timeoutId)
      }
      const response = (await this.$fetchGraphqlData(
        RepositoriesActivationListQuery,
        { ...args, isActivated: false },
        refetch
      )) as GraphqlQueryResponse

      if (response.data.owner?.repositories) {
        this.totalCount = response.data.owner.repositories.totalCount ?? 0
        return resolveNodes(response.data.owner.repositories)
      }
    } catch (e) {
      this.$logErrorAndToast(
        e as Error,
        'We encountered an error while trying to fetch your repositories. Please try refreshing this page and try again. If the issue keeps happening, contact our support.'
      )
    } finally {
      this.timeoutId = setTimeout(() => {
        this.reposListLoading = false
      }, 300)
    }
  }

  isMonorepo(repoKind: RepositoryKindChoices): boolean {
    return repoKind === RepositoryKindChoices.Monorepo
  }

  getRoute({ name, kind }: Repository) {
    return this.isMonorepo(kind) ? this.$generateRoute([name], false) : 'generate-config'
  }
}
</script>
