<template>
  <div class="flex flex-col gap-y-4">
    <chart-container>
      <template #report-stats>
        <chart-stat :value="currentVal" :loading="reportsDataLoading" title="Issues Autofixed" />
      </template>

      <template #report-control>
        <date-range-picker
          :selected-filter="dateRangeFilter"
          :date-range-options="dateRangeOptions"
          @change="fetchHistoricValuesAndSetChartData"
        />
      </template>

      <div
        v-if="historicalValuesLoading"
        class="h-report-chart mx-5 my-1.5 animate-pulse rounded-lg bg-ink-300"
      ></div>
      <div v-else>
        <template v-if="shouldChartBeShown">
          <z-chart
            :key="reportRerenderKey"
            :data-sets="datasets"
            :labels="labels"
            :colors="chartColors"
            :bar-options="{ stacked: true }"
            :axis-options="{
              xIsSeries: true
            }"
            :y-axis-min="0"
            type="bar"
          />
          <report-chart-legend :datasets="datasets" class="px-5" />
        </template>
        <div v-else class="h-full px-5">
          <lazy-empty-chart
            :count="2"
            :stacked="true"
            :chart-colors="chartColors"
            chart-type="bar"
          />
        </div>
      </div>
    </chart-container>

    <recent-stats :current-val="currentVal" :stats="recentStats" :loading="recentStatsLoading" />
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'

import RepoDetailMixin from '~/mixins/repoDetailMixin'
import ReportMixin from '~/mixins/reportMixin'

import { shortenLargeNumber } from '~/utils/string'
import { ReportLevel } from '~/types/types'
import { ReportMeta, ReportPageT } from '~/types/reportTypes'
import { getFormattedIssuesAutofixedChartData } from '~/utils/reports'

/**
 * Repository level page for displaying the current and historical data of the issues Autofixed.
 */
@Component({
  layout: 'repository',
  methods: {
    shortenLargeNumber
  }
})
export default class IssuesAutofixedPage extends mixins(RepoDetailMixin, ReportMixin) {
  readonly chartColors: string[] = ReportMeta[ReportPageT.ISSUES_AUTOFIXED].colors ?? []

  /**
   * Fetch report base data recent stats, and trigger chart data fetching.
   *
   * @returns {Promise<void>}
   */
  async mounted(): Promise<void> {
    const { repo, provider, owner } = this.$route.params
    try {
      if (!this.validateRepoDetails(this.repository)) {
        await this.fetchBasicRepoDetails({
          name: repo,
          provider,
          owner,
          refetch: true
        })
      }
    } catch (e) {
      this.$logErrorAndToast(
        e as Error,
        'Unable to fetch repository details, please contact support.'
      )
    }

    // All three queries below have a try-catch block inside them
    await Promise.all([
      this.fetchReportBase(
        ReportLevel.Repository,
        this.repository.id,
        ReportPageT.ISSUES_AUTOFIXED
      ),
      this.fetchRecentStats(
        ReportLevel.Repository,
        this.repository.id,
        ReportPageT.ISSUES_AUTOFIXED
      ),
      this.fetchHistoricValuesAndSetChartData()
    ])
  }

  /**
   * fetch historical values and set the chart dataset
   *
   * @param {string} [newDateRange]
   * @returns {Promise<void>}
   */
  async fetchHistoricValuesAndSetChartData(newDateRange?: string): Promise<void> {
    if (newDateRange) {
      this.dateRangeFilter = newDateRange
    }

    await this.fetchHistoricalValues(
      ReportLevel.Repository,
      this.repository.id,
      ReportPageT.ISSUES_AUTOFIXED
    )

    this.datasets = getFormattedIssuesAutofixedChartData(this.historicalValues)
  }
}
</script>
