<template>
  <div class="pb-28 lg:pb-12 space-y-4">
    <sub-nav v-if="transformsAllowed" active="runs" class="hidden lg:block" />
    <run-filters
      :open-count="openPrCount"
      :closed-count="closedPrCount"
      :pr-status="prStatusFilter"
      :run-status="runStatusFilter"
      :search-text="searchText"
      :loading="initialFetch"
      class="px-4"
      @runs-filter-update="updatePrFilters"
    />
    <div class="space-y-4 px-4">
      <run-branches
        v-if="defaultBranchRun && !initialFetch"
        :key="defaultBranchRun.branchName"
        :generalized-run="generalizeRun(defaultBranchRun, true)"
        :branch-run-count="defaultBranchRunCount"
        :is-expanded="expandedBranch === defaultBranchRun.branchName"
        :class="{
          'opacity-30 pointer-events-none':
            expandedBranch && expandedBranch !== defaultBranchRun.branchName
        }"
        @expanded="updateExpandedBranch"
      />
      <template v-if="!fetching">
        <template v-if="prListNodes.length !== 0">
          <run-branches
            v-for="pr in prListNodes"
            :key="pr.id"
            :generalized-run="generalizePR(pr)"
            :is-expanded="expandedBranch === pr.branch"
            :class="{
              'opacity-30 pointer-events-none': expandedBranch && expandedBranch !== pr.branch
            }"
            @expanded="updateExpandedBranch"
          />
        </template>
        <template v-else>
          <lazy-empty-state
            v-if="searchText"
            :title="`No results found for '${searchText}'`"
            subtitle="Please try changing the search query or clearing the filters."
            :webp-image-path="require('~/assets/images/ui-states/directory/empty-search.webp')"
            :png-image-path="require('~/assets/images/ui-states/directory/empty-search.gif')"
            :show-border="true"
          />
          <lazy-empty-state
            v-else
            :title="`No runs on ${prStatusFilterCopy} to show`"
            subtitle="If you have recently added this repository it may take a while for the first run to
                complete and show results."
            :webp-image-path="require('~/assets/images/ui-states/runs/no-recent-analyses.webp')"
            :png-image-path="require('~/assets/images/ui-states/runs/no-recent-analyses.png')"
            :show-border="true"
          />
        </template>
      </template>
      <template v-else>
        <div v-for="key in pageSize" :key="key" class="-mx-1 space-y-2 animate-pulse">
          <div class="w-full h-20 rounded-md bg-ink-200"></div>
        </div>
      </template>
    </div>
    <div v-if="pageCount > 1" class="grid place-content-center">
      <z-pagination
        class="flex justify-center w-full xl:w-4/6"
        :total-pages="pageCount"
        :total-visible="5"
        :page="currentPage"
        @selected="updatePage"
      />
    </div>

    <floating-button-mobile :nav-items="navItems" />
  </div>
</template>

<script lang="ts">
import { Component, namespace, mixins } from 'nuxt-property-decorator'
import { ZPagination } from '@deepsource/zeal'
// Components
import { SubNav, RunBranches } from '@/components/History'
// Store & Types
import { RepoStatsT, RunListActions } from '@/store/run/list'
import {
  Maybe,
  Pr,
  PrConnection,
  PrStateChoices,
  Repository,
  Run,
  RunConnection,
  RunEdge,
  RunStatusChoice
} from '~/types/types'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RouteQueryMixin from '~/mixins/routeQueryMixin'
import { AppFeatures } from '~/types/permTypes'
import { generalizeRun, generalizePR, generalizeRunStatuses } from '~/utils/runs'
import { resolveNodes } from '~/utils/array'
import { prCopyText } from '~/utils/ui'
import { RunDetailMutations } from '~/store/run/detail'

const runListStore = namespace('run/list')

const VISIBLE_PAGES = 5

@Component({
  components: {
    RunBranches,
    SubNav,
    ZPagination
  },
  layout: 'repository',
  scrollToTop: true,
  methods: { generalizeRun, generalizePR }
})
export default class Runs extends mixins(RepoDetailMixin, RouteQueryMixin) {
  @runListStore.State
  prList: PrConnection

  @runListStore.State
  repoPrStats: RepoStatsT

  @runListStore.State('loading')
  queryLoading: boolean

  @runListStore.State
  branchRunList: Record<string, RunConnection>

  @runListStore.Action(RunListActions.FETCH_BRANCH_RUNS_LIST)
  fetchBranchRuns: (args: {
    provider: string
    owner: string
    name: string
    branchName: string
    limit?: number
    refetch?: boolean
  }) => Promise<void>

  public fetching = true
  public initialFetch = true
  public currentPage = 1
  public pageSize = 30
  public expandedBranch = ''
  public prStatusFilter: PrStateChoices = PrStateChoices.Open
  public runStatusFilter: RunStatusChoice | null = null
  public searchText: string | null = null

  get totalVisible(): number {
    return this.pageCount >= VISIBLE_PAGES ? VISIBLE_PAGES : this.pageCount
  }

  public async updatePage(pageNumber: number): Promise<void> {
    this.currentPage = pageNumber
    if (pageNumber !== 1) {
      this.addFilters({ page: pageNumber })
    }
    await this.fetchRuns(false)
  }

  get pageCount(): number {
    if (this.prList && this.prList.totalCount) {
      return Math.ceil(this.prList.totalCount / this.pageSize)
    }
    return 0
  }

  created(): void {
    if (this.$route.query.page) {
      this.currentPage = Number(this.$route.query.page)
    }
  }

  updateExpandedBranch(branchName: string): void {
    this.expandedBranch = branchName
  }

  async fetch(): Promise<void> {
    this.fetching = true

    const { pageRefetchStatus } = this.$store.state.run.detail
    const refetch = pageRefetchStatus.runs.status

    await Promise.all([
      this.fetchRepoDetails(this.baseRouteParams),
      this.fetchMainBranch(refetch),
      this.fetchRuns(refetch)
    ])
    this.initialFetch = false
    this.fetching = false

    if (refetch) {
      // Reset the state
      this.$store.commit(`run/detail/${RunDetailMutations.SET_PAGE_REFETCH_STATUS}`, {
        ...pageRefetchStatus,
        runs: { status: false }
      })
    }
  }

  async fetchRuns(refetch = false): Promise<void> {
    const { name, provider, owner } = this.baseRouteParams

    await this.$store.dispatch(`run/list/${RunListActions.FETCH_PR_LIST}`, {
      name,
      owner,
      provider: this.$providerMetaMap[provider].value,
      currentPageNumber: this.currentPage,
      prStatus: this.prStatusFilter,
      runStatus: this.runStatusFilter
        ? generalizeRunStatuses(this.runStatusFilter).statusChoice
        : null,
      q: this.searchText,
      limit: this.pageSize,
      refetch
    })
  }

  async refetchRuns(): Promise<void> {
    this.fetching = true
    await Promise.all([this.fetchRuns(true), this.fetchMainBranch(true)])
    this.fetching = false
  }

  mounted(): void {
    this.$socket.$on('repo-analysis-updated', this.refetchRuns)
  }

  beforeDestroy(): void {
    this.$socket.$off('repo-analysis-updated', this.refetchRuns)
  }

  async fetchMainBranch(refetch = false): Promise<void> {
    if (this.repository.defaultBranchName) {
      await this.fetchBranchRuns({
        ...this.baseRouteParams,
        branchName: this.repository.defaultBranchName,
        limit: 1,
        refetch: refetch
      })
    }
  }

  /**
   * Update filters for the list of PRs and refetch them
   *
   * @param {{ prState: PrStateChoices; runStatus: RunStatusChoice | null; searchText: string}} prFilters - An object containing filters emitted by `RunFilters` component
   * @returns {void}
   */
  updatePrFilters(prFilters: {
    prState: PrStateChoices
    runStatus: RunStatusChoice | null
    searchText: string
  }): void {
    // Reset expanded branch
    this.updateExpandedBranch('')
    const { prState, runStatus, searchText } = prFilters
    this.prStatusFilter = prState ?? this.prStatusFilter
    this.searchText = searchText === undefined ? this.searchText : searchText
    this.runStatusFilter = runStatus === undefined ? this.runStatusFilter : runStatus
    this.refetchRuns()
  }

  get defaultBranchRun(): Maybe<Run> {
    let runs: Array<Maybe<RunEdge>> = []
    if (this.repository.defaultBranchName) {
      runs = this.branchRunList[this.repository.defaultBranchName]?.edges || []
    }
    if (runs.length && runs[0] && runs[0].node) {
      return runs[0].node
    }
    return null
  }

  get defaultBranchRunCount(): number {
    if (this.repository.defaultBranchName) {
      return this.branchRunList[this.repository.defaultBranchName]?.totalCount || 0
    }

    return 0
  }

  get transformsAllowed(): boolean {
    const { provider } = this.$route.params
    return this.$gateKeeper.provider(AppFeatures.TRANSFORMS, provider)
  }

  get prListNodes(): Pr[] {
    return resolveNodes(this.prList) as Pr[]
  }

  get openPrCount() {
    return this.repoPrStats?.openPrCount ?? '0'
  }

  get closedPrCount() {
    return this.repoPrStats?.closedPrCount ?? '0'
  }

  get prStatusFilterCopy() {
    return `${this.prStatusFilter.toLowerCase()} ${prCopyText(this.provider)}s`
  }

  get provider(): string {
    return this.$route.params.provider
  }

  get navItems(): Array<Record<string, unknown>> {
    const items = [
      {
        label: 'Analysis runs',
        routePath: this.$generateRoute(['history', 'runs']),
        isSupported: true
      },
      {
        label: 'Transforms',
        routePath: this.$generateRoute(['history', 'transforms']),
        isSupported: this.$gateKeeper.provider(AppFeatures.TRANSFORMS, this.provider)
      }
    ]

    return items.filter((item) => {
      const { isSupported } = item

      if (isSupported) {
        return item
      }
    })
  }

  head(): Record<string, string> {
    const { repo, owner } = this.$route.params
    return {
      title: `History • ${owner}/${repo}`,
      description:
        'DeepSource is an automated code review tool that helps developers automatically find and fix issues in their code.'
    }
  }
}
</script>
