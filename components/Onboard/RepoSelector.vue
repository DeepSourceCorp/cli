<template>
  <div>
    <p class="w-full text-base text-left text-vanilla-300">
      Pick the repository that you would like to run your first analysis on.
    </p>
    <div class="flex flex-col w-full h-auto md:h-full gap-y-3">
      <z-input
        v-model="searchCandidate"
        icon="search"
        iconPosition="left"
        spacing="tight"
        backgroundColor="ink-300"
        placeholder="Search for a repository by name..."
        :showBorder="false"
        @debounceInput="fetchRepositories"
      >
        <template slot="left">
          <z-icon icon="search" size="small" class="ml-1.5"></z-icon>
        </template>
      </z-input>
      <div class="text-xs text-vanilla-400">
        {{ getRepoCountText() }}
      </div>
      <!-- Repo list -->
      <div
        class="flex flex-col overflow-scroll h-96 md:h-72"
        :class="repoCount === 0 ? 'space-y-3 pr-0' : 'pr-3'"
      >
        <template v-if="repoCount">
          <repo-list-item
            class="p-1 px-2 rounded-sm"
            v-for="(repo, index) in repositoriesToOnboard"
            :key="index"
            :handleName="repo.ownerLogin"
            :language="repo.supportedAnalyzers ? repo.supportedAnalyzers[0] : ''"
            :analyzer="repo.primaryAnalyzer"
            :icon="repo.isPrivate ? 'lock' : 'globe'"
            :repoName="repo.name"
            @click="pickRepo(repo)"
          >
          </repo-list-item>
        </template>
        <div
          v-else
          class="flex flex-col items-center justify-center flex-1 w-full p-6 text-sm text-center border border-dashed text-vanilla-400 border-ink-200 rounded-md"
        >
          <div v-if="loading" class="flex flex-col space-y-2 items-center">
            <z-icon class="animate-spin" icon="spin-loader"></z-icon>
            <span class="text-vanilla-400">Loading repositories</span>
          </div>
          <div v-else class="space-y-5">
            <template v-if="searchCandidate">
              We couldn’t find any matches for "{{ searchCandidate }}". <br />
              Double check your search for any typos or spelling errors.
            </template>
            <template v-else>
              We couldn’t find any repositories linked to this account. <br />You can try syncing
              them
            </template>
            <div class="space-y-5" v-if="!loading">
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
              <p
                class="text-xs text-vanilla-400"
                :class="repoSyncLoading ? 'visible' : 'invisible'"
              >
                This usually takes less than a minute, the changes will reflect automatically, you
                don't have to refresh the browser
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZButton, ZInput, ZDivider, ZIcon } from '@deepsourcelabs/zeal'
import { RepoListItem } from '.'

// types
import { Repository } from '~/types/types'

import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import RepoListMixin from '~/mixins/repoListMixin'

import { resolveNodes } from '~/utils/array'

@Component({
  components: {
    ZButton,
    ZInput,
    ZDivider,
    ZIcon,
    RepoListItem
  },
  model: {
    event: 'pickRepo'
  }
})
export default class RepoSelector extends mixins(OwnerDetailMixin, RepoListMixin) {
  searchCandidate = null
  repoSyncLoading = false

  async fetch(): Promise<void> {
    const { login, provider } = this.$route.params
    await this.fetchOwnerDetails({
      provider,
      login
    })
    await this.fetchRepositories()
  }

  async fetchRepositories(): Promise<void> {
    await this.fetchNewRepoList({
      login: this.$route.params.login,
      provider: this.$route.params.provider,
      currentPageNumber: 1,
      limit: 30,
      query: this.searchCandidate ? this.searchCandidate : null
    })
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
        await this.fetchRepositories()
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

  pickRepo(repo: Repository): void {
    this.$emit('pickRepo', repo)
  }

  get repoCount(): number {
    return this.newRepos.edges.length
  }

  get repositoriesToOnboard(): Repository[] {
    return resolveNodes(this.newRepos) as Repository[]
  }

  getRepoCountText(): string {
    if (this.searchCandidate) {
      return `${this.newRepos.totalCount} repositories found for "${this.searchCandidate}"`
    }
    return `${this.newRepos.totalCount} repositories available`
  }
}
</script>
