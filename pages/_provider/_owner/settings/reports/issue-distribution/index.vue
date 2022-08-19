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
        v-show="historicalValuesLoading"
        class="h-72 mx-5 my-1.5 rounded-lg bg-ink-300 animate-pulse"
      ></div>
      <div v-show="!historicalValuesLoading">
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
          :y-axis-max="maxBarClip"
          :y-axis-min="0"
          type="bar"
        ></z-chart>
        <div v-show="!shouldChartBeShown" class="h-full px-5">
          <lazy-empty-chart :count="5" chart-type="bar" :stacked="true" />
        </div>
      </div>
    </chart-container>

    <recent-stats :current-val="currentVal" :stats="recentStats" :loading="recentStatsLoading" />
    <distribution-stats
      :key="activeFilter"
      :stats="distributionStats"
      :link-cards="false"
      :stat-type="activeFilter"
      :loading="distributionStatsLoading"
    />
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZRadioGroup, ZRadioButton, ZChart } from '@deepsourcelabs/zeal'

import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
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
  layout: 'owner',
  components: {
    ZRadioGroup,
    ZRadioButton,
    ZChart
  },
  methods: {
    shortenLargeNumber
  }
})
export default class IssueDistributionPage extends mixins(OwnerDetailMixin, ReportMixin) {
  public activeFilter: IssueDistributionT = IssueDistributionT.CATEGORY
  public distributionStats: Array<IssueDistribution> = []
  public analyzerDataset: Array<Dataset> = []
  public categoryDataset: Array<Dataset> = []

  readonly IssueDistributionT = IssueDistributionT

  baseColor = BASE_COLOR

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
      const { owner, provider } = this.$route.params
      if (!this.owner.id) {
        await this.fetchOwnerDetails({ login: owner, provider })
      }

      await Promise.all([
        this.fetchReportBase(ReportLevel.Owner, this.owner.id, ReportPageT.DISTRIBUTION),
        this.fetchRecentStats(ReportLevel.Owner, this.owner.id, ReportPageT.DISTRIBUTION),
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
  async setChartData(): Promise<void> {
    try {
      await this.fetchHistoricalValues(ReportLevel.Owner, this.owner.id, ReportPageT.DISTRIBUTION)

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

  get maxDigitHistoricValues(): number {
    const currentActiveDistribution = (
      this.activeFilter === IssueDistributionT.CATEGORY
        ? this.historicalValues.values.category
        : this.historicalValues.values.analyzer
    ) as Record<string, number[]>

    /**
     * First, take out arrays from the map. Then run a reducer function over it.
     * The reducer function maps over every child array and adds it elems with the
     * next child array (add elems with the same index).
     *
     * The first time reduce runs, it returns sum of first and second array (index wise)
     * In the next iteration, this sum is passed as curr value and is again summed up
     * with the next array. Thus we get sum of all arrays, index wise.
     */

    const analyzerReducedValues = Object.values(currentActiveDistribution).reduce((curr, next) => {
      const sisterArraysSum = []
      for (let index = 0; index < curr.length; index++) {
        sisterArraysSum.push(curr[index] + next[index])
      }
      return sisterArraysSum
    })

    return Math.max(...analyzerReducedValues)
  }
}
</script>

<style>
.distribution-filter .z-radio--inner {
  flex-grow: 1;
}
</style>
