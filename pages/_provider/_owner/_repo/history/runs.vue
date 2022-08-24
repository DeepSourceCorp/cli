<template>
  <div class="pb-12">
    <sub-nav v-if="transformsAllowed" active="runs"></sub-nav>
    <div class="grid grid-cols-1 p-4 gap-y-4">
      <run-branches
        v-if="defaultBranchRun && !mainBranchFetching"
        :key="defaultBranchRun.branchName"
        :run="defaultBranchRun"
        :branchRunCount="defaultBranchRunCount"
        :class="{ 'opacity-30': expandedBranch && expandedBranch !== defaultBranchRun.branchName }"
        @expanded="updateExpandedBranch"
      >
      </run-branches>
      <template v-if="!fetching">
        <template v-if="groupedRunList.edges.length !== 0">
          <template v-for="run in groupedRunList.edges">
            <run-branches
              v-if="run.node.branchName !== repository.defaultBranchName"
              :key="run.node.branchName"
              :run="run.node"
              :class="{
                'opacity-30 pointer-events-none':
                  expandedBranch && expandedBranch !== run.node.branchName
              }"
              @expanded="updateExpandedBranch"
            >
            </run-branches>
          </template>
        </template>
        <template v-else>
          <div class="flex items-center justify-center text-center min-h-102">
            <div class="max-w-lg">
              <span class="text-2xl font-semibold text-vanilla-300">No Runs to Show</span>
              <p class="text-vanilla-400">
                If you have recently added this repository it may take a while for the first run to
                complete and show results
              </p>
            </div>
          </div>
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
        :totalPages="pageCount"
        :totalVisible="5"
        :page="currentPage"
        @selected="updatePage"
      ></z-pagination>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, namespace, mixins } from 'nuxt-property-decorator'
import { ZPagination } from '@deepsourcelabs/zeal'
// Components
import { SubNav, RunBranches } from '@/components/History'
// Store & Types
import { RunListActions } from '@/store/run/list'
import { Maybe, Run, RunConnection, RunEdge } from '~/types/types'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RouteQueryMixin from '~/mixins/routeQueryMixin'
import { AppFeatures } from '~/types/permTypes'

const runListStore = namespace('run/list')

const VISIBLE_PAGES = 5

@Component({
  components: {
    RunBranches,
    SubNav,
    ZPagination
  },
  layout: 'repository'
})
export default class Runs extends mixins(RepoDetailMixin, RouteQueryMixin) {
  @runListStore.State
  groupedRunList: RunConnection // Stores all the runs groubed by branch

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
  public mainBranchFetching = true
  public currentPage = 1
  public pageSize = 30
  public expandedBranch = ''

  get totalVisible(): number {
    return this.pageCount >= VISIBLE_PAGES ? VISIBLE_PAGES : this.pageCount
  }

  public async updatePage(pageNumber: number): Promise<void> {
    this.currentPage = pageNumber
    if (pageNumber !== 1) {
      this.addFilter('page', pageNumber)
    }
    await this.fetchRuns(false)
  }

  get pageCount(): number {
    if (this.groupedRunList && this.groupedRunList.totalCount) {
      return Math.ceil(this.groupedRunList.totalCount / this.pageSize)
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
    await this.fetchRepoDetails(this.baseRouteParams)
    this.mainBranchFetching = true
    await this.fetchMainBranch()
    this.mainBranchFetching = false
    await this.fetchRuns()
    this.fetching = false
  }

  async fetchRuns(refetch = false): Promise<void> {
    await this.$store.dispatch(`run/list/${RunListActions.FETCH_GROUPED_RUN_LIST}`, {
      ...this.baseRouteParams,
      currentPageNumber: this.currentPage,
      limit: this.pageSize,
      refetch
    })
  }

  refetchRuns(): void {
    this.fetchRuns(true)
    this.fetchMainBranch(true)
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
