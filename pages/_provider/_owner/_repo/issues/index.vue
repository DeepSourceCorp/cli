<template>
  <div>
    <!-- Analyzer Tab -->
    <div class="flex justify-between py-2 px-2 space-x-2 border-b border-ink-200">
      <issue-analyzer-selector
        @updateAnalyzer="updateAnalyzer"
        :selectedAnalyzer="queryParams.analyzer"
      />
      <div class="flex items-center space-x-2 w-auto justify-end">
        <issue-sort v-model="queryParams.sort" />
        <autofix-available v-model="queryParams.autofixAvailable" />
        <issue-search v-model="queryParams.q" />
      </div>
    </div>
    <!-- Main Content -->
    <div class="flex w-full">
      <!-- Group by Filter Section -->
      <issue-category-selector
        @updateCategory="updateCategory"
        :selectedCategory="queryParams.category"
      />
      <!-- List of issues -->
      <div v-if="issueListLoading" class="flex-1 flex-grow min-h-screen p-4 space-y-2">
        <div v-for="idx in 7" :key="idx" class="h-26 rounded-md bg-ink-300 animate-pulse"></div>
      </div>
      <div
        v-else
        class="flex flex-col flex-1 flex-grow p-4 space-y-4"
        :class="{
          'max-h-64 min-h-64': issueList.totalCount === 0,
          'min-h-screen max-h-auto': issueList && issueList.totalCount && issueList.totalCount > 0
        }"
      >
        <div
          v-if="issueList.totalCount === 0"
          class="flex flex-col items-center justify-center w-full h-screen space-y-2 text-center"
        >
          <div>There are no issues, developer asked "Is this a dream?"</div>
        </div>
        <issue-list-item
          v-for="issue in issueList.edges"
          v-bind="issue.node"
          :key="issue.node.id"
          :disableAutofixButton="!canCreateAutofix"
          :issueLink="$generateRoute(['issue', issue.node.shortcode, 'occurrences'])"
          @autofix="openAutofixModal"
        ></issue-list-item>
        <z-pagination
          :key="$route.fullPath"
          class="flex justify-center"
          v-if="pageCount > 1"
          :totalPages="pageCount"
          :totalVisible="totalVisible"
          v-model="queryParams.page"
        ></z-pagination>
      </div>
      <!-- Autofix Modal -->
      <autofix-file-chooser
        repositoryId="repository.id"
        v-bind="autofixIssue"
        :isOpen="isAutofixOpen"
        @close="isAutofixOpen = false"
      ></autofix-file-chooser>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZTag, ZPagination } from '@deepsourcelabs/zeal'
import {
  IssueAnalyzerSelector,
  IssueCategorySelector,
  IssueSort,
  IssueSearch,
  AutofixAvailable
} from '@/components/Issue'
import IssueListItem from '@/components/IssueListItem.vue'
import { AutofixFileChooser } from '@/components/RepoIssues'

// types
import { Maybe } from '~/types/types'

import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import IssueListMixin from '~/mixins/issueListMixin'

import { RepoPerms } from '~/types/permTypes'
import RouteQueryMixin from '~/mixins/routeQueryMixin'

const PAGE_SIZE = 25
const VISIBLE_PAGES = 5

export interface IssueListFilters {
  page?: number
  category?: string
  analyzer?: string
  q?: string
  sort?: string
  autofixAvailable?: string | boolean | null
  all?: boolean
}

@Component({
  components: {
    ZTag,
    ZIcon,
    ZPagination,
    IssueAnalyzerSelector,
    IssueListItem,
    IssueCategorySelector,
    IssueSort,
    IssueSearch,
    AutofixAvailable,
    AutofixFileChooser
  },
  layout: 'repository'
})
export default class Issues extends mixins(
  RepoDetailMixin,
  IssueListMixin,
  RoleAccessMixin,
  RouteQueryMixin
) {
  public isAutofixOpen = false
  public currentPage: Maybe<number> = null
  public urlFilterState: Record<string, string | (string | null)[]> = {}
  public autofixIssue: Record<string, string | Array<string>> = {}

  updateCategory(newVal: string): void {
    this.queryParams.category = newVal
    this.queryParams.page = 1
  }

  updateAnalyzer(newVal: string): void {
    this.queryParams.analyzer = newVal
    this.queryParams.page = 1
  }

  created() {
    this.queryParams as IssueListFilters
    const { query } = this.$route

    // load query params from URL
    this.queryParams = {
      page: query.page,
      category: query.category || 'recommended',
      analyzer: query.analyzer || 'all',
      q: query.q || null,
      sort: query.sort || null,
      autofixAvailable: query.autofixAvailable || null
    }
  }

  get parsedParams(): IssueListFilters {
    const parsed = {} as IssueListFilters
    const { q, page, sort, analyzer, category, autofixAvailable } = this.queryParams

    if (q) parsed['q'] = q as string
    if (page) parsed['page'] = Number(page as string)
    if (sort) parsed['sort'] = sort as string
    if (analyzer && analyzer !== 'all') {
      parsed['analyzer'] = analyzer as string
    }
    if (category && category !== 'all' && category !== 'recommended') {
      parsed['category'] = category as string
    } else {
      parsed['category'] = undefined
      parsed['all'] = category === 'all'
    }
    if (autofixAvailable && (autofixAvailable === 'true' || autofixAvailable === true)) {
      parsed['autofixAvailable'] = true
    }

    return parsed
  }

  async fetch(): Promise<void> {
    await this.fetchRepoDetails(this.baseRouteParams)
    await this.fetchRepoPerms(this.baseRouteParams)
    await this.fetchIssuesForOwner()
  }

  async fetchIssuesForOwner(refetch = false): Promise<void> {
    const { q, page, sort, analyzer, category, autofixAvailable, all } = this.parsedParams
    await this.fetchIssueTypeDistribution({
      ...this.baseRouteParams,
      q,
      analyzer,
      issueType: '',
      autofixAvailable: autofixAvailable as boolean | null,
      refetch
    })

    await this.fetchIssueList({
      ...this.baseRouteParams,
      currentPageNumber: page,
      limit: PAGE_SIZE,
      sort,
      q,
      analyzer,
      issueType: category,
      autofixAvailable: autofixAvailable as boolean | null,
      all,
      refetch
    })
  }

  refetchIssues(): void {
    this.fetchIssuesForOwner(true)
  }

  mounted(): void {
    this.$root.$on('refetchCheck', this.refetchIssues)
    this.$socket.$on('repo-analysis-updated', this.refetchIssues)
    this.$socket.$on('autofixrun-fixes-ready', this.refetchIssues)
  }

  beforeDestroy(): void {
    this.$root.$off('refetchCheck', this.refetchIssues)
    this.$socket.$off('repo-analysis-updated', this.refetchIssues)
    this.$socket.$off('autofixrun-fixes-ready', this.refetchIssues)
  }

  public openAutofixModal(issue: Record<string, string | Array<string>>): void {
    this.autofixIssue = { ...issue }
    this.isAutofixOpen = true
  }

  get canCreateAutofix(): boolean {
    return this.$gateKeeper.repo(RepoPerms.CREATE_AUTOFIXES, this.repoPerms.permission)
  }

  get pageCount(): number {
    if (this.issueList.totalCount) return Math.ceil(this.issueList.totalCount / PAGE_SIZE)
    return 0
  }

  get totalVisible(): number {
    return this.pageCount >= VISIBLE_PAGES ? VISIBLE_PAGES : this.pageCount
  }

  head(): Record<string, string> {
    const { repo, owner } = this.$route.params
    return {
      title: `Issues • ${owner}/${repo}`,
      description:
        'DeepSource is an automated code review tool that helps developers automatically find and fix issues in their code.'
    }
  }
}
</script>
