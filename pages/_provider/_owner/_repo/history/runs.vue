<template>
  <div class="pb-12">
    <sub-nav active="runs"></sub-nav>
    <div class="grid gap-4 w-full p-4">
      <run-branches
        v-if="defaultBranchRun"
        :key="defaultBranchRun.branchName"
        :run="defaultBranchRun"
        :branchRunCount="defaultBranchRunCount"
      >
      </run-branches>
      <template v-if="!fetching">
        <template v-if="groupedRunList.edges.length !== 0">
          <template v-for="run in groupedRunList.edges">
            <run-branches
              v-if="run.node.branchName !== repository.defaultBranchName"
              :key="run.node.branchName"
              :run="run.node"
            >
            </run-branches>
          </template>
        </template>
        <template v-else>
          <div class="flex items-center justify-center min-h-102 text-center">
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
        <div v-for="key in pageSize" :key="key" class="space-y-2 animate-pulse -mx-1">
          <div class="flex space-x-2">
            <div class="h-6 w-24 bg-ink-200 rounded-md"></div>
            <div class="h-6 w-40 bg-ink-200 rounded-md"></div>
          </div>
          <div class="h-20 w-full bg-ink-200 rounded-md"></div>
        </div>
      </template>
    </div>
    <div v-if="pageCount > 1" class="grid place-content-center">
      <z-pagination
        class="flex justify-center w-full xl:w-4/6"
        :totalPages="pageCount"
        :totalVisible="totalVisible"
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
  fetchBranchRuns: (args: Record<string, string | number>) => Promise<void>

  private fetching = true
  private mainBranchFetching = true
  private currentPage = 1
  private pageSize = 30

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
    this.setAnalysisUpdateEvent()
  }

  get baseParams(): { name: string; provider: string; owner: string } {
    const { provider, owner, repo } = this.$route.params
    return {
      name: repo,
      provider,
      owner
    }
  }

  async fetch(): Promise<void> {
    await this.fetchRepoDetails(this.baseParams)
    await this.fetchMainBranch()
    await this.fetchRuns()
  }

  async fetchRuns(refetch = false): Promise<void> {
    this.fetching = true

    await this.$store.dispatch(`run/list/${RunListActions.FETCH_GROUPED_RUN_LIST}`, {
      ...this.baseParams,
      currentPageNumber: this.currentPage,
      limit: this.pageSize,
      refetch
    })

    this.fetching = false
  }

  async fetchMainBranch(): Promise<void> {
    if (this.repository.defaultBranchName) {
      this.mainBranchFetching = true
      await this.fetchBranchRuns({
        ...this.baseParams,
        branchName: this.repository.defaultBranchName,
        limit: 1
      }).then(() => {
        this.mainBranchFetching = false
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

  head(): Record<string, string> {
    const { repo, owner } = this.$route.params
    return {
      title: `History • ${owner}/${repo}`,
      description:
        'DeepSource is an automated code review tool that helps developers automatically find and fix issues in their code.'
    }
  }
  mounted(): void {
    this.$socket.$on('repo-analysis-updated', (data: Record<string, string>) => {
      if (this.repository.id === data.repository_id) {
        this.fetchRuns(true)
      }
    })
  }
}
</script>
