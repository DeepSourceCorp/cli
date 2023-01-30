<template>
  <main class="pb-6 issue-page">
    <div class="z-20 p-4 md:sticky top-bar-offset bg-ink-400 border-b border-slate-400">
      <!-- Issue details -->
      <div class="flex flex-col space-y-3 xl:flex-row xl:space-y-0 mb-px">
        <div class="w-full space-y-2.5" v-if="$fetchState.pending || loading">
          <!-- Left Section -->
          <div class="w-3/5 h-8 rounded-md md:w-4/5 bg-ink-300 animate-pulse"></div>
          <div class="flex w-1/3 space-x-2">
            <div class="w-1/3 h-4 rounded-md bg-ink-300 animate-pulse"></div>
            <div class="w-1/3 h-4 rounded-md bg-ink-300 animate-pulse"></div>
          </div>
        </div>
        <!-- issue header and actions -->
        <div v-else class="flex justify-between w-full relative z-20">
          <issue-details-header
            :issueType="singleIssue.issueType"
            :shortcode="singleIssue.shortcode"
            :title="singleIssue.title"
            :tags="singleIssue.tags"
            :severity="singleIssue.severity"
            :firstSeen="issue.firstSeen"
            :lastSeen="issue.lastSeen"
            :count="issueOccurrences.totalCount"
            :issue-priority="issuePriority"
            :can-edit-priority="canEditPriority"
            @priority-edited="editPriority"
          ></issue-details-header>
          <div class="flex items-start justify-end gap-x-1.5">
            <issue-actions
              class="ml-4"
              :issue="singleIssue"
              :checkId="currentCheck ? currentCheck.id : ''"
              :shortcode="$route.params.issueId"
              @ignoreIssues="ignoreIssues"
              :repository="repository"
              :next-issue="nextIssue"
              :previous-issue="previousIssue"
            ></issue-actions>
          </div>
        </div>
      </div>
    </div>
    <div class="p-4">
      <div class="flex" v-if="$fetchState.pending || loading">
        <div class="w-full space-y-4 lg:w-4/6">
          <div
            v-for="ii in 3"
            :key="ii"
            class="w-full rounded-md h-36 bg-ink-300 animate-pulse"
          ></div>
        </div>
        <div class="hidden w-2/6 h-full px-4 lg:block">
          <div class="rounded-md h-44 bg-ink-300 animate-pulse"></div>
        </div>
      </div>
      <div v-else class="grid grid-cols-3">
        <issue-list
          v-bind="issueOccurrences"
          :description="singleIssue.descriptionRendered"
          :check-id="currentCheck ? currentCheck.id : ''"
          :can-ignore-issues="canIgnoreIssues"
          :page-size="pageSize"
          :total-count="checkIssues.totalCount"
          :start-page="queryParams.page"
          :search-value="queryParams.q"
          :blob-url-root="run.blobUrlRoot"
          :issue-index="issueIndex"
          class="col-span-3 lg:col-span-2"
          @search="(val) => (searchCandidate = val)"
          @sort="(val) => (sort = val)"
          @page="(val) => (currentPage = val)"
        ></issue-list>
        <issue-description
          :description="singleIssue.descriptionRendered"
          class="col-span-1"
        ></issue-description>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { Component, Watch, mixins } from 'nuxt-property-decorator'

import { ZTag, ZTabs, ZTabList, ZTabPane, ZTabPanes, ZTabItem, ZIcon } from '@deepsource/zeal'

import LinkToPrev from '@/components/LinkToPrev.vue'
import { IssueDetailsHeader, IssueActions, IssueDescription } from '@/components/RepoIssues/index'
import { SubNav } from '@/components/History/index'
import { IssueList } from '@/components/RepoIssues'

// Import State & Types
import {
  Check,
  Maybe,
  CheckEdge,
  IssuePriority,
  IssuePriorityLevel,
  CheckIssueEdge,
  CheckIssueConnection,
  IssueEdge
} from '~/types/types'
import RouteQueryMixin from '~/mixins/routeQueryMixin'
import IssueDetailMixin from '~/mixins/issueDetailMixin'
import { IssueTypeOptions } from '~/mixins/issueCategoryMixin'
import RunDetailMixin from '~/mixins/runDetailMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import { fromNow } from '~/utils/date'
import { RepoPerms, TeamPerms } from '~/types/permTypes'
import { IssuePriorityLevelVerbose } from '~/types/issuePriorityTypes'
import { IssueLink } from '~/mixins/issueListMixin'
import { RunDetailMutations } from '~/store/run/detail'

const PAGE_SIZE = 25

@Component({
  components: {
    ZTag,
    ZTabs,
    ZTabList,
    ZTabPane,
    ZTabPanes,
    ZTabItem,
    ZIcon,
    LinkToPrev,
    IssueDetailsHeader,
    SubNav,
    IssueList,
    IssueActions,
    IssueDescription
  },
  layout: 'repository',
  methods: {
    fromNow
  }
})
export default class RunIssueDetails extends mixins(
  RouteQueryMixin,
  IssueDetailMixin,
  RunDetailMixin,
  RepoDetailMixin,
  RoleAccessMixin
) {
  public searchCandidate: Maybe<string> = null
  public currentPage: Maybe<number> = 1
  public sort: Maybe<string> = null
  public pageSize = PAGE_SIZE
  public loading = true
  public issuePriority: IssuePriority | null = null

  created() {
    const { page, sort, q, listsort, listcategory, listq } = this.$route.query
    this.queryParams = Object.assign(
      this.queryParams,
      {
        page: 1,
        sort: null,
        q: null,
        listsort: null,
        listcategory: null,
        listq: null
      },
      { page, sort, q, listsort, listcategory, listq }
    )
  }

  @Watch('searchCandidate')
  @Watch('currentPage')
  @Watch('sort')
  filtersUpdated(): void {
    this.addFilters({
      ...this.$route.query,
      q: this.searchCandidate,
      sort: this.sort,
      page: this.currentPage
    })
  }

  /**
   * Watcher for the `issueId` route param. If updated, the issue detail
   *
   * @returns {Promise<void>}
   */
  @Watch('$route.params.issueId')
  async update(): Promise<void> {
    this.loading = true
    const { issueId } = this.$route.params
    await Promise.all([
      this.fetchIssuesInCheck(),
      this.fetchSingleIssue({ shortcode: issueId }),
      this.fetchIssues()
    ])
    this.loading = false
  }

  /**
   * Whether issues can be ignored
   *
   * @returns {boolean}
   */
  get canIgnoreIssues(): boolean {
    return this.repoPerms.canIgnoreIssues
  }

  get localKey(): string {
    const { owner, repo, issueId } = this.$route.params
    if (this.currentCheck?.id) {
      return `${owner}-${repo}-${this.currentCheck.id}-${issueId}-ignored-issues`
    }
    return ''
  }

  /**
   * Handles the emit of the 'update-ignored-issues-checks' event with the list of ignored issues
   * @param issueIds
   *
   * @returns {void}
   */
  ignoreIssues(issueIds: string[]): void {
    let issuesIgnored = (this.$localStore.get('check-issues', this.localKey) as string[]) ?? []
    issuesIgnored = issuesIgnored.concat(issueIds)

    this.$localStore.set('check-issues', this.localKey, [...new Set(issuesIgnored)])
    this.$root.$emit('update-ignored-issues-checks')

    const { analyzer, runId, issueId } = this.$route.params

    const newPageRefetchStatus = {
      issueOccurrences: {
        status: true,
        issueId, // Specify the `issueId` so that the re-fetch happens on visiting the issue occurrences page with a matching `issueId`
        page: this.$route.query.page ? Number(this.$route.query.page) : 1
      },
      runs: { status: true },
      runDetail: {
        status: true,
        analyzer,
        runId,
        pageOffset: Math.floor(this.issueIndex / 10) * 10 // Specify the page offset so that the re-fetch happens on visiting the page the issue resided
      }
    }

    this.$store.commit(
      `run/detail/${RunDetailMutations.SET_PAGE_REFETCH_STATUS}`,
      newPageRefetchStatus
    )
  }

  async fetch(): Promise<void> {
    const { runId, issueId } = this.$route.params
    await Promise.all([
      this.fetchBasicRepoDetails(this.baseRouteParams),
      this.fetchRepoPerms(this.baseRouteParams),
      this.fetchRun({ ...this.baseRouteParams, runId })
    ])

    await this.fetchCheck({ checkId: this.currentCheck.id })

    const { status, issueId: issueIdFromStore, page } = this.pageRefetchStatus.issueOccurrences

    // Re-fetch only if the page visited corresponds to the issue being ignored
    const refetch = status && issueId === issueIdFromStore && page === (this.queryParams.page ?? 1)

    await Promise.all([
      this.fetchIssues(),
      this.fetchIssuesInCheck(refetch),
      this.fetchSingleIssue({ shortcode: issueId })
    ])
    this.issuePriority = await this.fetchIssuePriority({
      objectId: this.repository.id,
      level: IssuePriorityLevel.Repository,
      shortcode: issueId
    })

    this.loading = false

    if (refetch) {
      // Reset the state
      this.$store.commit(`run/detail/${RunDetailMutations.SET_PAGE_REFETCH_STATUS}`, {
        ...this.pageRefetchStatus,
        issueOccurrences: {
          status: false,
          issueId: '',
          page: 1
        }
      })
    }
  }

  /**
   * Returns the current active check from the set of all checks on this run
   *
   * @returns {Check}
   */
  get currentCheck(): Check {
    const filteredCheck = this.checks.filter((edge) => {
      return edge.analyzer?.shortcode == this.$route.params.analyzer
    })

    return filteredCheck[0]
  }

  /**
   * Returns the name of the current active analyzer and its shortcode
   *
   * @returns {Record<string, string>}
   */
  get currentAnalyzer(): { name: string; shortcode: string } {
    if (this.issue.analyzerName && this.issue.analyzerShortcode) {
      return {
        name: this.issue.analyzerName,
        shortcode: this.issue.analyzerShortcode
      }
    }
    return (
      this.singleIssue?.analyzer ?? {
        name: '',
        shortcode: this.$route.params.analyzer
      }
    )
  }

  /**
   * Returns a list of checks on this run
   *
   * @returns {Array<Check}
   */
  get checks(): Array<Check> {
    if (this.run?.checks?.edges) {
      return this.run.checks.edges.map((edge: Maybe<CheckEdge>) => {
        return edge?.node as Check
      })
    }
    return []
  }

  /**
   * Fetches all issues raised in the current check and updates the store
   *
   * @returns {Promise<void>}
   */
  async fetchIssues(refetch = false): Promise<void> {
    const index = Number(this.$route.query.listindex)
    const offset = index === 0 ? 0 : index - 1
    await this.fetchConcreteIssueList({
      checkId: this.check.id,
      first: 3,
      offset,
      sort: (this.queryParams.listsort as string) || '',
      issueType: (this.queryParams.listcategory as string) || '',
      q: (this.queryParams.listq as string) || '',
      refetch
    })
  }

  /**
   * Fetches all issues raised in the current check and updates the store
   *
   * @param {boolean} [refetch=false]
   * @returns {Promise<void>}
   */
  async fetchIssuesInCheck(refetch = false): Promise<void> {
    const { q, page, sort } = this.queryParams
    return this.fetchCheckIssues({
      checkId: this.check.id,
      shortcode: this.$route.params.issueId,
      limit: this.pageSize,
      currentPageNumber: page as number,
      q: q as string,
      sort: sort as string,
      refetch
    })
  }

  /**
   * Occurances of the current issue, filtered out from all issues raised in the check
   *
   * @returns {ChechIssueConnection}
   */
  get issueOccurrences(): CheckIssueConnection {
    const filteredIssueConnection = {} as CheckIssueConnection
    if (!this.checkIssues.edges) return filteredIssueConnection
    filteredIssueConnection.edges = this.checkIssues.edges.filter(
      (issue: Maybe<CheckIssueEdge>) => {
        return issue?.node?.shortcode === this.$route.params.issueId
      }
    )
    filteredIssueConnection.totalCount = filteredIssueConnection.edges.length
    return filteredIssueConnection
  }

  /**
   * Combines all filters applied to the issue list into a query string
   *
   * @returns {string}
   */
  get listFilters(): string {
    const { query } = this.$route

    let filters: string[] = []
    const filterTypes = ['listcategory', 'listsort', 'listq']
    Object.keys(query).forEach((key) => {
      if (filterTypes.includes(key)) {
        filters = filters.concat(`${key}=${query[key]}`)
      }
    })

    return filters.length > 0 ? `${filters.join('&')}` : ''
  }

  /**
   * The index of the current issue within the set of all issues raised in this check
   *
   * @returns {number}
   */
  get issueIndex(): number {
    return Number(this.$route.query.listindex)
  }

  /**
   * Returns an IssueLink to the issue page for the next issue in the set if available
   *
   * @returns {IssueLink | null}
   */
  get nextIssue(): IssueLink | null {
    const { params, query } = this.$route
    // concreteIssueList has 3 issues: [prev, current, next], however when the current index is 0 concreteIssueList is instead [current, next, next + 1]
    const nextIssueIndex = query.listindex === '0' ? 1 : 2
    return this.concreteIssueList.totalCount === this.issueIndex + 1
      ? null
      : {
          to: this.$generateRoute([
            'run',
            params.runId,
            params.analyzer,
            this.concreteIssueList.edges[nextIssueIndex]?.node?.shortcode || '',
            `?${this.listFilters}${this.listFilters ? '&' : ''}listindex=${this.issueIndex + 1}`
          ]),
          label: `Next ${query.listsort || ''} ${
            query.listcategory ? this.issueLabel(query.listcategory as string) : ''
          } issue`
        }
  }

  /**
   * Returns an IssueLink to the issue page for the previous issue in the set if available
   *
   * @returns {IssueLink | null}
   */
  get previousIssue(): IssueLink | null {
    const { params, query } = this.$route
    if (this.concreteIssueList.totalCount) {
      return this.concreteIssueList && this.issueIndex === 0
        ? null
        : {
            to: this.$generateRoute([
              'run',
              params.runId,
              params.analyzer,
              this.concreteIssueList.edges[0]?.node?.shortcode || '',
              `?${this.listFilters}${this.listFilters ? '&' : ''}listindex=${this.issueIndex - 1}`
            ]),
            label: `Previous ${query.listsort || ''} ${
              query.listcategory ? this.issueLabel(query.listcategory as string) : ''
            } issue`
          }
    }
    return null
  }

  /**
   * Returns a formatted label for the issue type given its category shortcode
   *
   * @param {string} shortcode
   * @returns {string}
   */
  issueLabel(shortcode: string): string {
    const categoryLabelMap: Record<string, string> = {
      [IssueTypeOptions.ANTI_PATTERN]: 'Anti-pattern',
      [IssueTypeOptions.BUG_RISK]: 'Bug risk',
      [IssueTypeOptions.PERFORMANCE]: 'Performance',
      [IssueTypeOptions.SECURITY]: 'Security',
      [IssueTypeOptions.COVERAGE]: 'Coverage',
      [IssueTypeOptions.TYPECHECK]: 'Type check',
      [IssueTypeOptions.STYLE]: 'Style',
      [IssueTypeOptions.DOCUMENTATION]: 'Documentation'
    }
    return categoryLabelMap[shortcode]
  }

  /**
   * Returns a link to back to the analyzer page
   *
   * @returns {string}
   */
  get routeToPrevious(): string {
    const { params } = this.$route
    return this.$generateRoute(['run', params.runId, params.analyzer])
  }

  /**
   * Method to edit priority of the issue
   *
   * @param {string} priorityValue
   * @returns {Promise<void>}
   */
  async editPriority(priorityValue: string): Promise<void> {
    if (this.issuePriority && this.canEditPriority) {
      try {
        const { source } = this.issuePriority
        const objectId =
          source === IssuePriorityLevel.Owner ? this.repository.owner.id : this.repository.id
        const level = source || IssuePriorityLevel.Repository
        this.issuePriority = await this.updateIssuePriority({
          objectId,
          level,
          input: {
            issueShortcode: this.$route.params.issueId,
            objectId,
            level,
            issuePriorityType: priorityValue
          }
        })
        this.$toast.success(`Priority updated successfully in ${IssuePriorityLevelVerbose[level]}.`)
      } catch (error) {
        this.$toast.danger(
          `An error occurred while updating priority for the issue '${this.$route.params.issueId}'. Please try again.`
        )
      }
    }
  }

  /**
   * Whether to allow editing the issue priority
   *
   * @returns {boolean}
   */
  get canEditPriority(): boolean {
    if (this.issuePriority) {
      const { source } = this.issuePriority
      return source === IssuePriorityLevel.Owner
        ? this.$gateKeeper.team(TeamPerms.MANAGE_OWNER_ISSUE_PRIORITY, this.teamPerms.permission)
        : this.$gateKeeper.repo(RepoPerms.CHANGE_ISSUE_PRIORITY, this.repoPerms.permission)
    }
    return false
  }

  head(): Record<string, string> {
    const { owner, repo, issueId } = this.$route.params
    let title = ''
    if (issueId) {
      title = `${issueId} ${title}`
    }
    if (this.run.commitOid) {
      title = `${title} @ ${this.run.commitOid?.slice(0, 7)} `
    }
    return {
      title: `${title || 'Run'} • ${owner}/${repo}`,
      description:
        'DeepSource is an automated code review tool that helps developers automatically find and fix issues in their code.'
    }
  }
}
</script>
<style scoped>
/* all for mobiles */
.issue-page {
  --mobile-navbar-height: 40px;
  --repo-header-height: 184px;
  --breadcrumb-height: 72px;

  --top-bar-offset: calc(
    var(--repo-header-height) + var(--breadcrumb-height) + var(--mobile-navbar-height)
  );

  --issue-header-height: 90px;
}

/* height of RepoHeader + Breadcrumbs */
.top-bar-offset {
  top: var(--top-bar-offset);
}

.issue-body-height {
  height: calc(100vh - var(--top-bar-offset));
}

.offset-for-tabs {
  top: calc(
    var(--repo-header-height) + var(--mobile-navbar-height) + var(--breadcrumb-height) +
      var(--issue-header-height)
  );
}

@media (min-width: 768px) {
  .analyzer-page {
    --breadcrumb-height: 52px;
  }
}

/* all for tablets */
@media (min-width: 1023px) {
  .issue-page {
    --mobile-navbar-height: 0px;
    --repo-header-height: 167.5px;
    --breadcrumb-height: 52px;
  }
}

@media (min-width: 1280px) {
  .issue-page {
    --mobile-navbar-height: 0px;
    --repo-header-height: 96px;
    --breadcrumb-height: 52px;
  }
}
</style>
