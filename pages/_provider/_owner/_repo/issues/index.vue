<template>
  <div class="grid grid-cols-1 pb-16 lg:grid-cols-16-fr lg:pb-0">
    <!-- Analyzer Tab -->
    <div
      class="analyzer-tab z-20 col-span-full flex flex-col justify-between space-y-2 border-b border-slate-400 bg-ink-400 py-2 pl-2 pr-4 lg:sticky lg:top-24 lg:flex-row lg:space-y-0 lg:space-x-2"
    >
      <issue-analyzer-selector
        :selected-analyzer="parsedParams.analyzer"
        @updateAnalyzer="updateAnalyzer"
      />
      <div class="flex w-auto items-center justify-end space-x-2">
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
      class="col-span-full m-4 mb-0 lg:hidden"
    />
    <!-- Group by Filter Section -->
    <div>
      <category-selector-mobile
        :issue-categories="issueCategories"
        :occurrence-counts="issueOccurrenceDistributionCounts"
        :active-sidebar-item="activeSidebarItem"
        @updateCategory="updateCategory"
      />
      <issue-category-selector
        :issue-categories="issueCategories"
        :occurrence-counts="issueOccurrenceDistributionCounts"
        :active-sidebar-item="activeSidebarItem"
        class="category-sidebar sticky"
        style="top: 147px"
        @update-category="updateCategory"
      >
        <template v-if="repository.errorCode === 3003 && hasRepoReadAccess" #cta>
          <activate-repo-cta :repository="repository" class="mx-2 mt-2" />
        </template>

        <template #footer>
          <z-radio-group
            :model-value="issueDistributionType"
            class="grid h-8 w-full min-w-52 flex-grow grid-cols-2 font-medium text-vanilla-100 shadow-blur-lg sm:w-auto sm:flex-grow-0"
            @change="handleDistributionTypeChange"
          >
            <z-radio-button
              :value="IssueOccurrenceDistributionType.PRODUCT"
              spacing="w-full h-full pt-1"
              class="text-center"
            >
              <z-icon icon="nested-list" class="inline" />
            </z-radio-button>
            <z-radio-button
              :value="IssueOccurrenceDistributionType.ISSUE_TYPE"
              spacing="w-full h-full pt-1"
              class="text-center"
            >
              <z-icon icon="flat-list" class="inline" />
            </z-radio-button>
          </z-radio-group>
        </template>
      </issue-category-selector>
    </div>
    <!-- List of issues -->
    <div v-if="issuesLoading" class="flex min-h-screen flex-grow flex-col gap-y-4 p-4">
      <div
        v-for="idx in 7"
        :key="idx"
        class="relative z-0 h-26 animate-pulse rounded-md bg-ink-300"
      ></div>
    </div>

    <div
      v-else
      class="flex flex-1 flex-grow flex-col gap-y-4 p-4 pb-10"
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
        :key="$route.fullPath"
        :page="queryParams.page"
        :total-pages="pageCount"
        :total-visible="5"
        class="flex justify-center"
        @selected="(page) => addFilters({ page })"
      />
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
import { ZIcon, ZButton, ZTag, ZPagination, ZRadioGroup, ZRadioButton } from '@deepsource/zeal'
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

import {
  IssueCategoryTypeFilterMap,
  IssueFilterChoice,
  IssueOccurrenceDistributionType,
  issueTypeDistributionList,
  IssueTypeOptions,
  productDistributionList,
  ProductTypeFilterMap,
  ProductTypeOptions
} from '~/types/issues'

const PAGE_SIZE = 25
const VISIBLE_PAGES = 5

export interface IssueListFilters extends RouteQueryParamsT {
  page?: number
  category?: string
  product?: string
  analyzer?: string
  q?: string
  sort?: string
  autofixAvailable?: boolean
  all?: boolean
  recommended?: boolean
  auditRequired?: boolean
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
    ZRadioGroup,
    ZRadioButton,
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
  public isUpgradeAccountModalOpen = false
  public currentPage: Maybe<number> = null
  public urlFilterState: Record<string, string | (string | null)[]> = {}
  public autofixIssue: Record<string, string | Array<string>> = {}
  public issuesLoading = false
  public issueDistributionType: IssueOccurrenceDistributionType =
    IssueOccurrenceDistributionType.ISSUE_TYPE

  // To use in template
  readonly IssueOccurrenceDistributionType = IssueOccurrenceDistributionType

  /**
   * Function to update category query param based on the new value received
   *
   * @param {string} newVal
   * @returns {void}
   */
  updateCategory(newVal: string, newSubCategory?: string): void {
    let filtersToAdd: Record<string, string | number | null> = {}

    if (
      this.issueDistributionType === IssueOccurrenceDistributionType.ISSUE_TYPE ||
      newVal === 'all' ||
      newVal === 'recommended'
    ) {
      filtersToAdd = { category: newVal, page: 1, product: null }
    } else if (this.issueDistributionType === IssueOccurrenceDistributionType.PRODUCT) {
      filtersToAdd = {
        product: newVal,
        page: 1,
        category: newSubCategory ?? 'all'
      }
    }

    this.addFilters(filtersToAdd)
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
    const { q, page, sort, analyzer, category, product, autofixAvailable } = this.queryParams

    if (q) parsed['q'] = q as string
    if (page) parsed['page'] = page as number
    if (sort) parsed['sort'] = sort as string
    if (analyzer && analyzer !== 'all') {
      parsed['analyzer'] = analyzer as string
    }
    if (autofixAvailable) {
      parsed['autofixAvailable'] = true
    }

    if (category && IssueCategoryTypeFilterMap[category as string]) {
      const categoryFilter = IssueCategoryTypeFilterMap[category as string]
      Object.assign(parsed, categoryFilter)
    }

    if (product && ProductTypeFilterMap[product as string]) {
      const productFilter = ProductTypeFilterMap[product as string]
      Object.assign(parsed, productFilter)
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
    // Ensure updates to query params happen before accessing
    await this.fetchIssuesForOwner()

    try {
      await Promise.all([
        this.fetchRepoDetails(this.baseRouteParams),
        this.fetchRepoPerms(this.baseRouteParams),
        this.fetchRepoAutofixStats(this.baseRouteParams),
        this.fetchIsCommitPossible(this.baseRouteParams)
      ])
    } catch (err) {
      this.$logErrorAndToast(
        err as Error,
        'Unable to fetch details for the repository. Please try again later or contact support.'
      )
    }
  }

  /**
   * Fetch occurrence counts, issue list and type distribution info
   *
   * @param {boolean} [refetch=false]
   * @returns {Promise<void>}
   */
  async fetchIssuesForOwner(refetch = false): Promise<void> {
    this.issuesLoading = true

    const {
      q,
      page,
      sort,
      analyzer,
      autofixAvailable,
      product,
      all,
      category,
      auditRequired,
      recommended
    } = this.parsedParams

    if (product && this.issueDistributionType !== IssueOccurrenceDistributionType.PRODUCT) {
      this.issueDistributionType = IssueOccurrenceDistributionType.PRODUCT
    }

    try {
      await this.fetchIssueOccurrenceDistributionCounts({
        ...this.baseRouteParams,
        distributionType: this.issueDistributionType,
        refetch
      })
    } catch (err) {
      this.$logErrorAndToast(
        err as Error,
        'Unable to fetch issue occurrence counts. Please try again later or contact support.'
      )
    }

    // only apply default category when no category is specified in query params or invalid params
    if (!this.queryParams.category || this.hasInvalidQueryParam) {
      if (this.issueOccurrenceDistributionCounts['recommended']) {
        this.updateCategory('recommended')
        return
      }
      this.updateCategory('all')
      return
    }

    try {
      await Promise.all([
        this.fetchIssueList({
          ...this.baseRouteParams,
          currentPageNumber: page,
          limit: PAGE_SIZE,
          sort,
          q,
          analyzer,
          product,
          issueType: category,
          autofixAvailable,
          auditRequired,
          recommended,
          all,
          refetch
        }),
        this.fetchIssueTypeSettings({ ...this.baseRouteParams, refetch })
      ])
    } catch (err) {
      this.$logErrorAndToast(
        err as Error,
        'Unable to fetch issues. Please try again later or contact support.'
      )
    }

    this.issuesLoading = false
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

  async handleDistributionTypeChange(
    distributionType: IssueOccurrenceDistributionType,
    refetch = false
  ) {
    this.issueDistributionType = distributionType

    await this.fetchIssueOccurrenceDistributionCounts({
      ...this.baseRouteParams,
      distributionType,
      refetch
    })

    if (this.issueOccurrenceDistributionCounts['recommended']) {
      this.updateCategory('recommended')
    } else {
      this.updateCategory('all')
    }
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
   * @param {Record<string, string | Array<string>>} issue
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

  get issueCategories(): Array<IssueFilterChoice> {
    if (this.issueDistributionType === IssueOccurrenceDistributionType.ISSUE_TYPE) {
      return issueTypeDistributionList
    }
    if (this.issueDistributionType === IssueOccurrenceDistributionType.PRODUCT) {
      return productDistributionList
    }

    return []
  }

  get issueOccurrenceDistributionCounts(): Record<string, number> {
    const distributionMap: Record<string, number> = {}
    if (this.issueDistributionType === IssueOccurrenceDistributionType.ISSUE_TYPE) {
      const issueOccurrenceDistributionByIssueType =
        this.repository?.issueOccurrenceDistributionByIssueType ?? []

      issueOccurrenceDistributionByIssueType.forEach((el) => (distributionMap[el.key] = el.count))
    } else if (this.issueDistributionType === IssueOccurrenceDistributionType.PRODUCT) {
      const issueOccurrenceDistributionByProduct =
        this.repository?.issueOccurrenceDistributionByProduct ?? []

      issueOccurrenceDistributionByProduct.forEach((el) => (distributionMap[el.key] = el.count))
    }

    return distributionMap
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

  get hasInvalidQueryParam(): boolean {
    const { product, category } = this.queryParams

    return (
      Boolean(product && !ProductTypeFilterMap[product as string]) ||
      Boolean(category && !IssueCategoryTypeFilterMap[category as string])
    )
  }

  get issueCategoryName(): string {
    // Return early if the category is falsy or anything among `all` or `recommended`
    if (!this.isDefinedCategory) {
      return ''
    }

    const match = issueTypeDistributionList.find(
      (category) => category.shortcode === this.queryParams.category
    )

    return match?.name || ''
  }

  get hasIssuesCount(): boolean {
    const totalIssueCount = this.issueList?.totalCount ?? 0
    return totalIssueCount > 0
  }

  get isDefinedCategory(): boolean {
    // Returns `true` if `category` is truthy and it is not set to `all` or `recommended`.
    const { category } = this.queryParams
    return Boolean(category && category !== 'all' && category !== 'recommended')
  }

  get issueCategoryIsCoverage(): boolean {
    const { category, product } = this.queryParams
    return category === IssueTypeOptions.COVERAGE || product === ProductTypeOptions.COVERAGE
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

  get activeSidebarItem(): string {
    const { category, product } = this.queryParams

    if (product && category) {
      // If category type is "all", we just return the product type alone
      if (category === 'all') {
        return product as string
      }

      // But if the category is anything else, we return the combo
      return `${product}-${category}`
    }

    return (category || product || '') as string
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
