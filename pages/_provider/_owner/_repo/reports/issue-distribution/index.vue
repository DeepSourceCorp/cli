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
            class="hidden sm:grid grid-cols-2"
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
        v-show="historicalValuesLoading"
        class="h-72 mx-5 my-1.5 rounded-lg bg-ink-300 animate-pulse"
      ></div>
      <div v-show="!historicalValuesLoading">
        <z-chart
          v-if="shouldChartBeShown"
          :data-sets="issueDistributionData"
          :key="reportRerenderKey"
          :labels="labels"
          :colors="colorShades"
          :bar-options="{ stacked: true }"
          :axis-options="{
            xIsSeries: true
          }"
          :y-axis-max="maxBarClip"
          :y-axis-min="0"
          type="bar"
          class=""
        />
        <div v-show="!shouldChartBeShown" class="h-full px-5">
          <lazy-empty-chart :count="5" chart-type="bar" :stacked="true" />
        </div>
      </div>

      <distribution-switch
        v-model="activeFilter"
        class="grid grid-cols-2 px-5 mt-4 sm:hidden"
        @change="fetchDistributionData"
      />
    </chart-container>

    <recent-stats :current-val="currentVal" :stats="recentStats" :loading="recentStatsLoading" />
    <distribution-stats
      v-if="distributionStatsLoading || distributionStats.length"
      :key="reportRerenderKey"
      :stats="distributionStats"
      :link-cards="true"
      :stat-type="activeFilter"
      :loading="distributionStatsLoading"
    />
  </div>
</template>

<script lang="ts">
import { ZChart } from '@deepsource/zeal'
import { Component, mixins } from 'nuxt-property-decorator'

import DistributionReportMixin from '~/mixins/distributionReportMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RouteQueryMixin from '~/mixins/routeQueryMixin'

import { IssueDistributionT, ReportPageT } from '~/types/reportTypes'
import { ReportLevel } from '~/types/types'
import { getColorShades } from '~/utils/ui'

const BASE_COLOR = '#1035ad'

/**
 * Page for displaying issue distribution by analyzer and category type
 */
@Component({
  layout: 'repository',
  components: {
    ZChart
  }
})
export default class IssueDistributionPage extends mixins(
  DistributionReportMixin,
  RepoDetailMixin,
  RouteQueryMixin
) {
  readonly IssueDistributionT = IssueDistributionT

  get colorShades(): string[] {
    return getColorShades(BASE_COLOR, this.issueDistributionData.length)
  }

  /**
   * Fetch recent stats, compliance issues and trigger chart data fetching.
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
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

    // All four queries below have a try-catch block inside them
    await Promise.all([
      this.fetchReportBase(ReportLevel.Repository, this.repository.id, ReportPageT.DISTRIBUTION),
      this.fetchRecentStats(ReportLevel.Repository, this.repository.id, ReportPageT.DISTRIBUTION),
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
      ReportLevel.Repository,
      this.repository.id,
      this.activeFilter
    )
  }

  /**
   * fetch historical values and set the chart dataset
   *
   * @return {Promise<void>}
   */
  async fetchHistoricValuesAndSetChartData(): Promise<void> {
    await this.fetchHistoricalValues(
      ReportLevel.Repository,
      this.repository.id,
      ReportPageT.DISTRIBUTION
    )

    this.setDistributionChartData()
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
