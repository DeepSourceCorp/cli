<template>
  <div class="flex flex-col gap-y-4">
    <chart-container>
      <template #report-stats>
        <chart-stat
          :value="shortenLargeNumber(currentVal)"
          :loading="reportsDataLoading"
          title="Issues Autofixed"
        />
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
        class="h-72 mx-5 my-1.5 rounded-lg bg-ink-300 animate-pulse"
      ></div>
      <div v-else>
        <z-chart
          v-if="shouldChartBeShown"
          :data-sets="datasets"
          :labels="labels"
          :colors="['juniper-500', 'juniper-100']"
          :bar-options="{ stacked: true }"
          :axis-options="{
            xIsSeries: true
          }"
          :y-axis-min="0"
          type="bar"
        />
        <div v-show="!shouldChartBeShown" class="h-full px-5">
          <lazy-empty-chart :count="2" :stacked="true" chart-type="bar" base-shade="#33CB9A" />
        </div>
      </div>
    </chart-container>

    <recent-stats :current-val="currentVal" :stats="recentStats" :loading="recentStatsLoading" />
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZChart } from '@deepsourcelabs/zeal'

import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import ReportMixin from '~/mixins/reportMixin'

import { shortenLargeNumber } from '~/utils/string'
import { ReportLevel } from '~/types/types'
import { ReportPageT } from '~/types/reportTypes'

/**
 * Owner level page for displaying the current and historical data of the issues Autofixed
 */
@Component({
  layout: 'dashboard',
  components: {
    ZChart
  },
  methods: {
    shortenLargeNumber
  },
  middleware: ['betaOnly']
})
export default class OwnerIssuesPrevented extends mixins(OwnerDetailMixin, ReportMixin) {
  /**
   * Fetch report base data recent stats, and trigger chart data fetching.
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    try {
      const { owner, provider } = this.$route.params
      if (!this.owner.id) {
        await this.fetchOwnerDetails({ login: owner, provider })
      }
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'Unable to fetch team details, please contact support.')
    }

    // All three queries below have a try-catch block inside them
    await Promise.all([
      this.fetchReportBase(ReportLevel.Owner, this.owner.id, ReportPageT.ISSUES_AUTOFIXED),
      this.fetchRecentStats(ReportLevel.Owner, this.owner.id, ReportPageT.ISSUES_AUTOFIXED),
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

    await this.fetchHistoricalValues(ReportLevel.Owner, this.owner.id, ReportPageT.ISSUES_AUTOFIXED)

    const prValues = (this.historicalValues.values.pr ?? []) as number[]
    const defaultBranchValues = (this.historicalValues.values.default_branch ?? []) as number[]

    this.datasets = [
      {
        name: 'Fixed in Pull Requests',
        values: prValues,
        chartType: 'bar'
      },
      {
        name: 'Fixed in Default Branch',
        values: defaultBranchValues,
        chartType: 'bar'
      }
    ]
  }
}
</script>
