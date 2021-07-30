<template>
  <div class="pb-6">
    <run-header
      v-if="run"
      v-bind="run"
      :routeToPrevious="$generateRoute(['history', 'runs'])"
      :checks="checks"
      :currentAnalyzer="$route.params.analyzer"
    ></run-header>
    <div v-else class="h-24 w-full bg-ink-200 animate-pulse"></div>
    <div class="px-4 pt-4 relative">
      <!-- Back to Issue list Page -->
      <link-to-prev :link="routeToPrevious" title="All issues"></link-to-prev>
      <issue-actions
        class="absolute top-4 right-4"
        :issue="singleIssue"
        :checkId="currentCheck ? currentCheck.id : ''"
        :shortcode="$route.params.issueId"
        @ignoreIssues="ignoreIssues"
        :repository="repository"
      ></issue-actions>

      <!-- Issue details -->
      <div class="flex flex-col p-4 space-y-3 xl:flex-row xl:p-0 xl:space-y-0 mt-2">
        <issue-details-header
          v-if="!loading"
          :analyzerName="currentAnalyzer.name"
          :analyzerShortcode="currentAnalyzer.shortcode"
          :issueType="singleIssue.issueType"
          :shortcode="singleIssue.shortcode"
          :title="singleIssue.title"
          :firstSeen="issue.firstSeen"
          :lastSeend="issue.lastSeen"
          :count="check.issuesRaisedCount"
          :showMeta="true"
        ></issue-details-header>
      </div>
    </div>
    <z-tabs class="mt-5">
      <z-tab-list class="px-4 pb-0 border-b border-ink-200">
        <z-tab-item class="flex items-center space-x-1" border-active-color="vanilla-400">
          <span>Occurences</span>
          <z-tag
            v-if="checkIssues.totalCount"
            text-size="xs"
            spacing="py-0.5 px-3.5"
            bgColor="ink-100"
            >{{ checkIssues.totalCount }}</z-tag
          >
        </z-tab-item>
        <z-tab-item border-active-color="vanilla-400">Ignore rules</z-tab-item>
      </z-tab-list>
      <z-tab-panes class="p-4">
        <z-tab-pane>
          <issue-list
            v-bind="checkIssues"
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
        </z-tab-pane>
        <z-tab-pane>There are the list of issues.</z-tab-pane>
      </z-tab-panes>
    </z-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Watch, mixins } from 'nuxt-property-decorator'

import { ZTag, ZTabs, ZTabList, ZTabPane, ZTabPanes, ZTabItem } from '@deepsourcelabs/zeal'

import LinkToPrev from '@/components/LinkToPrev.vue'
import { IssueDetailsHeader, IssueActions } from '@/components/RepoIssues/index'
import { SubNav } from '@/components/History/index'
import { IssueList } from '@/components/RepoIssues'
import ShowMore from '@/components/ShowMore.vue'

// Import State & Types
import { Check, Maybe, CheckEdge } from '~/types/types'
import RouteQueryMixin from '~/mixins/routeQueryMixin'
import IssueDetailMixin from '~/mixins/issueDetailMixin'
import RunDetailMixin from '~/mixins/runDetailMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'

const PAGE_SIZE = 25

@Component({
  components: {
    ZTag,
    ZTabs,
    ZTabList,
    ZTabPane,
    ZTabPanes,
    ZTabItem,
    LinkToPrev,
    IssueDetailsHeader,
    SubNav,
    IssueList,
    ShowMore,
    IssueActions
  },
  layout: 'repository'
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
  public loading = false

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

  ignoreIssues(issueIds: string[]): void {
    let issuesIgnored = (this.$localStore.get('check-issues', this.localKey) as string[]) ?? []
    issuesIgnored = issuesIgnored.concat(issueIds)

    this.$localStore.set('check-issues', this.localKey, [...new Set(issuesIgnored)])
    this.$root.$emit('update-ignored-issues-checks')
  }

  async fetch(): Promise<void> {
    this.loading = true
    const { runId, issueId } = this.$route.params
    await Promise.all([
      this.fetchBasicRepoDeatils(this.baseRouteParams),
      this.fetchRepoPerms(this.baseRouteParams),
      this.fetchRun({ ...this.baseRouteParams, runId })
    ])

    await this.fetchCheck({ checkId: this.currentCheck.id })
    await this.fetchIssues()
    await Promise.all([
      this.fetchSingleIssue({ shortcode: issueId }),
      this.fetchIssueDetails({
        repositoryId: this.repository.id,
        shortcode: issueId
      })
    ])
    this.loading = false
  }

  get currentCheck(): Check {
    const filteredCheck = this.checks.filter((edge) => {
      return edge.analyzer?.shortcode == this.$route.params.analyzer
    })

    return filteredCheck[0]
  }

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

  get checks(): Array<Check> {
    if (this.run?.checks?.edges) {
      return this.run.checks.edges.map((edge: Maybe<CheckEdge>) => {
        return edge?.node as Check
      })
    }
    return []
  }

  async fetchIssues(): Promise<void> {
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

  get routeToPrevious(): string {
    const { params } = this.$route
    return this.$generateRoute(['run', params.runId, params.analyzer])
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
