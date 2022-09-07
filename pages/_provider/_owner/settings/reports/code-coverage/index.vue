<template>
  <div class="space-y-2">
    <z-input
      :value="queryParams.q"
      :show-border="false"
      background-color="ink-300"
      placeholder="Search for a repository..."
      @debounceInput="handleSearch"
    >
      <template slot="left">
        <z-icon icon="search" size="small" class="ml-1.5" />
      </template>
      <template slot="right">
        <z-icon
          v-show="queryParams.q"
          icon="x"
          size="small"
          class="cursor-pointer"
          @click="clearSearch"
        />
      </template>
    </z-input>

    <div v-if="codeCoverageReportList.length || codeCoverageReportListLoading">
      <code-coverage-table-loading v-if="codeCoverageReportListLoading" :row-count="loaderCount" />
      <code-coverage-table
        v-show="!codeCoverageReportListLoading"
        :linked-rows="true"
        :repo-coverage-list="codeCoverageReportList"
        :selected-sort-filter="queryParams.sort"
        @sort-filter-updated="handleSortUpdate"
      />
    </div>

    <lazy-empty-state
      v-else-if="queryParams.q"
      :title="`No results found for ${queryParams.q}`"
      :webp-image-path="require('~/assets/images/ui-states/directory/empty-search.webp')"
      :png-image-path="require('~/assets/images/ui-states/directory/empty-search.png')"
      class="border border-dashed rounded-lg border-ink-200 py-20"
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

    <div v-if="totalPageCount > 1" class="flex justify-center text-sm my-6">
      <z-pagination
        :page="currentPage"
        :total-pages="totalPageCount"
        :total-visible="5"
        @selected="updatePageNum"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZInput, ZIcon, ZPagination } from '@deepsourcelabs/zeal'

import PaginationMixin from '~/mixins/paginationMixin'
import RouteQueryMixin, { RouteQueryParamsT } from '~/mixins/routeQueryMixin'

import { codeCoverageReport } from '@/apollo/queries/reports/codeCoverageReport.gql'

import { resolveNodes } from '~/utils/array'

import { RepositoryCoverageReportItem } from '~/types/types'
import { GraphqlQueryResponse } from '~/types/apolloTypes'
import { CoverageSortT } from '~/types/reportTypes'

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
  components: {
    ZInput,
    ZIcon,
    ZPagination
  }
})
export default class OwnerCodeCoverage extends mixins(PaginationMixin, RouteQueryMixin) {
  codeCoverageReportList: Array<RepositoryCoverageReportItem> = []
  codeCoverageReportListLoading = false
  perPageCount = 50
  loaderCount = 20

  /**
   * Created hook. Sets query params and metadata.
   */
  created() {
    const { page, sort } = this.queryParams
    if (Number(page)) {
      this.currentPage = Number(page)
    }

    if (!sort) {
      // set sort type if it exists it cookies
      const defaultSortType = this.$cookies.get('code-coverage-report-sort-type')
      this.addFilters({ sort: defaultSortType })
    } else if (!(Object.values(CoverageSortT) as string[]).includes(sort as string)) {
      // check for invalid sort types entered in URL
      this.removeFilter('sort')
    }

    this.setLoaderCount()
  }

  /**
   * Fetch hook that triggers fetching of list of code coverage data.
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    this.fetchCodeCoverage(false)
  }

  /**
   * Fetch list of code coverage data.
   *
   * @params refetch boolean
   *
   * @returns {Promise<void>}
   */
  async fetchCodeCoverage(refetch = true): Promise<void> {
    const defaultSortType = this.$cookies.get('code-coverage-report-sort-type')

    if (this.queryParams.sort !== defaultSortType) {
      this.$cookies.set('code-coverage-report-sort-type', this.queryParams.sort)
    }

    const { owner: login, provider } = this.$route.params

    const { q, sort } = this.queryParams

    const first = this.perPageCount
    const offset = this.queryOffset

    this.codeCoverageReportListLoading = true

    try {
      const response = (await this.$fetchGraphqlData(
        codeCoverageReport,
        {
          login,
          provider: this.$providerMetaMap[provider].value,
          first,
          offset,
          sort,
          q
        },
        refetch
      )) as GraphqlQueryResponse

      this.totalCount = response.data.owner?.repositoriesCoverageReport?.totalCount ?? 0
      this.codeCoverageReportList =
        (resolveNodes(
          response.data.owner?.repositoriesCoverageReport
        ) as Array<RepositoryCoverageReportItem>) ?? []

      // Saves the latest list length in localstore
      if (
        this.codeCoverageReportList.length &&
        this.codeCoverageReportList.length !== this.loaderCount
      ) {
        this.loaderCount = this.codeCoverageReportList.length
        if (process.client) {
          this.$localStore.set(
            `${provider}-${login}`,
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
  clearSearch() {
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
   * Method to set loader count from localStorage
   */
  setLoaderCount() {
    if (process.client) {
      const { provider, owner } = this.$route.params
      const localCountFromStore = this.$localStore.get(
        `${provider}-${owner}`,
        'code-coverage-loader-count'
      ) as number
      this.loaderCount = localCountFromStore ?? 20
    } else {
      this.loaderCount = 20
    }
  }
}
</script>
