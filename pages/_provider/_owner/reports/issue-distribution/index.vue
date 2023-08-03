<template>
  <div class="flex flex-col gap-y-4">
    <chart-container>
      <template #report-stats>
        <chart-stat title="Total Issues" :value="currentVal" :loading="reportsDataLoading" />
      </template>

      <template #report-control>
        <div class="flex justify-between gap-x-2">
          <distribution-switch
            v-model="activeFilter"
            class="hidden grid-cols-2 sm:grid"
            @change="fetchDistributionData"
          />

          <date-range-picker
            v-model="dateRangeFilter"
            :date-range-options="dateRangeOptions"
            @change="fetchHistoricValuesAndSetChartData"
          />
        </div>
      </template>
      <div
        v-if="historicalValuesLoading"
        class="h-report-chart mx-5 my-1.5 animate-pulse rounded-lg bg-ink-300"
      ></div>
      <div v-else>
        <template v-if="shouldChartBeShown">
          <z-chart
            :key="reportRerenderKey"
            :data-sets="issueDistributionData"
            :labels="labels"
            :colors="chartColors"
            :bar-options="{ stacked: true }"
            :axis-options="{
              xIsSeries: true
            }"
            :y-axis-max="maxBarClip"
            :y-axis-min="0"
            type="bar"
            class="chart-tooltip-z-20"
          />
          <report-chart-legend
            :datasets="issueDistributionData"
            :others-dataset-names="othersDatasetNames"
            class="px-5"
          />
        </template>
        <div v-else class="h-full px-5">
          <lazy-empty-chart
            :count="4"
            :stacked="true"
            :chart-colors="chartColors"
            chart-type="bar"
          />
        </div>
      </div>

      <distribution-switch
        v-model="activeFilter"
        class="mt-4 grid grid-cols-2 px-5 sm:hidden"
        @change="fetchDistributionData"
      />
    </chart-container>

    <recent-stats :current-val="currentVal" :stats="recentStats" :loading="recentStatsLoading" />
    <distribution-stats
      v-if="distributionStatsLoading || distributionStats.length"
      :key="reportRerenderKey"
      :stats="distributionStats"
      :link-cards="false"
      :stat-type="activeFilter"
      :loading="distributionStatsLoading"
    />
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'

import DistributionReportMixin from '~/mixins/distributionReportMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import RouteQueryMixin from '~/mixins/routeQueryMixin'

import { ReportLevel } from '~/types/types'
import { IssueDistributionT, ReportMeta, ReportPageT } from '~/types/reportTypes'

/**
 * Page for displaying issue distribution by analyzer and category type
 */
@Component({
  layout: 'dashboard'
})
export default class IssueDistributionPage extends mixins(
  DistributionReportMixin,
  OwnerDetailMixin,
  RouteQueryMixin
) {
  readonly IssueDistributionT = IssueDistributionT
  readonly chartColors: string[] = ReportMeta[ReportPageT.DISTRIBUTION].colors ?? []

  /**
   * Fetch recent stats, compliance issues and trigger chart data fetching.
   *
   * @returns {Promise<void>}
   */
  async mounted(): Promise<void> {
    try {
      const { owner, provider } = this.$route.params
      if (!this.owner.id) {
        await this.fetchOwnerDetails({ login: owner, provider })
      }
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'Unable to fetch team details, please contact support.')
    }

    // All four queries below have a try-catch block inside them
    await Promise.all([
      this.fetchReportBase(ReportLevel.Owner, this.owner.id, ReportPageT.DISTRIBUTION),
      this.fetchRecentStats(ReportLevel.Owner, this.owner.id, ReportPageT.DISTRIBUTION),
      this.fetchHistoricValuesAndSetChartData(),
      this.fetchDistributionData()
    ])
  }

  /**
   * fetch historical values and set the chart dataset
   *
   * @return {Promise<void>}
   */
  async fetchDistributionData(): Promise<void> {
    // Flushing distribution stats before changing distribution type
    this.distributionStats = []

    // Update `filter` query param
    this.addFilters({ filter: this.activeFilter })

    this.distributionStats = await this.fetchDistributionStats(
      ReportPageT.DISTRIBUTION,
      ReportLevel.Owner,
      this.owner.id,
      this.activeFilter
    )
  }

  /**
   * fetch historical values and set the chart dataset
   *
   * @return {Promise<void>}
   */
  async fetchHistoricValuesAndSetChartData(): Promise<void> {
    await this.fetchHistoricalValues(ReportLevel.Owner, this.owner.id, ReportPageT.DISTRIBUTION)

    this.setDistributionChartData(ReportPageT.DISTRIBUTION)
  }

  /**
   * Callback for route replace
   *
   * @returns {Promise<void>}
   */
  async refetchAfterRouteChange(): Promise<void> {
    // Override the method from `RouteQueryMixin`
    // Re-fetch is not required in this case
  }
}
</script>
