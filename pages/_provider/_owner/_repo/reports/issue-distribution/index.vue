<template>
  <div class="flex flex-col gap-y-4">
    <chart-container>
      <template #report-stats>
        <chart-stat title="Total Issues" :value="shortenLargeNumber(currentVal)">
          <div
            v-if="reportsDataLoading"
            class="w-full h-5 mt-px rounded-sm bg-ink-300 animate-pulse"
          ></div>
        </chart-stat>
      </template>

      <template #report-control>
        <div class="flex flex-col-reverse justify-between gap-y-4 md:flex-row gap-x-2">
          <z-radio-group
            v-model="activeFilter"
            class="flex w-full h-8 font-medium text-vanilla-100 sm:w-auto"
            @change="setDistributionData"
          >
            <z-radio-button
              :value="IssueDistributionT.CATEGORY"
              spacing="px-5 py-1.5"
              class="flex-grow sm:flex-grow-0 distribution-filter"
            >
              <span class="w-full text-xs capitalize">By category</span>
            </z-radio-button>
            <z-radio-button
              :value="IssueDistributionT.ANALYZER"
              spacing="px-5 py-1.5"
              class="flex-grow sm:flex-grow-0 distribution-filter"
            >
              <span class="w-full text-xs capitalize">By analyzer</span></z-radio-button
            >
          </z-radio-group>
          <date-range-picker
            v-model="dateRangeFilter"
            :date-range-options="dateRangeOptions"
            @change="setChartData"
          />
        </div>
      </template>

      <div
        v-if="historicalValuesLoading"
        class="h-64 mx-6 mt-6 mb-5 rounded-lg bg-ink-300 animate-pulse"
      ></div>
      <template v-else>
        <z-chart
          v-if="shouldChartBeShown"
          :data-sets="issueDistributionData"
          :key="activeFilter"
          :labels="labels"
          :colors="colorShades"
          :bar-options="{ stacked: true }"
          :axis-options="{
            xIsSeries: true
          }"
          type="bar"
        ></z-chart>
        <div v-else class="h-full p-5 pb-0">
          <lazy-empty-chart :count="5" chart-type="bar" :stacked="true" />
        </div>
      </template>
    </chart-container>

    <recent-stats :current-val="currentVal" :stats="recentStats" :loading="recentStatsLoading" />
    <distribution-stats
      :key="activeFilter"
      :stats="distributionStats"
      :link-cards="true"
      :stat-type="activeFilter"
      :loading="distributionStatsLoading"
    />
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZRadioGroup, ZRadioButton, ZChart } from '@deepsourcelabs/zeal'

import RepoDetailMixin from '~/mixins/repoDetailMixin'
import ReportMixin from '~/mixins/reportMixin'

import { shortenLargeNumber } from '~/utils/string'
import { IssueDistribution, ReportLevel } from '~/types/types'
import { Dataset, IssueDistributionT, ReportPageT } from '~/types/reportTypes'
import { getColorShades } from '~/utils/ui'

const BASE_COLOR = '#1035ad'

/**
 * Page for displaying issue distribution by analyzer and category type
 */
@Component({
  layout: 'repository',
  components: {
    ZRadioGroup,
    ZRadioButton,
    ZChart
  },
  methods: {
    shortenLargeNumber
  }
})
export default class IssueDistributionPage extends mixins(RepoDetailMixin, ReportMixin) {
  public activeFilter: IssueDistributionT = IssueDistributionT.CATEGORY
  public distributionStats: Array<IssueDistribution> = []
  public analyzerDataset: Array<Dataset> = []
  public categoryDataset: Array<Dataset> = []

  readonly IssueDistributionT = IssueDistributionT

  get colorShades(): string[] {
    return getColorShades(BASE_COLOR, this.issueDistributionData.length)
  }

  get shouldChartBeShown(): boolean {
    if (this.historicalValuesLoading) return false
    if (this.historicalValues?.labels.length < 2) return false
    if (this.issueDistributionData.length === 0) return false

    return true
  }

  /**
   * Fetch recent stats, compliance issues and trigger chart data fetching.
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    try {
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
        this.fetchReportBase(ReportLevel.Repository, this.repository.id, ReportPageT.DISTRIBUTION),
        this.fetchRecentStats(ReportLevel.Repository, this.repository.id, ReportPageT.DISTRIBUTION),
        this.setChartData(),
        this.setDistributionData()
      ])
    } catch (error) {
      // TODO: handle error
    }
  }

  /**
   * fetch historical values and set the chart dataset
   *
   * @return {Promise<void>}
   */
  async setDistributionData(): Promise<void> {
    this.distributionStats = []
    this.distributionStats = await this.fetchDistributionStats(
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
  async setChartData(): Promise<void> {
    try {
      await this.fetchHistoricalValues(
        ReportLevel.Repository,
        this.repository.id,
        ReportPageT.DISTRIBUTION
      )

      const analyzerValues = this.historicalValues.values.analyzer

      if (Object.keys(analyzerValues).length) {
        this.analyzerDataset = Object.keys(analyzerValues).map((analyzer) => {
          return { name: analyzer, chartType: 'bar', values: analyzerValues[analyzer] }
        })
      }

      const categoryValues = this.historicalValues.values.category

      if (Object.keys(categoryValues).length) {
        this.categoryDataset = Object.keys(categoryValues).map((category) => {
          return { name: category, chartType: 'bar', values: categoryValues[category] }
        })
      }
    } catch (error) {
      // TODO: handle error
    }
  }

  get issueDistributionData(): Array<Dataset> {
    return this.activeFilter === IssueDistributionT.CATEGORY
      ? this.categoryDataset
      : this.analyzerDataset
  }

  get currentVal(): number {
    return this.report?.currentValue ?? 0
  }
}
</script>

<style>
.distribution-filter .z-radio--inner {
  flex-grow: 1;
}
</style>
