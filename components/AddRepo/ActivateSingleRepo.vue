<template>
  <z-tab-pane class="h-full flex flex-col">
    <div class="p-4 pb-0 space-y-2">
      <z-input
        ref="search-repo-input"
        :name="searchCandidate"
        icon="search"
        @debounceInput="searchRepo"
        class="flex-grow"
        :showBorder="false"
        backgroundColor="ink-400"
        placeholder="Search repositories..."
        ><template slot="left">
          <z-icon icon="search" size="small" class="ml-1.5"></z-icon>
        </template>
      </z-input>
    </div>
    <div class="flex-grow hide-scroll overflow-x-hidden">
      <div class="space-y-2 p-4" v-if="newRepos.edges && newRepos.edges.length">
        <repo-card
          v-for="repo in newRepos.edges"
          v-bind="repo.node"
          class="hover:bg-ink-200 border rounded-lg border-ink-200"
          size="small"
          route="generate-config"
          :key="repo.node.id"
          :removeDefaultStyle="true"
          :showInfo="false"
        ></repo-card>
      </div>
      <div v-else-if="fetchingRepos" class="space-y-2 p-4 animate-pulse">
        <div
          v-for="loopIndex in 4"
          :key="loopIndex"
          class="h-17 rounded-md bg-ink-200 opacity-50"
        ></div>
      </div>
      <div class="space-y-5 p-2 text-center flex flex-col items-center justify-center" v-else>
        <img
          v-if="searchCandidate"
          class="mx-auto"
          height="100px"
          width="auto"
          src="~/assets/images/ui-states/onboard-empty-search.png"
          alt="Searcing"
        />
        <div>
          <template v-if="searchCandidate">
            We couldn’t find any matches for "{{ searchCandidate }}"
          </template>
          <template v-else> We couldn’t find any repositories linked to this account. </template>
          <p class="text-sm text-vanilla-400 mt-1">
            You can sync your repositories from VCS Provider
          </p>
        </div>
        <z-button
          v-if="repoSyncLoading"
          size="small"
          class="flex items-center w-48"
          :disabled="true"
        >
          <z-icon
            icon="spin-loader"
            class="animate-spin mr-2"
            size="small"
            color="ink-400"
          ></z-icon>
          <span>Syncing repositories</span>
        </z-button>
        <z-button v-else size="small" class="w-48" icon="refresh-cw" @click="syncRepos">
          Sync repositories
        </z-button>
      </div>
    </div>
  </z-tab-pane>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZInput, ZButton, ZIcon, ZTabPane } from '@deepsourcelabs/zeal'
import { RepoCard } from '@/components/AddRepo'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import RepoListMixin from '~/mixins/repoListMixin'

interface ZInputT extends Vue {
  focus: () => void
}

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
  RepoListMixin
) {
  public searchCandidate = ''
  public pageSize = 20
  public repoSyncLoading = false
  public fetchingRepos = false

  async getData(): Promise<void> {
    await this.fetchNewRepoList({
      login: this.activeOwner,
      provider: this.activeProvider,
      limit: this.pageSize,
      currentPageNumber: 1,
      query: this.searchCandidate ? this.searchCandidate : null
    })
    const searchBox = this.$refs['search-repo-input'] as ZInputT
    if (searchBox) searchBox.focus()
  }

  searchRepo(val: string): void {
    this.searchCandidate = val
    this.getData()
    const searchBox = this.$refs['search-repo-input'] as ZInputT
    if (searchBox) searchBox.focus()
  }

  async fetch(): Promise<void> {
    this.fetchingRepos = true
    await this.getData()
    this.fetchingRepos = false
  }

  async syncRepos(): Promise<void> {
    this.repoSyncLoading = true
    try {
      await this.syncReposForOwner()
    } catch {
      this.$toast.danger('Error while syncing repositories. Please try again.')
    }

    this.$socket.$on('repo-sync', async (data: { status: string }) => {
      if (data.status === 'success') {
        await this.getData()
        this.$toast.success('Repositories synced successfully.')
      } else if (data.status === 'failure') {
        this.$toast.danger('Error while syncing repositories. Please try again.')
      }
      this.repoSyncLoading = false
    })
  }

  beforeDestroy(): void {
    this.$socket.$off('repo-sync')
    this.repoSyncLoading = false
  }
}
</script>
