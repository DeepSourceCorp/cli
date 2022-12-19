<template>
  <div class="flex flex-col gap-y-4">
    <chart-container>
      <template #report-stats>
        <chart-stat
          :value="report.currentValue"
          :loading="reportsDataLoading"
          title="Net New Issues"
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
        v-show="historicalValuesLoading"
        class="h-72 mx-5 my-1.5 rounded-lg bg-ink-300 animate-pulse"
      ></div>
      <div v-show="!historicalValuesLoading">
        <z-chart
          v-if="shouldChartBeShown"
          :data-sets="datasets"
          :key="reportRerenderKey"
          :labels="labels"
          :colors="['cherry-500', 'juniper-500', 'robin-500']"
          :axis-options="{
            xIsSeries: true
          }"
          :tooltipOptions="{
            formatTooltipY: (d, set) => (set.index === 1 ? Math.abs(d) : d)
          }"
          :bar-options="{ stacked: true }"
          type="axis-mixed"
          class="chart-tooltip-z-20"
        />
        <div v-show="!shouldChartBeShown" class="h-full px-5">
          <lazy-empty-chart
            :count="3"
            :length="7"
            :chart-colors="['cherry-500', 'juniper-500', 'robin-500']"
            :chart-dataset="emptyCodeHealthChartDataSet"
            :stacked="true"
          />
        </div>
      </div>
    </chart-container>

    <recent-stats
      :current-val="report.currentValue"
      :stats="recentStats"
      :loading="recentStatsLoading"
    />
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZChart } from '@deepsource/zeal'

import { shortenLargeNumber } from '~/utils/string'

import CodeHealthReportMixin from '~/mixins/codeHealthReportMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'

import { ReportLevel } from '~/types/types'
import { ReportPageT } from '~/types/reportTypes'
import { getFormattedCodeHealthChartData } from '~/utils/reports'

@Component({
  layout: 'repository',
  components: { ZChart },
  methods: {
    shortenLargeNumber
  }
})
export default class CodeHealthTrend extends mixins(RepoDetailMixin, CodeHealthReportMixin) {
  /**
   * Fetch report base data, recent stats, and trigger chart data fetching.
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    const { repo, provider, owner } = this.$route.params
    if (!this.validateRepoDetails(this.repository)) {
      await this.fetchBasicRepoDetails({
        name: repo,
        provider,
        owner,
        refetch: true
      })
    }

    await Promise.all([
      this.fetchReportBase(
        ReportLevel.Repository,
        this.repository.id,
        ReportPageT.CODE_HEALTH_TREND
      ),
      this.fetchRecentStats(
        ReportLevel.Repository,
        this.repository.id,
        ReportPageT.CODE_HEALTH_TREND
      ),
      this.fetchHistoricValuesAndSetChartData()
    ])
  }

  /**
   * fetch historical values and set the chart dataset
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
      ReportPageT.CODE_HEALTH_TREND
    )

    this.datasets = getFormattedCodeHealthChartData(this.historicalValues)
  }
}
</script>
