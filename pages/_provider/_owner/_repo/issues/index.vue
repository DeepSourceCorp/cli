<template>
  <div class="grid grid-cols-1 pb-16 lg:grid-cols-16-fr lg:pb-0">
    <!-- Analyzer Tab -->
    <div
      class="z-20 flex flex-col justify-between py-2 pl-2 pr-4 space-y-2 border-b lg:flex-row lg:space-y-0 lg:space-x-2 border-slate-400 lg:sticky lg:top-24 bg-ink-400 col-span-full analyzer-tab"
    >
      <issue-analyzer-selector
        @updateAnalyzer="updateAnalyzer"
        :selected-analyzer="parsedParams.analyzer"
      />
      <div class="flex items-center justify-end w-auto space-x-2">
        <issue-sort
          :selected-sort-filter="parsedParams.sort"
          @updateSortFilter="(value) => addFilters({ sort: value })"
          @reset="removeFilter('sort')"
        />
        <autofix-available
          v-if="allowAutofix && hasRepoReadAccess"
          :autofix-available="parsedParams.autofixAvailable"
          @toggleAutofix="(value) => addFilters({ autofixAvailable: value })"
        />
        <issue-search
          :search-candidate="parsedParams.q"
          placeholder="Search for an issue..."
          @updateSearch="(value) => addFilters({ q: value })"
        />
      </div>
    </div>
    <!-- Main Content -->
    <!-- Activate CTA for mobile views -->
    <activate-repo-cta
      v-if="repository.errorCode === 3003 && hasRepoReadAccess"
      :repository="repository"
      class="m-4 mb-0 col-span-full lg:hidden"
    />
    <!-- Group by Filter Section -->
    <div>
      <category-selector-mobile
        :selected-category="queryParams.category"
        @updateCategory="updateCategory"
      />
      <issue-category-selector
        :selected-category="queryParams.category"
        class="sticky category-sidebar"
        style="top: 147px"
        @updateCategory="updateCategory"
      >
        <template v-slot:cta v-if="repository.errorCode === 3003 && hasRepoReadAccess">
          <activate-repo-cta :repository="repository" class="mx-2 mt-2" />
        </template>
      </issue-category-selector>
    </div>
    <!-- List of issues -->
    <div v-if="issuesLoading" class="flex flex-col flex-grow min-h-screen p-4 gap-y-4">
      <div
        v-for="idx in 7"
        :key="idx"
        class="relative z-0 rounded-md h-26 bg-ink-300 animate-pulse"
      ></div>
    </div>
    <div
      v-else
      class="flex flex-col flex-1 flex-grow p-4 pb-10 gap-y-4"
      :class="{
        'lg:h-64': issueList.totalCount === 0,
        'max-h-auto': issueList && issueList.totalCount && issueList.totalCount > 0
      }"
    >
      <template v-if="issueList.totalCount">
        <issue-list-item
          v-for="issue in resolveIssueNodes(issueList)"
          v-bind="issue"
          :key="issue.id"
          :show-autofix-button="allowAutofix && hasRepoReadAccess"
          :disable-autofix-button="!canCreateAutofix"
          :issue-link="$generateRoute(['issue', issue.shortcode || '', 'occurrences'])"
          @autofix="openAutofixModal"
        />
      </template>

      <template v-else>
        <lazy-empty-state
          v-if="issueCategoryDisabled && !hasIssuesCount"
          :use-v2="true"
          :webp-image-path="disabledStateImagePath.webp"
          :png-image-path="disabledStateImagePath.png"
          :show-border="true"
          :title="`${issueCategoryName} issues are not being reported`"
          :subtitle="disabledStateSubtitle"
          content-width="max-w-xs"
        >
          <template #action>
            <!-- Using the click handler here instead of the `to` prop since it was resulting in a reload while navigating -->
            <z-button size="small" @click="$router.push($generateRoute(['settings', 'reporting']))">
              <span>Open repository settings</span>
              <z-icon icon="arrow-right" color="current" />
            </z-button>
          </template>
        </lazy-empty-state>

        <lazy-empty-state
          v-else-if="parsedParams.q"
          :png-image-path="require('~/assets/images/ui-states/directory/empty-search.gif')"
          :webp-image-path="require('~/assets/images/ui-states/directory/empty-search.webp')"
          :show-border="true"
          :title="`No results found for '${parsedParams.q}'`"
          :alt-text="`No results found for '${parsedParams.q}'`"
          subtitle="Please try changing the search query or clearing the filters."
        />

        <lazy-empty-state
          v-else
          :webp-image-path="
            require('~/assets/images/ui-states/issues/no-issues-found-static-140px.webp')
          "
          :png-image-path="
            require('~/assets/images/ui-states/issues/no-issues-found-static-140px.png')
          "
          title="No issues found"
          subtitle="That's a good thing, right?!"
          alt-text="No issues found"
        />
      </template>

      <z-pagination
        v-if="pageCount > 1"
        :page="queryParams.page"
        :key="$route.fullPath"
        :total-pages="pageCount"
        :total-visible="5"
        class="flex justify-center"
        @selected="(page) => addFilters({ page })"
      ></z-pagination>
    </div>
    <!-- Autofix Modal -->
    <autofix-file-chooser
      v-bind="autofixIssue"
      :is-open="isAutofixOpen"
      @close="isAutofixOpen = false"
      @run-quota-exhausted="openUpgradeAccountModal"
    />
    <upgrade-account-modal
      v-if="isUpgradeAccountModalOpen"
      :login="$route.params.owner"
      :provider="$route.params.provider"
      @close="isUpgradeAccountModalOpen = false"
    />
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZButton, ZTag, ZPagination } from '@deepsource/zeal'
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
import RouteQueryMixin, { RouteQueryParamsT } from '~/mixins/routeQueryMixin'
import { resolveNodes } from '~/utils/array'
import IssueCategoryMixin from '~/mixins/issueCategoryMixin'

import RepositoryIssuesTotalCountGQLQuery from '~/apollo/queries/repository/issue/totalCount.gql'

const PAGE_SIZE = 25
const VISIBLE_PAGES = 5

export interface IssueListFilters extends RouteQueryParamsT {
  page?: number
  category?: string
  analyzer?: string
  q?: string
  sort?: string
  autofixAvailable?: boolean
  all?: boolean
}

/**
 * Class for `Issues` page. Lists the issues reported for the repository under various categories.
 */
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
  IssueCategoryMixin,
  IssueListMixin,
  RoleAccessMixin,
  RouteQueryMixin
) {
  public isAutofixOpen = false
  public isActivationModalOpen = false
  public isUpgradeAccountModalOpen = false
  public currentPage: Maybe<number> = null
  public urlFilterState: Record<string, string | (string | null)[]> = {}
  public autofixIssue: Record<string, string | Array<string>> = {}
  public issuesLoading = false

  totalIssuesCountForCategory = 0

  /**
   * Function to update category query param based on the new value received
   *
   * @param {string} newVal
   * @returns {void}
   */
  updateCategory(newVal: string): void {
    this.addFilters({ category: newVal, page: 1 })
  }

  /**
   * Function to update analyzer query param based on the new value received
   *
   * @param {string} newVal
   * @returns {void}
   */
  updateAnalyzer(newVal: string): void {
    this.addFilters({ analyzer: newVal, page: 1 })
  }

  get parsedParams(): IssueListFilters {
    const parsed = {} as IssueListFilters
    const { q, page, sort, analyzer, category, autofixAvailable } = this.queryParams

    if (q) parsed['q'] = q as string
    if (page) parsed['page'] = page as number
    if (sort) parsed['sort'] = sort as string
    if (analyzer && analyzer !== 'all') {
      parsed['analyzer'] = analyzer as string
    }
    if (this.isDefinedCategory) {
      parsed['category'] = category as string
    } else {
      parsed['category'] = undefined
      parsed['all'] = category === 'all'
    }
    if (autofixAvailable) {
      parsed['autofixAvailable'] = true
    }

    return parsed
  }

  /**
   * The fetch hook
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    await this.getIssuesData()
  }

  /**
   * Callback for route replace
   *
   * @return {Promise<void>}
   */
  async refetchAfterRouteChange(): Promise<void> {
    // don't use fetch, because it cannot be executed concurrently
    await this.getIssuesData()
  }

  /**
   * Methods to fetch all the data required for the page
   * Also used as a callback for refetch after route replace
   *
   * @return {Promise<void>}
   */
  async getIssuesData(): Promise<void> {
    this.issuesLoading = true
    await Promise.all([
      this.fetchRepoDetails(this.baseRouteParams),
      this.fetchRepoPerms(this.baseRouteParams)
    ])

    // Ensure updates to query params happen before accessing
    await this.fetchIssuesForOwner()

    // Fetch the issues count associated with an issue type except `all` and `recommended`
    if (this.isDefinedCategory) {
      const args = {
        ...this.baseRouteParams,
        provider: this.$providerMetaMap[this.$route.params.provider].value,
        issueType: this.queryParams.category
      }
      const response = await this.$fetchGraphqlData(RepositoryIssuesTotalCountGQLQuery, args)

      this.totalIssuesCountForCategory = response.data.repository.issues.totalCount
    }

    this.fetchRepoAutofixStats(this.baseRouteParams)
    this.fetchIsCommitPossible(this.baseRouteParams)
    this.issuesLoading = false
  }

  /**
   * Fetch issue list and type distribution info
   *
   * @param {boolean} [refetch=false]
   * @returns {Promise<void>}
   */
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
    if (!this.queryParams.category && Array.isArray(this.repository.issueTypeDistribution)) {
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

  /**
   * Refetch issues on websocket event
   *
   * @returns {Promise<void>}
   */
  refetchIssues(): void {
    this.fetchIssuesForOwner(true)
  }

  /**
   * Refetch repo details on websocket event
   *
   * @returns {Promise<void>}
   */
  async refetchRepoDetails(): Promise<void> {
    await this.fetchBasicRepoDetails({ ...this.baseRouteParams, refetch: true })
  }

  /**
   * Mounted hook for the page
   *
   * @returns {void}
   */
  mounted(): void {
    this.$root.$on('refetchCheck', this.refetchIssues)
    this.$root.$on('repo-activation-triggered', this.refetchRepoDetails)
    this.$socket.$on('repo-analysis-updated', this.refetchIssues)
    this.$socket.$on('autofixrun-fixes-ready', this.refetchIssues)
  }

  /**
   * BeforeDestroy hook for the page
   *
   * @returns {void}
   */
  beforeDestroy(): void {
    this.$root.$off('refetchCheck', this.refetchIssues)
    this.$root.$off('repo-activation-triggered', this.refetchRepoDetails)
    this.$socket.$off('repo-analysis-updated', this.refetchIssues)
    this.$socket.$off('autofixrun-fixes-ready', this.refetchIssues)
  }

  /**
   * Function to open Autofix modal on the autofix event
   *
   * @param {issue: Record<string, string | Array<string>>} issue
   * @returns {void}
   */
  public openAutofixModal(issue: Record<string, string | Array<string>>): void {
    this.autofixIssue = { ...issue }
    this.isAutofixOpen = true
  }

  /**
   * Function to open Upgrade account modal on the runQuotaExhausted event
   *
   * @returns {void}
   */
  public openUpgradeAccountModal() {
    this.isAutofixOpen = false
    this.isUpgradeAccountModalOpen = true
  }

  get canCreateAutofix(): boolean {
    if (!this.allowAutofix) {
      return false
    }
    return this.$gateKeeper.repo(RepoPerms.CREATE_AUTOFIXES, this.repoPerms.permission)
  }

  get pageCount(): number {
    if (this.issueList.totalCount) return Math.ceil(this.issueList.totalCount / PAGE_SIZE)
    return 0
  }

  get totalVisible(): number {
    return this.pageCount >= VISIBLE_PAGES ? VISIBLE_PAGES : this.pageCount
  }

  get issueCategoryDisabled(): boolean {
    // Return early if the category is falsy or anything among `all` or `recommended`
    if (!this.isDefinedCategory) {
      return false
    }

    const status = this.repository.issueTypeSettings?.find(
      (issueType) => issueType?.slug === this.queryParams.category
    )

    return status?.isIgnoredToDisplay as boolean
  }

  get issueCategoryName(): string {
    // Return early if the category is falsy or anything among `all` or `recommended`
    if (!this.isDefinedCategory) {
      return ''
    }

    const match = this.issueCategories.find(
      (category) => category?.shortcode === this.queryParams.category
    )

    return match?.name || ''
  }

  get hasIssuesCount(): boolean {
    return Boolean(this.totalIssuesCountForCategory)
  }

  get isDefinedCategory(): boolean {
    // Returns `true` if `category` is truthy and it is not set to `all` or `recommended`.
    const { category } = this.queryParams
    return Boolean(category && category !== 'all' && category !== 'recommended')
  }

  get issueCategoryIsCoverage(): boolean {
    return this.issueCategoryName.toLowerCase() === 'coverage'
  }

  get disabledStateImagePath(): Record<string, string> {
    if (this.issueCategoryIsCoverage) {
      return {
        webp: require('~/assets/images/ui-states/metrics/set-up-code-coverage-136px.webp'),
        png: require('~/assets/images/ui-states/metrics/set-up-code-coverage-136px.png')
      }
    }

    return {
      webp: require('~/assets/images/ui-states/runs/no-recent-analyses.webp'),
      png: require('~/assets/images/ui-states/runs/no-recent-analyses.png')
    }
  }

  get disabledStateSubtitle(): string {
    return this.issueCategoryIsCoverage
      ? 'Configure your CI to send code coverage metrics to start tracking this metric.'
      : `You can change this in the repository's settings. Once enabled, ${this.issueCategoryName.toLowerCase()} issues will start getting reported from the next analysis`
  }

  /**
   * Function to construct an array with the nodes alone
   *
   * @param {RepositoryIssueConnection} conn
   * @returns {RepositoryIssue[]}
   */
  resolveIssueNodes(conn: RepositoryIssueConnection) {
    return resolveNodes(conn) as RepositoryIssue[]
  }

  /**
   * The head method to set the HTML Head tags for issues page
   *
   * @returns {Record<string, string>}
   */
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
  height: calc(100vh - 147px);
}
</style>
