<template>
  <public-report-page-wrapper
    :level="level"
    :owner-login="ownerLogin"
    :created-at="createdAt"
    :report-key="ReportPageT.CODE_COVERAGE"
  >
    <section class="space-y-4">
      <z-input
        :value="queryParams.q"
        :show-border="false"
        background-color="ink-300"
        placeholder="Search for a repository..."
        @debounceInput="handleSearch"
      >
        <template #left>
          <z-icon icon="search" size="small" class="ml-1.5" />
        </template>
        <template #right>
          <z-icon
            v-show="queryParams.q"
            icon="x"
            size="small"
            class="cursor-pointer"
            @click="clearSearchParam"
          />
        </template>
      </z-input>
      <div
        v-if="
          (codeCoverageReportList && codeCoverageReportList.length) || codeCoverageReportListLoading
        "
      >
        <code-coverage-table-loading
          v-if="codeCoverageReportListLoading"
          :row-count="loaderCount"
        />
        <code-coverage-table
          v-else-if="codeCoverageReportList && codeCoverageReportList.length"
          :repo-coverage-list="codeCoverageReportList"
          :selected-sort-filter="queryParams.sort"
          @sort-filter-updated="handleSortUpdate"
        />
      </div>
      <lazy-empty-state
        v-else-if="
          queryParams.q &&
          !(
            (codeCoverageReportList && codeCoverageReportList.length) ||
            codeCoverageReportListLoading
          )
        "
        :title="`No results found for '${queryParams.q}'`"
        :webp-image-path="require('~/assets/images/ui-states/directory/empty-search.webp')"
        :png-image-path="require('~/assets/images/ui-states/directory/empty-search.gif')"
        subtitle="Please try changing your search query."
        class="rounded-lg border border-dashed border-slate-400 py-20"
      />

      <lazy-empty-state
        v-else
        :webp-image-path="require('~/assets/images/ui-states/metrics/no-data-found-136px.webp')"
        :png-image-path="require('~/assets/images/ui-states/metrics/no-data-found-136px.png')"
        :show-border="true"
        title="Not enough data"
      >
        <template #subtitle>
          We do not have enough data for code coverage yet. <br class="hidden md:block" />
          Please come back later.
        </template>
      </lazy-empty-state>

      <div v-if="totalPageCount > 1" class="my-6 flex justify-center text-sm">
        <z-pagination
          :page="currentPage"
          :total-pages="totalPageCount"
          :total-visible="5"
          @selected="updatePageNum"
        />
      </div>
    </section>
  </public-report-page-wrapper>
</template>

<script lang="ts">
import { Component, mixins, Prop } from 'nuxt-property-decorator'

import PaginationMixin from '~/mixins/paginationMixin'
import RouteQueryMixin, { RouteQueryParamsT } from '~/mixins/routeQueryMixin'

import { publicReportCoverageReport } from '@/apollo/queries/reports/publicReportCoverageReport.gql'

import { resolveNodes } from '~/utils/array'

import { ReportLevel, RepositoryCoverageReportItem } from '~/types/types'
import { GraphqlQueryResponse } from '~/types/apolloTypes'
import { CoverageSortT, ReportMeta, ReportPageT } from '~/types/reportTypes'
import PublicReportMixin from '~/mixins/publicReportMixin'

export interface CodeCoverageFilters extends RouteQueryParamsT {
  q: string
  sort: string
  page: number
}

/**
 * Page for displaying the code coverage report.
 */
@Component({
  layout: 'dashboard',
  scrollToTop: true
})
export default class PublicReportCodeCoverage extends mixins(
  PaginationMixin,
  RouteQueryMixin,
  PublicReportMixin
) {
  @Prop()
  shareHistoricalData: boolean

  @Prop()
  level: ReportLevel

  @Prop({ default: '' })
  ownerLogin: string

  @Prop()
  createdAt: string

  @Prop()
  token: string

  readonly ReportPageT = ReportPageT

  codeCoverageReportList: Array<RepositoryCoverageReportItem> = []
  codeCoverageReportListLoading = false
  perPageCount = 50
  loaderCount = 20

  /**
   * Created hook. Sets query params and metadata.
   */
  created() {
    const reportTitle = ReportMeta[ReportPageT.CODE_COVERAGE].title
    this.setPageMetaData(reportTitle, this.ownerLogin)

    const { page, sort } = this.queryParams

    // Set current page number from query params
    if (Number(page)) {
      this.currentPage = Number(page)
    }

    // check for invalid sort types entered in URL
    if (sort && !(Object.values(CoverageSortT) as string[]).includes(sort as string)) {
      this.removeFilter('sort')
    }

    this.setLoaderCount()
  }

  /**
   * Fetch hook for Vue component that fetches the report.
   *
   * @returns {Promise<void>}
   */
  async mounted(): Promise<void> {
    await this.fetchCodeCoverage(false)
  }

  /**
   * Fetch list of code coverage data.
   *
   * @param {boolean} refetch
   *
   * @returns {Promise<void>}
   */
  async fetchCodeCoverage(refetch: boolean = true): Promise<void> {
    const { reportId } = this.$route.params

    const { q, sort } = this.queryParams

    const first = this.perPageCount
    const offset = this.queryOffset

    this.codeCoverageReportListLoading = true

    try {
      const response = (await this.$fetchGraphqlData(
        publicReportCoverageReport,
        {
          reportId,
          first,
          offset,
          sort,
          q,
          token: this.token
        },
        refetch
      )) as GraphqlQueryResponse

      this.totalCount = response.data.publicReport?.repositoriesCoverageReport?.totalCount ?? 0
      this.codeCoverageReportList =
        resolveNodes(response.data.publicReport?.repositoriesCoverageReport) ?? []

      // Saves the latest list length in localstore
      if (
        this.codeCoverageReportList.length &&
        this.codeCoverageReportList.length !== this.loaderCount
      ) {
        this.loaderCount = this.codeCoverageReportList.length
        if (process.client) {
          this.$localStore.set(
            `${reportId}`,
            'code-coverage-loader-count',
            this.codeCoverageReportList.length
          )
        }
      }
    } catch (e) {
      this.$logErrorAndToast(
        e as Error,
        'Unable to fetch data for Code coverage report. Please contact support.'
      )
    } finally {
      this.codeCoverageReportListLoading = false
    }
  }

  /**
   * Handler for clear search. Clear search and refetch.
   */
  clearSearchParam() {
    this.removeFilter('q')
  }

  /**
   * Handler for sort filter update. Set sort type and refetch.
   *
   * @param {string} newSort
   */
  handleSortUpdate(newSort: string) {
    this.addFilters({ sort: newSort })
  }

  /**
   * Handler for search input. Set search query, reset pagination and refetch.
   *
   * @param {string} query
   */
  handleSearch(query: string) {
    this.updatePageNum(1)
    this.addFilters({ q: query })
  }

  /**
   * Method to update page number
   *
   * @param {number} newPage
   */
  updatePageNum(newPage: number) {
    this.currentPage = newPage
    this.addFilters({ page: newPage })
  }

  /**
   * Callback for route replace
   *
   * @return {Promise<void>}
   */
  async refetchAfterRouteChange(): Promise<void> {
    await this.fetchCodeCoverage(false)
  }

  /**
   * Method to set loader count from localStorage
   */
  setLoaderCount() {
    if (process.client) {
      const { reportId } = this.$route.params
      const localCountFromStore = this.$localStore.get(
        `${reportId}`,
        'code-coverage-loader-count'
      ) as number
      this.loaderCount = localCountFromStore ?? 20
    } else {
      this.loaderCount = 20
    }
  }

  get showEmptyDataState(): boolean {
    if (this.queryParams.q) {
      return false
    } else if (this.codeCoverageReportListLoading) {
      return false
    } else if (this.codeCoverageReportList && this.codeCoverageReportList.length) {
      return false
    }
    return true
  }
}
</script>
