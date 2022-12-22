<template>
  <div class="flex flex-col min-h-full bg-ink-400">
    <directory-header
      :info-obj="analyzer"
      :heading-level="isIssuesPage ? 'h1' : 'h2'"
      @menu-toggle="toggleMobileFilters"
    />
    <directory-tabs :active-tab="1" :analyzer-url="analyzerUrl" />
    <!-- <div class="grid grid-cols-1 lg:grid-cols-12"> -->
    <div class="lg:flex lg:flex-grow">
      <div
        v-if="analyzer && analyzer.issues"
        class="hidden w-full p-4 text-sm border-r max-w-min border-slate-400 lg:block"
      >
        <analyzer-issues-filter
          :active-filter="issueCategory"
          :issue-distribution="analyzer.issueTypeDistribution"
          :total-issue-count="analyzer.issues.totalCount"
          :is-issues-page="isIssuesPage"
          :analyzer-shortcode="analyzer.shortcode || $route.params.analyzer"
          @selected="filterByIssueType"
        />
      </div>
      <analyzer-issues-filter-mobile
        v-if="analyzer && analyzer.issues && filterVisible && isIssuesPage"
        :active-filter="issueCategory"
        :issue-distribution="analyzer.issueTypeDistribution"
        :total-issue-count="analyzer.issues.totalCount"
        @selected="filterByIssueType"
      />
      <div class="flex-grow w-screen pb-12 bg-ink-400 lg:w-auto">
        <nuxt-child
          :analyzer="analyzer"
          :is-loaded="isLoaded"
          :per-page-count="perPageCount"
          :current-page="currentPage"
          :issue-type-titles="issueTypeTitles"
          @filter-by-autofix="filterByAutofixable"
          @filter-by-text="searchDir"
          @update-page="updatePageNum"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Watch, mixins } from 'nuxt-property-decorator'

import { ZButton, ZInput, ZIcon, ZPagination } from '@deepsource/zeal'

import { DirectoryActions, DirectoryGetters } from '~/store/directory/directory'
import { Analyzer, Issue } from '~/types/types'
import { resolveNodes } from '~/utils/array'
import IssueTypeT from '~/types/issueDistribution'
import MetaMixin from '~/mixins/metaMixin'

const directoryStore = namespace('directory/directory')

interface IssuesFilterT {
  shortcode: string
  first?: number
  offset?: number
  autofixAvailable?: boolean
  q?: string
  issueType?: string
}

@Component({
  components: { ZButton, ZIcon, ZInput, ZPagination },
  layout: 'sidebar-only',
  scrollToTop: true
})
export default class AnalyzerDirectoryDetails extends mixins(MetaMixin) {
  setCanonical = true

  @directoryStore.Getter(DirectoryGetters.DIRECTORY_ANALYZERS)
  analyzerList: Analyzer[]

  @directoryStore.Action(DirectoryActions.FETCH_ANALYZER_DIR_LIST)
  fetchAnalyzers: (arg?: { q: string }) => Promise<void>

  @directoryStore.Action(DirectoryActions.FETCH_ANALYZER_ISSUES)
  fetchAnalyzerIssues: (arg: {
    shortcode: string
    first?: number
    offset?: number
    autofixAvailable?: boolean
    q?: string
    issueType?: string
  }) => Promise<Analyzer | undefined>

  private fetchedAnalyzer = {} as Analyzer | undefined
  private onlyAutofix = false
  private searchTerm = ''
  private issueCategory = ''
  private isLoaded = false
  private perPageCount = 5
  private currentPage = 1
  private filterVisible = true

  created() {
    this.metaImage = require('~/assets/images/analyzer-dir/directory_meta_banner.png')
    this.metaImageAlt =
      'An image with the text DeepSource | Directory with logos of Python, JavaScript, Ruby, Docker, Go, Prettier and Black in the background indicating that our analyzers support them.'
  }

  async fetch(): Promise<void> {
    const shortcode = this.$route.params.analyzer
    if (!shortcode) this.$nuxt.error({ statusCode: 404 })
    const issueType = (this.$route.query['filter-preset'] as string) || ''
    const queryFilter = { shortcode, first: 5, issueType: '' }
    if (typeof issueType === 'string' && issueType) {
      queryFilter.issueType = issueType
      this.issueCategory = issueType
    }
    if (!Object.keys(this.analyzerList).length) {
      this.fetchAnalyzers().catch(() => {})
    }
    if (shortcode) {
      const analyzer = await this.fetchAnalyzerIssues(queryFilter)
      if (analyzer && Object.keys(analyzer).length) this.fetchedAnalyzer = analyzer
      else this.$nuxt.error({ statusCode: 404, message: `Analyzer "${shortcode}" does not exist!` })
    }
    this.isLoaded = true
  }

  get analyzer(): Analyzer {
    let partialData = {} as Analyzer | undefined
    if (this.analyzerList && this.$route.params.analyzer) {
      partialData = this.analyzerList.find(
        (analyzer) => analyzer.shortcode === this.$route.params.analyzer
      )
    }
    return Object.assign({}, partialData, this.fetchedAnalyzer)
  }

  get analyzerUrl(): string {
    return `/directory/analyzers/${this.analyzer.shortcode || this.$route.params.analyzer}`
  }

  get analyzerIssues(): Issue[] {
    return resolveNodes(this.analyzer.issues) as Issue[]
  }

  get totalPageCount(): number {
    if (this.analyzer && this.analyzer.issues.totalCount)
      return Math.ceil(this.analyzer.issues.totalCount / this.perPageCount)
    return 0
  }

  get queryOffset(): number {
    return (this.currentPage - 1) * this.perPageCount
  }

  get issueTypeTitles(): Record<string, string> {
    const returnObj = {} as Record<string, string>
    if (this.analyzer.issueTypeDistribution)
      (this.analyzer.issueTypeDistribution as IssueTypeT[]).forEach((issueType) => {
        returnObj[issueType.shortcode] = issueType.title
      })
    return returnObj
  }

  get isIssuesPage(): boolean {
    if (this.$route.params.issue) return false
    return true
  }

  async filterResults(): Promise<void> {
    this.isLoaded = false
    const filter = {
      q: this.searchTerm,
      offset: this.queryOffset,
      shortcode: this.analyzer.shortcode || this.$route.params.analyzer,
      issueType: this.issueCategory
    } as IssuesFilterT
    if (this.onlyAutofix) filter.autofixAvailable = this.onlyAutofix
    this.fetchedAnalyzer = await this.fetchAnalyzerIssues(filter)
    this.isLoaded = true
  }

  filterByAutofixable(): void {
    this.onlyAutofix = !this.onlyAutofix
    this.currentPage = 1
    this.filterResults().catch(() => {})
  }

  searchDir(val: string): void {
    this.searchTerm = val
    this.currentPage = 1
    this.filterResults().catch(() => {})
  }

  updatePageNum(val: number): void {
    this.currentPage = val
    this.filterResults().catch(() => {})
  }

  filterByIssueType(category: string): void {
    this.issueCategory = category
    this.currentPage = 1
    this.filterResults().catch(() => {})
  }

  toggleMobileFilters(toggleStatus: boolean): void {
    this.filterVisible = !toggleStatus
  }

  @Watch('$route.path')
  resetData(): void {
    this.onlyAutofix = false
    this.searchTerm = ''
    const issueType = (this.$route.query['filter-preset'] as string) || ''
    if (typeof issueType === 'string' && issueType) this.issueCategory = issueType
    else this.issueCategory = ''
    this.currentPage = 1
    this.filterResults().catch(() => {})
  }
}
</script>
