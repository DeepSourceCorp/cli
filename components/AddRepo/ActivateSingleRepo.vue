<template>
  <z-tab-pane class="flex flex-col h-full">
    <div class="p-4 pb-0 space-y-2">
      <z-input
        ref="search-repo-input"
        :value="searchCandidate"
        icon="search"
        @debounceInput="searchRepo"
        class="flex-grow"
        :showBorder="false"
        backgroundColor="ink-400"
        placeholder="Search repositories..."
        ><template slot="left">
          <z-icon icon="search" size="small" class="ml-1.5" />
        </template>
      </z-input>
    </div>
    <div class="flex-grow overflow-x-hidden hide-scroll">
      <div v-if="newRepos.edges && newRepos.edges.length" class="p-4 space-y-2">
        <repo-card
          v-for="repo in newRepos.edges"
          :key="repo.node.id"
          v-bind="repo.node"
          class="border rounded-lg hover:bg-ink-200 border-ink-200"
          size="small"
          route="generate-config"
          :removeDefaultStyle="true"
          :showInfo="false"
          :analyzer-shortcode="analyzerShortcode"
          :transformer-shortcode="transformerShortcode"
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
            button-type="ghost"
            size="small"
            :disabled="true"
            class="flex items-center bg-ink-200 text-vanilla-100"
          >
            <z-icon icon="spin-loader" class="mr-2 animate-spin" size="small" color="vanilla-100" />
            <span>Syncing repositories</span>
          </z-button>
          <z-button
            v-else
            button-type="ghost"
            icon-color="vanilla-100"
            size="small"
            class="bg-ink-200 text-vanilla-100 hover:bg-opacity-80"
            icon="refresh-cw"
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
          class="mx-auto"
          height="100px"
          width="auto"
          src="~/assets/images/ui-states/directory/empty-search.gif"
          :alt="searchCandidate"
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
            v-if="!owner.hasGrantedAllRepoAccess && owner.appConfigurationUrl"
            label="Manage Permissions"
            size="small"
            :to="owner.appConfigurationUrl"
            target="_blank"
            rel="noopener noreferrer"
            icon="settings"
            icon-color="vanilla-100"
            class="bg-ink-200 hover:bg-ink-200 hover:opacity-80 text-vanilla-100"
          />
          <z-button
            label="Sync repositories"
            icon="refresh-cw"
            loading-label="Syncing repositories"
            :is-loading="repoSyncLoading"
            :disabled="repoSyncLoading"
            size="small"
            @click="syncRepos"
          />
        </div>
      </div>
    </div>
  </z-tab-pane>
</template>
<script lang="ts">
import { Component, mixins, Prop } from 'nuxt-property-decorator'
import { ZInput, ZButton, ZIcon, ZTabPane } from '@deepsourcelabs/zeal'
import { RepoCard } from '@/components/AddRepo'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import RepoListMixin from '~/mixins/repoListMixin'
import RepoSyncMixin from '~/mixins/repoSyncMixin'

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
    RepoCard
  }
})
export default class ActivateSingleRepo extends mixins(
  ActiveUserMixin,
  OwnerDetailMixin,
  RepoListMixin,
  RepoSyncMixin
) {
  @Prop({ default: '' })
  analyzerShortcode: string

  @Prop({ default: '' })
  transformerShortcode: string

  public searchCandidate = ''
  public pageSize = 20

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
    await this.fetchNewRepoList({
      login: this.activeOwner,
      provider: this.activeProvider,
      limit: this.pageSize,
      currentPageNumber: 1,
      query: this.searchCandidate ? this.searchCandidate : null
    })
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

    const searchBox = this.$refs['search-repo-input'] as ZInputT
    if (searchBox) {
      searchBox.focus()
    }
  }

  /**
   * Refetch repo list and app config
   *
   * @returns {Promise<void>}
   */
  async refetchData(): Promise<void> {
    await Promise.all([
      await this.fetchNewRepoList({
        login: this.activeOwner,
        provider: this.activeProvider,
        limit: this.pageSize,
        currentPageNumber: 1,
        query: this.searchCandidate ? this.searchCandidate : null
      }),
      await this.fetchAppConfig({
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
}
</script>
