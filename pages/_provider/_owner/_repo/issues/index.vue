<template>
  <div class="grid grid-cols-1 lg:grid-cols-16-fr">
    <!-- Analyzer Tab -->
    <div
      class="
        z-20
        flex flex-col
        justify-between
        px-2
        py-2
        space-y-2
        border-b
        lg:flex-row lg:h-12 lg:space-y-0 lg:space-x-2
        border-ink-200
        lg:sticky lg:top-24
        bg-ink-400
        col-span-full
      "
    >
      <issue-analyzer-selector
        @updateAnalyzer="updateAnalyzer"
        :selectedAnalyzer="queryParams.analyzer"
      />
      <div class="flex items-center justify-end w-auto space-x-2">
        <issue-sort v-model="queryParams.sort" />
        <autofix-available v-if="hasRepoReadAccess" v-model="queryParams.autofixAvailable" />
        <issue-search v-model="queryParams.q" />
      </div>
    </div>
    <!-- Main Content -->
    <!-- Group by Filter Section -->
    <issue-category-selector
      :selected-category="queryParams.category"
      class="sticky top-36 category-sidebar"
      @updateCategory="updateCategory"
    >
      <template v-slot:cta v-if="repository.errorCode === 3003 && hasRepoReadAccess">
        <div class="p-4 pb-5 bg-gradient-to-t from-ink-200 to-ink-400 via-ink-300">
          <h4 class="text-base font-bold leading-none text-vanilla-100">Happy with the results?</h4>
          <p class="mt-2 text-sm font-medium leading-snug">
            <span
              class="
                text-opacity-50
                bg-clip-text
                text-vanilla-100
                bg-gradient-to-br
                from-ink-200
                to-ink-400
                via-ink-300
              "
            >
              To activate analysis with every pull request, please commit the configuration.
            </span>
          </p>
          <z-button
            v-if="repository.isCommitPossible || repository.isAutofixEnabled"
            @click="isActivationModalOpen = true"
            size="small"
            icon="play-circle"
            class="w-full mt-5"
            buttonType="primary"
            label="Activate analysis"
          />
          <nuxt-link v-else :to="$generateRoute(['generate-config'])">
            <z-button size="small" icon="play-circle" class="w-full mt-5" buttonType="primary">
              Activate analysis
            </z-button>
          </nuxt-link>
        </div>
      </template>
    </issue-category-selector>
    <!-- List of issues -->
    <div v-if="$fetchState.pending" class="flex-1 flex-grow min-h-screen p-4 space-y-4">
      <div
        v-for="idx in 7"
        :key="idx"
        class="relative z-0 rounded-md h-26 bg-ink-300 animate-pulse"
      ></div>
    </div>
    <div
      v-else
      class="flex flex-col flex-1 flex-grow p-4 pb-10 space-y-4"
      :class="{
        'max-h-64 min-h-64': issueList.totalCount === 0,
        'min-h-screen max-h-auto': issueList && issueList.totalCount && issueList.totalCount > 0
      }"
    >
      <empty-state
        v-if="issueList.totalCount === 0"
        class="border border-2 border-dashed rounded-lg border-ink-200 py-15"
        title="No issues in this category"
        :subtitle="`There are no issues, developer asked &quot;Is this a dream?&quot;`"
      >
      </empty-state>
      <issue-list-item
        v-for="issue in resolveIssueNodes(issueList)"
        v-bind="issue"
        :key="issue.id"
        :showAutofixButton="hasRepoReadAccess"
        :disableAutofixButton="!canCreateAutofix"
        :issueLink="$generateRoute(['issue', issue.shortcode || '', 'occurrences'])"
        @autofix="openAutofixModal"
      ></issue-list-item>
      <z-pagination
        :key="$route.fullPath"
        class="flex justify-center"
        v-if="pageCount > 1"
        :totalPages="pageCount"
        :totalVisible="5"
        v-model="queryParams.page"
      ></z-pagination>
    </div>
    <!-- Autofix Modal -->
    <autofix-file-chooser
      v-bind="autofixIssue"
      :isOpen="isAutofixOpen"
      @close="isAutofixOpen = false"
    />
    <activate-analysis-modal v-if="isActivationModalOpen" @close="isActivationModalOpen = false" />
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZButton, ZTag, ZPagination } from '@deepsourcelabs/zeal'
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
import { RepositoryIssueConnection, Maybe, RepositoryIssue } from '~/types/types'

import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import IssueListMixin from '~/mixins/issueListMixin'

import { RepoPerms } from '~/types/permTypes'
import RouteQueryMixin from '~/mixins/routeQueryMixin'
import { resolveNodes } from '~/utils/array'

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
    ZButton,
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
  public isActivationModalOpen = false
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
    await Promise.all([
      this.fetchRepoDetailsLocal(),
      this.fetchRepoPerms(this.baseRouteParams),
      this.fetchIssuesForOwner()
    ])

    this.fetchRepoAutofixStats(this.baseRouteParams)
    this.fetchIsCommitPossible(this.baseRouteParams)
  }

  initializeQueryParams(): void {
    if (this.repository.errorCode && this.repository.errorCode !== 3003) {
      this.queryParams = {}
    } else {
      this.queryParams as IssueListFilters
      const { query } = this.$route

      // load query params from URL
      this.queryParams = {
        page: query.page ? Number(query.page) : null,
        category: query.category,
        analyzer: query.analyzer || 'all',
        q: query.q || null,
        sort: query.sort || null,
        autofixAvailable: query.autofixAvailable || null
      }
    }
  }

  async fetchRepoDetailsLocal() {
    await this.fetchRepoDetails(this.baseRouteParams)
    this.initializeQueryParams()
  }

  async fetchIssuesForOwner(refetch = false): Promise<void> {
    const { q, page, sort, analyzer, autofixAvailable } = this.parsedParams
    await this.fetchIssueTypeDistribution({
      ...this.baseRouteParams,
      q,
      analyzer,
      issueType: '',
      autofixAvailable: autofixAvailable as boolean | null,
      refetch
    })

    // only apply default category when no category is specified in query params
    if (!this.$route.query.category && Array.isArray(this.repository.issueTypeDistribution)) {
      const recommendedTypePos = this.repository.issueTypeDistribution?.findIndex(
        (issueType) => issueType.shortcode === 'recommended'
      )

      if (this.repository.issueTypeDistribution[recommendedTypePos].count < 1) {
        this.updateCategory('all')
      } else {
        this.updateCategory('recommended')
      }
    }

    const { all, category } = this.parsedParams

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

  async refetchRepoDetails(): Promise<void> {
    await this.fetchBasicRepoDetails({ ...this.baseRouteParams, refetch: true })
    this.initializeQueryParams()
  }

  mounted(): void {
    this.$root.$on('refetchCheck', this.refetchIssues)
    this.$root.$on('repo-activation-triggered', this.refetchRepoDetails)
    this.$socket.$on('repo-analysis-updated', this.refetchIssues)
    this.$socket.$on('autofixrun-fixes-ready', this.refetchIssues)
  }

  beforeDestroy(): void {
    this.$root.$off('refetchCheck', this.refetchIssues)
    this.$root.$off('repo-activation-triggered', this.refetchRepoDetails)
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

  resolveIssueNodes(conn: RepositoryIssueConnection) {
    return resolveNodes(conn) as RepositoryIssue[]
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
<style scoped>
.category-sidebar {
  height: calc(100vh - 144px);
}
</style>
