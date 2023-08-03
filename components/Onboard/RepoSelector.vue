<template>
  <div>
    <p class="w-full text-left text-base text-vanilla-300">
      Pick the repository that you would like to run your first analysis on.
    </p>
    <div class="flex h-auto w-full flex-col gap-y-3 md:h-full">
      <z-input
        v-model="searchCandidate"
        icon="search"
        icon-position="left"
        spacing="tight"
        background-color="ink-300"
        placeholder="Search for a repository by name..."
        :show-border="false"
        @debounceInput="fetchRepositories"
      >
        <template #left>
          <z-icon icon="search" size="small" class="ml-1.5" />
        </template>
      </z-input>
      <div class="text-xs text-vanilla-400">
        {{ getRepoCountText() }}
      </div>
      <!-- Repo list -->
      <div
        class="flex h-96 flex-col overflow-scroll md:h-72"
        :class="repoCount === 0 ? 'space-y-3 pr-0' : 'pr-3'"
      >
        <template v-if="repoCount">
          <repo-list-item
            v-for="(repo, index) in repositoriesToOnboard"
            :key="index"
            class="rounded-sm p-1 px-2"
            :handle-name="repo.ownerLogin"
            :language="repo.supportedAnalyzers ? repo.supportedAnalyzers[0] : ''"
            :analyzer="repo.primaryAnalyzer"
            :icon="repo.isPrivate ? 'z-lock' : 'globe'"
            :repo-name="repo.name"
            @click="pickRepo(repo)"
          />
        </template>
        <div
          v-else
          class="flex w-full flex-1 flex-col items-center justify-center rounded-md border border-dashed border-slate-400 p-6 text-center text-sm text-vanilla-400"
        >
          <div v-if="loading" class="flex flex-col items-center space-y-2">
            <z-icon class="animate-spin" icon="spin-loader" />
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
            <div v-if="!loading" class="space-y-5">
              <z-button
                v-if="repoSyncLoading"
                size="small"
                class="flex w-48 items-center"
                :disabled="true"
              >
                <z-icon icon="spin-loader" class="mr-2 animate-spin" size="small" color="ink-400" />
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
import { RepoListItem } from '.'

// types
import { Repository } from '~/types/types'

import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import RepoListMixin from '~/mixins/repoListMixin'

import { resolveNodes } from '~/utils/array'
import RepoSyncMixin from '~/mixins/repoSyncMixin'

@Component({
  components: {
    RepoListItem
  },
  model: {
    event: 'pickRepo'
  }
})
export default class RepoSelector extends mixins(OwnerDetailMixin, RepoListMixin, RepoSyncMixin) {
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

  /**
   * Proxy for fetch repos
   *
   * @return {Promise<void>}
   */
  async fetchReposAfterSync(): Promise<void> {
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

  pickRepo(repo: Repository): void {
    this.$emit('pickRepo', repo)
  }

  get repoCount(): number {
    return this.newRepos.edges.length
  }

  get repositoriesToOnboard(): Repository[] {
    return resolveNodes(this.newRepos)
  }

  getRepoCountText(): string {
    if (this.searchCandidate) {
      return `${this.newRepos.totalCount} repositories found for "${this.searchCandidate}"`
    }
    return `${this.newRepos.totalCount} repositories available`
  }
}
</script>
