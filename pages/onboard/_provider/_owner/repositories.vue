<template>
  <section class="relative space-y-4">
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
        <z-icon icon="search" size="small" class="ml-1.5" />
      </template>
    </z-input>
    <div class="grid grid-cols-1 gap-4 pb-20 overflow-y-scroll max-h-102">
      <template v-if="$fetchState.pending || searching">
        <div class="h-20 rounded-md bg-ink-300 animate-pulse" v-for="ii in 5" :key="ii"></div>
      </template>
      <template v-else-if="repositoriesToOnboard && repositoriesToOnboard.length">
        <repo-card
          v-for="repo in repositoriesToOnboard"
          :key="repo.id"
          v-bind="repo"
          :is-link="false"
          :allow-star="false"
          :show-analyzers="true"
          :lastAnalyzedAt="null"
          :latestCommitOid="null"
          size="small"
          class="cursor-pointer hover:bg-ink-300"
          @click="selectRepoForOnboarding(repo)"
        />
      </template>
      <empty-state
        v-else
        class="border-2 border-dashed rounded-md border-ink-200"
        :title="
          searchCandidate
            ? `Could not find '${searchCandidate}'`
            : `Could not find any repositories`
        "
        :subtitle="
          searchCandidate
            ? `Please check the search term for typos, or sync your repositories from ${vcsProviderName}`
            : `Sync your repositories from ${vcsProviderName} if you don't see them here`
        "
      >
        <template #action>
          <z-button
            size="small"
            icon="refresh-ccw"
            label="Sync repositories"
            loading-label="Syncing repositories"
            :is-loading="repoSyncLoading"
            @click="syncRepos"
          />
          <z-button
            button-type="secondary"
            size="small"
            label="Contact support"
            icon="support"
            :to="`mailto:${$config.supportEmail}`"
          />
        </template>
      </empty-state>
    </div>
    <div
      class="absolute bottom-0 w-full pt-12 pb-0 bg-gradient-to-t from-ink-400 via-ink-400 to-transparent"
    ></div>
  </section>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZInput, ZButton, ZIcon } from '@deepsourcelabs/zeal'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import RepoListMixin from '~/mixins/repoListMixin'
import { Repository } from '~/types/types'
import { RepoCard } from '~/components/AddRepo'
import { resolveNodes } from '~/utils/array'
import MetaMixin from '~/mixins/metaMixin'
import RepoSyncMixin from '~/mixins/repoSyncMixin'

/**
 * Page in onboarding step to select the repository
 */
@Component({
  components: {
    ZInput,
    ZButton,
    ZIcon,
    RepoCard
  },
  middleware: ['restrictOnboarding'],
  meta: {
    auth: {
      strict: true,
      redirectToLogin: true
    }
  }
})
export default class OnboardRepositories extends mixins(
  OwnerDetailMixin,
  RepoListMixin,
  MetaMixin,
  RepoSyncMixin
) {
  public searchCandidate = ''
  public searching = false

  metaTitle = 'Pick a repository • DeepSource'
  metaDescription = 'Select what type of issues do you want to track on DeepSource'

  /**
   * Start onboarding with the selected repo
   * @param {Repository} repo
   * @return {void}
   */
  selectRepoForOnboarding(repo: Repository): void {
    const { provider, owner } = this.$route.params
    this.$router.push(['', 'onboard', provider, owner, repo.name, 'preferences'].join('/'))
  }

  /**
   * Fetch the owner details and repo list
   * @return {Promise<void>}
   */
  async fetch(): Promise<void> {
    const { owner, provider } = this.$route.params
    await this.fetchOwnerDetails({
      provider,
      login: owner
    })
    await this.fetchRepositories()
  }

  /**
   * Fetch, search a paginated list
   * @return {Promise<void>}
   */
  async fetchRepositories(): Promise<void> {
    this.searching = true
    const { owner, provider } = this.$route.params
    await this.fetchNewRepoList({
      login: owner,
      provider,
      currentPageNumber: 1,
      limit: 30,
      query: this.searchCandidate ? this.searchCandidate : null
    })
    this.searching = false
  }

  /**
   * Proxy for fetch repos
   *
   * @return {Promise<void>}
   */
  async fetchReposAfterSync(): Promise<void> {
    await this.fetchRepositories()
  }

  /**
   * A resolved list of respositories from GQL response
   * @return {Repository[]}
   */
  get repositoriesToOnboard(): Repository[] {
    return resolveNodes(this.newRepos) as Repository[]
  }

  /**
   * Display name for the current VCS provider
   * @return {string}
   */
  get vcsProviderName(): string {
    const { provider } = this.$route.params
    return this.$providerMetaMap[provider].text
  }
}
</script>
