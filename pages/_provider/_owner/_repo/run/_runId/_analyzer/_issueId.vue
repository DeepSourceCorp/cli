<template>
  <main class="pb-6 issue-page">
    <div class="z-20 p-4 md:sticky top-bar-offset bg-ink-400">
      <!-- Issue details -->
      <div class="flex flex-col space-y-3 xl:flex-row xl:space-y-0">
        <div class="w-full space-y-1" v-if="$fetchState.pending">
          <!-- Left Section -->
          <div class="w-3/5 h-10 rounded-md md:w-4/5 bg-ink-300 animate-pulse"></div>
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
            :count="check.issuesRaisedCount"
            :showMeta="true"
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
            ></issue-actions>
          </div>
        </div>
      </div>
    </div>
    <z-tabs>
      <z-tab-list
        class="px-4 pb-0 border-b border-ink-100 md:sticky offset-for-tabs z-10 bg-ink-400"
      >
        <z-tab-item border-active-color="vanilla-400">
          <div class="h-5 flex items-center gap-x-1">
            <span>Occurrences</span>
            <z-tag
              v-if="issueOccurrences.totalCount"
              text-size="xs"
              spacing="px-2 py-1"
              bgColor="ink-100"
              class="leading-none"
              >{{ issueOccurrences.totalCount }}</z-tag
            >
          </div>
        </z-tab-item>
        <z-tab-item border-active-color="vanilla-400">
          <div class="h-5 flex items-center">
            <span>Ignore rules</span>
          </div>
        </z-tab-item>
      </z-tab-list>
      <z-tab-panes class="p-4">
        <z-tab-pane>
          <div class="flex" v-if="$fetchState.pending">
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
              class="col-span-3 lg:col-span-2"
              :description="singleIssue.descriptionRendered"
              :checkId="currentCheck ? currentCheck.id : ''"
              :canIgnoreIssues="canIgnoreIssues"
              :pageSize="pageSize"
              :startPage="queryParams.page"
              :searchValue="queryParams.q"
              :blobUrlRoot="run.blobUrlRoot"
              @search="(val) => (searchCandidate = val)"
              @sort="(val) => (sort = val)"
              @page="(val) => (currentPage = val)"
            ></issue-list>
            <issue-description
              :description="singleIssue.descriptionRendered"
              class="col-span-1"
            ></issue-description>
          </div>
        </z-tab-pane>
        <z-tab-pane v-if="!$fetchState.pending">
          <div v-if="Array.isArray(silenceRules) && silenceRules.length" class="space-y-4">
            <template v-for="rule in silenceRules">
              <div class="flex items-center" :key="rule.id">
                <div class="flex flex-col flex-1 space-y-2 text-sm">
                  <div class="flex w-full space-x-2">
                    <div class="flex-1">
                      <nuxt-link
                        v-if="rule.issue"
                        :to="`/directory/analyzers/${rule.issue.analyzer.shortcode}/issues/${rule.issue.shortcode}`"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span class="font-bold text-juniper hover:underline">{{
                          rule.issue.shortcode
                        }}</span>
                      </nuxt-link>
                      <span>Ignored</span>
                      <span v-if="rule.metadata.type === 'pattern'">
                        for all files matching with pattern
                      </span>
                      <span v-else-if="rule.metadata.type === 'test-pattern'">
                        for all test files in the repository
                      </span>
                      <span v-else-if="rule.metadata.type === 'forever'">
                        <span v-if="rule.silenceLevel === 'FL'"> for file </span>
                        <span v-else> for all files in this repository </span>
                      </span>
                      <span class="font-semibold text-vanilla-100">{{
                        rule.metadata.glob_pattern || rule.filePath
                      }}</span>
                    </div>
                  </div>
                  <div v-if="rule.creator" class="flex space-x-4 text-xs">
                    <span class="flex items-center space-x-1">
                      <img
                        :src="rule.creator.avatar"
                        alt="Creator Avatar"
                        class="inline-block w-4 h-4 overflow-hidden rounded-full"
                      />
                      <span class="text-vanilla-400">{{ rule.creator.email }}</span>
                    </span>
                    <span class="flex items-center space-x-2 leading-none">
                      <z-icon icon="clock" color="vanilla-400" size="small"></z-icon>
                      <span class="text-vanilla-400">Added {{ fromNow(rule.createdAt) }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </template>
          </div>
          <div
            v-else
            class="max-w-4xl p-4 border-2 border-dashed rounded-md border-ink-200 md:p-12 text-center2"
          >
            <empty-state title="No ignore rules found" />
          </div>
        </z-tab-pane>
      </z-tab-panes>
    </z-tabs>
  </main>
</template>

<script lang="ts">
import { Component, Watch, mixins } from 'nuxt-property-decorator'

import { ZTag, ZTabs, ZTabList, ZTabPane, ZTabPanes, ZTabItem, ZIcon } from '@deepsourcelabs/zeal'

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
  CheckIssueConnection
} from '~/types/types'
import RouteQueryMixin from '~/mixins/routeQueryMixin'
import IssueDetailMixin from '~/mixins/issueDetailMixin'
import RunDetailMixin from '~/mixins/runDetailMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import { fromNow } from '~/utils/date'
import { RepoPerms, TeamPerms } from '~/types/permTypes'
import { IssuePriorityLevelVerbose } from '~/types/issuePriorityTypes'
import { filter } from 'vue/types/umd'

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
    const { page, sort, q } = this.$route.query
    this.queryParams = Object.assign(
      this.queryParams,
      {
        page: 1,
        sort: null,
        q: null
      },
      { page, sort, q }
    )
  }

  @Watch('searchCandidate')
  @Watch('currentPage')
  @Watch('sort')
  filtersUpdated(): void {
    this.addFilters({
      q: this.searchCandidate,
      sort: this.sort,
      page: this.currentPage
    })
  }

  /**
   * Watcher for the `issueId` route param. If updated, the issue detail and ignore rules are fetched
   *
   * @returns {Promise<void>}
   */
  @Watch('$route.params.issueId')
  async update(): Promise<void> {
    const { issueId } = this.$route.params

    await Promise.all([
      this.fetchSingleIssue({ shortcode: issueId }),
      this.fetchSilenceRules({
        ...this.baseRouteParams,
        issueCode: issueId
      })
    ])
  }

  /**
   * Whether issues can be ignore
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
  }

  async fetch(): Promise<void> {
    const { runId, issueId } = this.$route.params
    await Promise.all([
      this.fetchBasicRepoDetails(this.baseRouteParams),
      this.fetchRepoPerms(this.baseRouteParams),
      this.fetchRun({ ...this.baseRouteParams, runId })
    ])

    await this.fetchCheck({ checkId: this.currentCheck.id })
    await this.fetchIssuesInCheck()
    await Promise.all([
      this.fetchSingleIssue({ shortcode: issueId }),
      this.fetchSilenceRules({
        ...this.baseRouteParams,
        issueCode: issueId
      })
    ])
    this.issuePriority = await this.fetchIssuePriority({
      objectId: this.repository.id,
      level: IssuePriorityLevel.Repository,
      shortcode: issueId
    })
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
  async fetchIssuesInCheck(): Promise<void> {
    const { q, page, sort } = this.queryParams
    return this.fetchCheckIssues({
      checkId: this.check.id,
      shortcode: this.$route.params.issueId,
      limit: this.pageSize,
      currentPageNumber: page as number,
      q: q as string,
      sort: sort as string
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
   * Gets the index of the current issue within the set of all issues raised in this check
   *
   * @returns {number}
   */
  get issueIndex(): number {
    if (!this.checkIssues.edges || this.checkIssues.totalCount === 0) return 0
    return this.checkIssues.edges.findIndex((issue: Maybe<CheckIssueEdge>) => {
      return issue?.node?.shortcode === this.$route.params.issueId
    })
  }

  /**
   * Returns a link to the issue page for the next issue in the set if available
   *
   * @returns {string}
   */
  get linkToNextIssue(): string {
    const { params } = this.$route
    return this.issueIndex === 0 || this.checkIssues.totalCount === 1
      ? ''
      : this.$generateRoute([
          'run',
          params.runId,
          params.analyzer,
          this.checkIssues.edges[this.issueIndex + 1]?.node?.shortcode || ''
        ])
  }

  /**
   * Returns a link to the issue page for the previous issue in the set if available
   *
   * @returns {string}
   */
  get linkToPreviousIssue(): string {
    const { params } = this.$route
    if (this.checkIssues.totalCount) {
      //$generateRoute(['run', $route.params.runId, $route.params.analyzer, issue.shortcode])
      return this.checkIssues && this.issueIndex === this.checkIssues.totalCount - 1
        ? ''
        : this.$generateRoute([
            'run',
            params.runId,
            params.analyzer,
            this.checkIssues.edges[this.issueIndex - 1]?.node?.shortcode || ''
          ])
    }
    return ''
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
  --breadcrumb-height: 52px;

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

/* all for tablets */
@media (min-width: 1023px) {
  .issue-page {
    --mobile-navbar-height: 0px;
    --repo-header-height: 167.5px;
    /* Same as mobile */
    /* --breadcrumb-height: 52px; */
  }
}

@media (min-width: 1280px) {
  .issue-page {
    --mobile-navbar-height: 0px;
    --repo-header-height: 96px;
    /* Same as mobile and tablet */
    /* --breadcrumb-height: 52px; */
  }
}
</style>
