<template>
  <div class="max-w-3xl p-4 space-y-4">
    <h2 class="text-lg">All Repositories</h2>
    <div class="space-y-2">
      <div class="flex space-x-2">
        <z-input
          v-model="searchCandidate"
          icon="search"
          :show-border="false"
          background-color="ink-300"
          size="small"
          class="w-full"
          @debounceInput="$fetch"
          placeholder="Search for repository name"
        >
          <template slot="left">
            <z-icon icon="search" size="small" class="ml-1.5" />
          </template>
        </z-input>
        <z-button
          v-if="canActivateRepo"
          @click="showAddRepoModal = true"
          button-type="primary"
          size="small"
          icon="plus"
          >Activate new repository</z-button
        >
      </div>
      <div class="text-xs text-vanilla-400">
        Showing
        <z-menu direction="right" class="inline-block text-vanilla-100">
          <template #trigger="{ toggle }">
            <button
              slot="trigger"
              class="flex items-center px-1 space-x-1 rounded-md outline-none bg-ink-200 text-vanilla-400 focus:outline-none"
              @click="toggle"
            >
              {{ pageSize }}
              <z-icon icon="chevron-down" size="small" />
            </button>
          </template>
          <template slot="body">
            <div class="px-2 py-1 space-y-1">
              <h6 class="font-semibold uppercase text-xxs text-vanilla-400">
                Select Repos to show
              </h6>
              <div class="grid grid-cols-3 gap-2">
                <z-button
                  v-for="opt in pageSizeOptions"
                  :key="opt"
                  button-type="secondary"
                  size="small"
                  @click="updatePageSize(opt)"
                  :disabled="pageSize == opt"
                  >{{ opt }}</z-button
                >
              </div>
            </div>
          </template>
        </z-menu>
        of {{ repositoryList.totalCount }} activated repositories
      </div>
    </div>
    <template v-if="repoListloading">
      <div v-for="idx in pageSize" :key="idx" class="rounded h-17 bg-ink-300 animate-pulse"></div>
    </template>
    <transition-group
      v-else-if="repositoryList.edges && repositoryList.edges.length"
      move-class="duration-200 transform"
      tag="ul"
      class="space-y-4"
    >
      <repo-card
        v-for="repo in repositoryList.edges"
        v-bind="repo.node"
        size="small"
        @star-repo="starRepo"
        @un-star-repo="unStarRepo"
        :key="repo.node.id"
        :allow-star="true"
      />
    </transition-group>
    <lazy-empty-state
      v-else-if="searchCandidate"
      :title="`No results found for '${searchCandidate}'`"
      :webp-image-path="require('~/assets/images/ui-states/directory/empty-search.webp')"
      :png-image-path="require('~/assets/images/ui-states/directory/empty-search.gif')"
      subtitle="Please try changing your search query."
    />
    <lazy-empty-state
      v-else
      :subtitle="`DeepSource doesn't have access to any repositories from your account. Please check your settings on ${activeProviderName}.`"
      :show-border="true"
      title="No repositories"
    />
    <z-pagination
      class="flex justify-center"
      v-if="pageCount > 1 && !repoListloading"
      :total-pages="pageCount"
      :total-visible="5"
      :page="currentPage"
      @selected="updateCurrentPage"
    />
    <add-repo-modal :show-modal="showAddRepoModal" @close="showAddRepoModal = false" />
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZInput, ZButton, ZIcon, ZMenu, ZMenuItem, ZPagination } from '@deepsource/zeal'
import { RepoCard, AddRepoModal } from '@/components/AddRepo'

// types
import { TeamMemberRoleChoices } from '~/types/types'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import RepoListMixin from '~/mixins/repoListMixin'
import { TeamPerms } from '~/types/permTypes'

@Component({
  components: {
    ZInput,
    ZButton,
    ZIcon,
    ZMenu,
    ZMenuItem,
    RepoCard,
    ZPagination,
    AddRepoModal
  },
  middleware: ['validateProvider'],
  layout: 'dashboard'
})
export default class AllRepos extends mixins(ActiveUserMixin, RepoListMixin) {
  public searchCandidate = ''
  public pageSize = 10
  public repoListloading = false
  public showAddRepoModal = false
  public modalSearch: string
  public timeout: ReturnType<typeof setTimeout>
  public currentPage = 1
  private pageSizeOptions = [5, 10, 30]

  mounted() {
    const { owner, provider } = this.$route.params
    this.pageSize =
      (this.$localStore.get(`${provider}-${owner}-all-repos`, `currentPageSize`) as number) || 10
  }

  async starRepo(repoId: string): Promise<void> {
    await this.updateStarredRepo({ repoId, action: 'ADD' })
    this.getData(true)
  }

  async unStarRepo(repoId: string): Promise<void> {
    await this.updateStarredRepo({ repoId, action: 'REMOVE' })
    this.getData(true)
  }

  async getData(refetch = false): Promise<void> {
    const { owner, provider } = this.$route.params
    if (process.client) {
      this.pageSize =
        (this.$localStore.get(`${provider}-${owner}-all-repos`, `currentPageSize`) as number) || 10
    }
    await this.fetchRepoList({
      provider,
      login: owner,
      limit: this.pageSize,
      currentPageNumber: this.currentPage,
      query: this.searchCandidate ? this.searchCandidate : null,
      refetch
    })
  }

  get pageCount(): number {
    if (this.repositoryList.totalCount) {
      return Math.ceil(this.repositoryList.totalCount / this.pageSize)
    }

    return 0
  }

  get canActivateRepo(): boolean {
    const role = this.activeDashboardContext.role as TeamMemberRoleChoices
    return this.$gateKeeper.team(TeamPerms.ACTIVATE_ANALYSIS, role)
  }

  updatePageSize(newSize: number): void {
    const { owner, provider } = this.$route.params
    this.currentPage = 1
    this.$localStore.set(`${provider}-${owner}-all-repos`, `currentPageSize`, newSize)
    this.$fetch()
  }

  updateCurrentPage(pageNumber: number): void {
    this.currentPage = pageNumber
    this.$fetch()
  }

  async fetch(): Promise<void> {
    this.repoListloading = true
    await this.getData()
    this.repoListloading = false
  }

  head(): Record<string, string> {
    const { owner } = this.$route.params
    return {
      title: `All Repositories • ${owner}`,
      description:
        'DeepSource is an automated code review tool that helps developers automatically find and fix issues in their code.'
    }
  }
}
</script>
