<template>
  <public-report-page-wrapper
    :level="level"
    :owner-login="ownerLogin"
    :created-at="createdAt"
    :report-key="ReportPageT.ISSUES_PREVENTED"
    :repository-list="repositoryList"
  >
    <section v-if="report" class="space-y-4">
      <chart-container :chart-present="shareHistoricalData">
        <template #report-stats>
          <chart-stat title="Issues Prevented" :value="shortenLargeNumber(currentVal)">
            <div
              v-if="reportsDataLoading"
              class="w-24 h-5 mt-px rounded-sm bg-ink-300 animate-pulse"
            ></div>
          </chart-stat>
        </template>

        <template #report-control>
          <div class="flex justify-between gap-x-2">
            <distribution-switch
              v-model="activeFilter"
              class="hidden sm:grid grid-cols-2"
              @change="fetchDistributionData"
            />

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

        <distribution-switch
          v-model="activeFilter"
          class="grid grid-cols-2 px-5 mt-4 sm:hidden"
          @change="fetchDistributionData"
        />
      </chart-container>

      <recent-stats
        v-if="shareHistoricalData"
        :current-val="currentVal"
        :stats="recentStats"
        :loading="recentStatsLoading"
      />

      <distribution-stats
        v-if="distributionStatsLoading || distributionStats.length"
        :key="activeFilter"
        :stats="distributionStats"
        :stat-type="activeFilter"
        :loading="distributionStatsLoading"
      />
    </section>
  </public-report-page-wrapper>
</template>

<script lang="ts">
import { Component, mixins, Prop } from 'nuxt-property-decorator'
import { ZChart } from '@deepsourcelabs/zeal'

import PublicReportMixin from '~/mixins/publicReportMixin'

import { ReportLevel, Repository } from '~/types/types'
import { IssueDistributionT, ReportMeta, ReportPageT } from '~/types/reportTypes'
import { shortenLargeNumber } from '~/utils/string'
import { getColorShades } from '~/utils/ui'
import DistributionReportMixin from '~/mixins/distributionReportMixin'

const BASE_COLOR = '#2eb78b'

/**
 * Public Report Child page
 */
@Component({
  components: {
    ZChart
  },
  methods: {
    shortenLargeNumber
  }
})
export default class PublicReportIssuesPrevented extends mixins(
  PublicReportMixin,
  DistributionReportMixin
) {
  @Prop()
  shareHistoricalData: boolean

  @Prop()
  level: ReportLevel

  @Prop({ default: '' })
  ownerLogin: string

  @Prop()
  createdAt: string

  @Prop()
  token: string

  @Prop()
  repositoryList: Array<Repository>

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
    const reportTitle = ReportMeta[ReportPageT.ISSUES_PREVENTED].title
    this.setPageMetaData(reportTitle, this.ownerLogin)
  }

  /**
   * Fetch hook for Vue component that fetches the report.
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    const { reportId } = this.$route.params

    if (reportId) {
      await this.fetchPublicReportBaseReport({
        reportId,
        reportKey: ReportPageT.ISSUES_PREVENTED,
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

  /**
   * fetch historical values and set the chart dataset
   *
   * @return {Promise<void>}
   */
  async fetchDistributionData(): Promise<void> {
    const { reportId } = this.$route.params

    // Flushing distribution stats before changing distribution type
    this.distributionStats = []
    this.distributionStats = await this.fetchPublicReportDistributionStats(
      ReportPageT.ISSUES_PREVENTED,
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

    await this.fetchPublicReportHistoricalValues(reportId, ReportPageT.ISSUES_PREVENTED, this.token)

    this.setDistributionChartData()
  }

  get colorShades(): string[] {
    return getColorShades(BASE_COLOR, this.issueDistributionData.length)
  }
}
</script>
