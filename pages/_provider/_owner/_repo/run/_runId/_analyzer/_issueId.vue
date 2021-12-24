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
      <div class="flex items-center justify-between">
        <link-to-prev :link="routeToPrevious" title="All issues"></link-to-prev>
        <issue-actions
          class="absolute top-4 right-4"
          :issue="singleIssue"
          :checkId="currentCheck ? currentCheck.id : ''"
          :shortcode="$route.params.issueId"
          @ignoreIssues="ignoreIssues"
          :repository="repository"
        ></issue-actions>
      </div>

      <!-- Issue details -->
      <div class="flex flex-col space-y-3 xl:flex-row xl:space-y-0 mt-2">
        <div class="space-y-2 w-full" v-if="$fetchState.pending">
          <!-- Left Section -->
          <div class="w-3/5 md:w-4/5 h-10 bg-ink-300 rounded-md animate-pulse"></div>
          <div class="w-1/3 flex space-x-2">
            <div class="h-6 w-1/3 bg-ink-300 rounded-md animate-pulse"></div>
            <div class="h-6 w-1/3 bg-ink-300 rounded-md animate-pulse"></div>
          </div>
        </div>
        <issue-details-header
          v-else
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
            spacing="px-2 py-1"
            bgColor="ink-100"
            class="leading-none"
            >{{ checkIssues.totalCount }}</z-tag
          >
        </z-tab-item>
        <z-tab-item border-active-color="vanilla-400">Ignore rules</z-tab-item>
      </z-tab-list>
      <z-tab-panes class="p-4">
        <z-tab-pane>
          <div class="flex" v-if="$fetchState.pending">
            <div class="w-full lg:w-4/6 space-y-4">
              <div
                v-for="ii in 3"
                :key="ii"
                class="h-36 w-full bg-ink-300 rounded-md animate-pulse"
              ></div>
            </div>
            <div class="hidden lg:block px-4 w-2/6 h-full">
              <div class="h-44 bg-ink-300 rounded-md animate-pulse"></div>
            </div>
          </div>
          <issue-list
            v-else
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
        <z-tab-pane v-if="!$fetchState.pending">
          <div v-if="Array.isArray(silenceRules) && silenceRules.length" class="space-y-4">
            <template v-for="rule in silenceRules">
              <div class="flex items-center" :key="rule.id">
                <div class="flex-1 flex flex-col space-y-2 text-sm">
                  <div class="flex space-x-2 w-full">
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
                        class="w-4 h-4 overflow-hidden inline-block rounded-full"
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
          <div v-else class="max-w-4xl p-12">
            <empty-state title="No ignore rules found" />
          </div>
        </z-tab-pane>
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

// Import State & Types
import { Check, Maybe, CheckEdge } from '~/types/types'
import RouteQueryMixin from '~/mixins/routeQueryMixin'
import IssueDetailMixin from '~/mixins/issueDetailMixin'
import RunDetailMixin from '~/mixins/runDetailMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import { fromNow } from '~/utils/date'

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
  public loading = true
  public fromNow = fromNow

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
    const { runId, issueId } = this.$route.params
    await Promise.all([
      this.fetchBasicRepoDetails(this.baseRouteParams),
      this.fetchRepoPerms(this.baseRouteParams),
      this.fetchRun({ ...this.baseRouteParams, runId })
    ])

    await this.fetchCheck({ checkId: this.currentCheck.id })
    await this.fetchIssues()
    await Promise.all([
      this.fetchSingleIssue({ shortcode: issueId }),
      this.fetchSilenceRules({
        ...this.baseRouteParams,
        issueCode: issueId
      })
    ])
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
