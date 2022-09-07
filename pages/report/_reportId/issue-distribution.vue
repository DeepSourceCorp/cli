<template>
  <public-report-page-wrapper
    :level="level"
    :owner-login="ownerLogin"
    :created-at="createdAt"
    :report-key="ReportPageT.DISTRIBUTION"
    :repository-list="repositoryList"
  >
    <section v-if="report" class="space-y-4">
      <chart-container :chart-present="shareHistoricalData">
        <template #report-stats>
          <chart-stat title="Total Issues" :value="shortenLargeNumber(currentVal)">
            <div
              v-if="reportsDataLoading"
              class="w-24 h-5 mt-px rounded-sm bg-ink-300 animate-pulse"
            ></div>
          </chart-stat>
        </template>

        <template #report-control>
          <div class="flex justify-between gap-x-2">
            <z-radio-group
              v-model="activeFilter"
              class="hidden sm:grid grid-cols-2 min-w-52 h-8 font-medium text-vanilla-100 sm:w-auto"
              @change="fetchDistributionData"
            >
              <z-radio-button
                :value="IssueDistributionT.CATEGORY"
                spacing="w-full h-full pt-0.5"
                class="text-center"
              >
                <span class="w-full text-xs capitalize">By category</span>
              </z-radio-button>
              <z-radio-button
                :value="IssueDistributionT.ANALYZER"
                spacing="w-full h-full pt-0.5"
                class="text-center"
              >
                <span class="w-full text-xs capitalize">By analyzer</span></z-radio-button
              >
            </z-radio-group>

            <date-range-picker
              v-if="shareHistoricalData"
              v-model="dateRangeFilter"
              :date-range-options="dateRangeOptions"
              @change="fetchHistoricValuesAndSetChartData"
            />
          </div>
        </template>
        <template v-if="shareHistoricalData">
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
        </template>

        <z-radio-group
          v-model="activeFilter"
          class="grid grid-cols-2 px-5 mt-4 h-8 font-medium text-vanilla-100 sm:hidden"
          @change="fetchDistributionData"
        >
          <z-radio-button
            :value="IssueDistributionT.CATEGORY"
            spacing="w-full h-full pt-1"
            class="text-center"
          >
            <span class="w-full text-xs capitalize">By category</span>
          </z-radio-button>
          <z-radio-button
            :value="IssueDistributionT.ANALYZER"
            spacing="w-full h-full pt-1"
            class="text-center"
          >
            <span class="w-full text-xs capitalize">By analyzer</span></z-radio-button
          >
        </z-radio-group>
      </chart-container>

      <recent-stats
        v-if="shareHistoricalData"
        :current-val="currentVal"
        :stats="recentStats"
        :loading="recentStatsLoading"
      />

      <distribution-stats
        :key="activeFilter"
        :stats="distributionStats"
        :link-cards="false"
        :stat-type="activeFilter"
        :loading="distributionStatsLoading"
      />
    </section>
  </public-report-page-wrapper>
</template>

<script lang="ts">
import { Component, mixins, Prop } from 'nuxt-property-decorator'
import { ZChart, ZRadioGroup, ZRadioButton } from '@deepsourcelabs/zeal'

import PublicReportMixin from '~/mixins/publicReportMixin'

import { IssueDistribution, ReportLevel, ReportType, Repository } from '~/types/types'
import { Dataset, IssueDistributionT, ReportMeta, ReportPageT } from '~/types/reportTypes'
import { shortenLargeNumber, smartApostrophe } from '~/utils/string'
import { getColorShades } from '~/utils/ui'

const BASE_COLOR = '#1035ad'

/**
 * Public Report Child page
 */
@Component({
  components: {
    ZRadioGroup,
    ZRadioButton,
    ZChart
  },
  methods: {
    smartApostrophe,
    shortenLargeNumber
  }
})
export default class PublicReportIssueDistribution extends mixins(PublicReportMixin) {
  @Prop()
  shareHistoricalData: boolean

  @Prop()
  level: ReportLevel

  @Prop({ default: '' })
  ownerLogin: string

  @Prop()
  objectId: string

  @Prop()
  createdAt: string

  @Prop()
  token: string

  @Prop()
  repositoryList: Array<Repository>

  public activeFilter: IssueDistributionT = IssueDistributionT.CATEGORY
  public distributionStats: Array<IssueDistribution> = []
  public analyzerDataset: Array<Dataset> = []
  public categoryDataset: Array<Dataset> = []

  readonly ReportType = ReportType
  readonly ReportPageT = ReportPageT
  readonly IssueDistributionT = IssueDistributionT

  baseColor = BASE_COLOR

  /**
   * Created hook for Vue component.
   * Sets meta data title and description
   *
   * @returns void
   */
  created() {
    const reportTitle = ReportMeta[ReportPageT.DISTRIBUTION].title
    this.setPageMetaData(reportTitle, this.ownerLogin)
  }

  /**
   * Fetch hook for Vue component that fetches the report.
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    await this.refetchData()
  }

  /**
   * fetch historical values and set the chart dataset
   *
   * @return {Promise<void>}
   */
  async fetchDistributionData(): Promise<void> {
    const { reportId } = this.$route.params

    this.distributionStats = []
    this.distributionStats = await this.fetchPublicReportDistributionStats(
      reportId,
      this.activeFilter,
      this.token
    )
  }

  /**
   * fetch historical values and set the chart dataset
   *
   * @return {Promise<void>}
   */
  async fetchHistoricValuesAndSetChartData(): Promise<void> {
    const { reportId } = this.$route.params

    await this.fetchPublicReportHistoricalValues(reportId, ReportPageT.DISTRIBUTION, this.token)

    const analyzerValues = this.historicalValues.values.analyzer

    if (analyzerValues && Object.keys(analyzerValues).length) {
      this.analyzerDataset = Object.keys(analyzerValues).map((analyzer) => {
        return { name: analyzer, chartType: 'bar', values: analyzerValues[analyzer] }
      })
    }

    const categoryValues = this.historicalValues.values.category

    if (categoryValues && Object.keys(categoryValues).length) {
      this.categoryDataset = Object.keys(categoryValues).map((category) => {
        return { name: category, chartType: 'bar', values: categoryValues[category] }
      })
    }
  }

  get colorShades(): string[] {
    return getColorShades(BASE_COLOR, this.issueDistributionData.length)
  }

  get shouldChartBeShown(): boolean {
    return !(
      this.historicalValuesLoading ||
      this.historicalValues?.labels.length < 2 ||
      this.issueDistributionData.length === 0
    )
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

  /**
   * Fetch data for the report
   *
   * @returns {Promise<void>}
   */
  async refetchData(): Promise<void> {
    const { reportId } = this.$route.params

    if (reportId) {
      await this.fetchPublicReportBaseReport({
        reportId,
        reportKey: ReportPageT.DISTRIBUTION,
        token: this.token
      })

      const promises: Array<Promise<void>> = [this.fetchDistributionData()]

      if (this.shareHistoricalData) {
        promises.push(
          this.fetchPublicReportRecentStats({
            reportId,
            reportKey: ReportPageT.DISTRIBUTION,
            token: this.token
          }),
          this.fetchHistoricValuesAndSetChartData()
        )
      }

      await Promise.all(promises)
    }
  }
}
</script>
