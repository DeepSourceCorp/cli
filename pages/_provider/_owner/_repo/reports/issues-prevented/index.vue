<template>
  <div class="flex flex-col gap-y-4">
    <chart-container>
      <template #report-stats>
        <chart-stat
          title="Issues Prevented"
          :value="shortenLargeNumber(currentVal)"
          :loading="reportsDataLoading"
        />
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
        ></z-chart>
        <div v-show="!shouldChartBeShown" class="h-full px-5">
          <lazy-empty-chart :count="5" chart-type="bar" base-shade="#2eb78b" :stacked="true" />
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
      :stat-type="activeFilter"
      :loading="distributionStatsLoading"
    />
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZChart } from '@deepsourcelabs/zeal'

import RepoDetailMixin from '~/mixins/repoDetailMixin'
import DistributionReportMixin from '~/mixins/distributionReportMixin'

import { shortenLargeNumber } from '~/utils/string'
import { ReportLevel } from '~/types/types'
import { IssueDistributionT, ReportPageT } from '~/types/reportTypes'
import { getColorShades } from '~/utils/ui'

const BASE_COLOR = '#2eb78b'

/**
 * Page for displaying issues prevented by analyzer and category type
 */
@Component({
  layout: 'repository',
  components: {
    ZChart
  },
  methods: {
    shortenLargeNumber
  }
})
export default class IssuesPreventedPage extends mixins(RepoDetailMixin, DistributionReportMixin) {
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

    // All three queries below have a try-catch block inside them
    await Promise.all([
      this.fetchReportBase(
        ReportLevel.Repository,
        this.repository.id,
        ReportPageT.ISSUES_PREVENTED
      ),
      this.fetchRecentStats(
        ReportLevel.Repository,
        this.repository.id,
        ReportPageT.ISSUES_PREVENTED
      ),
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
    this.distributionStats = await this.fetchDistributionStats(
      ReportPageT.ISSUES_PREVENTED,
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
      ReportPageT.ISSUES_PREVENTED
    )

    this.setDistributionChartData()
  }
}
</script>
