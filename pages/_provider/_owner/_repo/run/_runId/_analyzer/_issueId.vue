<template>
  <main class="issue-page pb-6">
    <div class="top-bar-offset z-20 border-b border-slate-400 bg-ink-400 p-4 md:sticky">
      <!-- Issue details -->
      <div class="mb-px flex flex-col space-y-3 xl:flex-row xl:space-y-0">
        <div v-if="$fetchState.pending || loading" class="w-full space-y-2.5">
          <!-- Left Section -->
          <div class="h-8 w-3/5 animate-pulse rounded-md bg-ink-300 md:w-4/5"></div>
          <div class="flex w-1/3 space-x-2">
            <div class="h-4 w-1/3 animate-pulse rounded-md bg-ink-300"></div>
            <div class="h-4 w-1/3 animate-pulse rounded-md bg-ink-300"></div>
          </div>
        </div>
        <!-- issue header and actions -->
        <div v-else class="relative z-20 flex w-full justify-between">
          <issue-details-header
            :issue-type="singleIssue.issueType"
            :shortcode="singleIssue.shortcode"
            :title="singleIssue.title"
            :tags="singleIssue.tags"
            :severity="singleIssue.severity"
            :first-seen="issue.firstSeen"
            :last-seen="issue.lastSeen"
            :count="checkIssues.totalCount"
            :issue-priority="issuePriority"
            :can-edit-priority="canEditPriority"
            @priority-edited="editPriority"
          />
          <div class="flex items-start justify-end gap-x-1.5">
            <issue-actions
              :issue="singleIssue"
              :check-id="currentCheck ? currentCheck.id : ''"
              :shortcode="$route.params.issueId"
              :repository="repository"
              :next-issue="nextIssue"
              :previous-issue="previousIssue"
              class="ml-4"
              @ignoreIssues="ignoreIssues"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="p-4">
      <div v-if="$fetchState.pending || loading" class="flex">
        <div class="w-full space-y-4 lg:w-4/6">
          <div
            v-for="ii in 3"
            :key="ii"
            class="h-36 w-full animate-pulse rounded-md bg-ink-300"
          ></div>
        </div>
        <div class="hidden h-full w-2/6 px-4 lg:block">
          <div class="h-44 animate-pulse rounded-md bg-ink-300"></div>
        </div>
      </div>
      <div v-else class="grid grid-cols-3">
        <issue-list
          :blob-url-root="run.blobUrlRoot"
          :is-subrepo="isSubrepo"
          :repo-path="repoPath"
          :can-ignore-issues="canIgnoreIssues"
          :check-id="currentCheck ? currentCheck.id : ''"
          :description="singleIssue.descriptionRendered"
          :issue-index="issueIndex"
          :issue-occurrences="issueOccurrences"
          :page-size="pageSize"
          :search-value="queryParams.q"
          :snippets-fetch-errored="snippetsFetchErrored"
          :snippets-loading="snippetsLoading"
          :start-page="queryParams.page"
          :total-count="checkIssues.totalCount"
          class="col-span-3 lg:col-span-2"
          @search="(val) => (searchCandidate = val)"
          @sort="(val) => (sort = val)"
          @page="(val) => (currentPage = val)"
        />
        <issue-description :description="singleIssue.descriptionRendered" class="col-span-1" />
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { Component, mixins, Watch } from 'nuxt-property-decorator'

import { SubNav } from '@/components/History/index'
import LinkToPrev from '@/components/LinkToPrev.vue'
import { IssueList } from '@/components/RepoIssues'
import { IssueActions, IssueDescription, IssueDetailsHeader } from '@/components/RepoIssues/index'

// Import State & Types
import {
  Check,
  CheckEdge,
  CheckIssue,
  IssuePriority,
  IssuePriorityLevel,
  Maybe,
  RepositoryKindChoices
} from '~/types/types'

import ContextMixin from '~/mixins/contextMixin'
import IssueDetailMixin from '~/mixins/issueDetailMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import RouteQueryMixin from '~/mixins/routeQueryMixin'
import RunDetailMixin from '~/mixins/runDetailMixin'

import { RunDetailMutations } from '~/store/run/detail'

import { IssuePriorityLevelVerbose } from '~/types/issuePriorityTypes'
import { IssueLink, IssueTypeOptions } from '~/types/issues'
import { RepoPerms, TeamPerms } from '~/types/permTypes'

import { resolveNodes } from '~/utils/array'
import { fromNow } from '~/utils/date'
import { AnalysisRequestBodyT, fetchSnippets } from '~/utils/runner'

const PAGE_SIZE = 25

@Component({
  components: {
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
  ContextMixin,
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

  codeSnippets = {} as Record<string, string>

  snippetsLoading = false
  snippetsFetchErrored = false

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
    if (!issueId) this.$nuxt.error({ statusCode: 404 })

    if (!Object.keys(this.context).length) {
      await this.fetchContext()
    }

    await Promise.all([
      this.fetchBasicRepoDetails(this.baseRouteParams),
      this.fetchRepoPerms(this.baseRouteParams),
      this.fetchRun({ ...this.baseRouteParams, runId, isRunner: this.context.isRunner as boolean })
    ])

    await this.fetchCheck({ checkId: this.currentCheck.id })

    const { status, issueId: issueIdFromStore, page } = this.pageRefetchStatus.issueOccurrences

    // Re-fetch only if the page visited corresponds to the issue being ignored
    const refetch = status && issueId === issueIdFromStore && page === (this.queryParams.page ?? 1)

    await Promise.all([this.fetchIssues(), this.fetchIssuesInCheck(refetch), this.fetchIssue()])
    this.issuePriority = await this.fetchIssuePriority({
      objectId: this.repository.id,
      level: IssuePriorityLevel.Repository,
      shortcode: issueId
    })

    this.loading = false

    // Fetch run issue occurrence code snippets if in Runner context
    // The use case here is that we need not wait till the source code snippets fetch to be resolved
    // The issue titles and other information is fetched; hence it can be displayed in the UI
    // Skeleton loaders show up just in place of the code snippets until the fetch is done
    this.fetchRunnerCodeSnippets()

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
   * @returns {Check[]}
   */
  get checks(): Check[] {
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

  async fetchIssue() {
    const { issueId } = this.$route.params
    const issue = await this.fetchSingleIssue({ shortcode: issueId })

    if (!issue || !Object.keys(issue).length) {
      this.$nuxt.error({
        statusCode: 404,
        message: `Issue "${issueId}" does not exist!`
      })
    }
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
      isRunner: this.context.isRunner as boolean,
      q: q as string,
      sort: sort as string,
      refetch
    })
  }

  /**
   * Occurrences of the current issue, filtered out from all issues raised in the check
   *
   * @returns {CheckIssue[]}
   */
  get issueOccurrences(): CheckIssue[] {
    const filteredIssueOccurrences = [] as CheckIssue[]

    if (!this.checkIssues.edges) {
      return filteredIssueOccurrences
    }

    let filteredCheckIssues = resolveNodes(this.checkIssues).filter((issue: CheckIssue) => {
      return issue.shortcode === this.$route.params.issueId
    })

    if (this.context.isRunner) {
      filteredCheckIssues = filteredCheckIssues.map((filteredCheckIssue: CheckIssue) => {
        return {
          ...filteredCheckIssue,
          sourceCodeMarkup: this.codeSnippets[filteredCheckIssue.sourceCodeIdentifier as string]
        }
      })
    }

    return filteredCheckIssues
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

  get isSubrepo(): boolean {
    return this.repository.kind === RepositoryKindChoices.Subrepo
  }

  get repoPath(): string {
    return this.repository.path ?? ''
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

  // Fetch run issue occurrence code snippets if in Runner context
  async fetchRunnerCodeSnippets() {
    if (this.context.isRunner) {
      this.snippetsLoading = true

      const sourceCodeIdentifierEntries = this.issueOccurrences.map(
        ({ sourceCodeIdentifier }) => sourceCodeIdentifier
      ) as string[]

      const endpointUrl = this.runnerInfo.codeSnippetUrl

      const requestBody: AnalysisRequestBodyT = {
        snippet_ids: sourceCodeIdentifierEntries
      }

      try {
        const parsedResponse: Record<string, string> = await fetchSnippets(endpointUrl, requestBody)
        this.codeSnippets = parsedResponse
      } catch (_) {
        this.snippetsFetchErrored = true
      } finally {
        this.snippetsLoading = false
      }
    }
  }
}
</script>
<style scoped>
/* all for mobiles */
.issue-page {
  --repo-header-height: 97px;
  --breadcrumb-height: 72px;

  --top-bar-offset: calc(var(--repo-header-height) + var(--breadcrumb-height));

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
  top: calc(var(--repo-header-height) + var(--breadcrumb-height) + var(--issue-header-height));
}

@media (min-width: 768px) {
  .issue-page {
    --breadcrumb-height: 52px;
  }
}
</style>
