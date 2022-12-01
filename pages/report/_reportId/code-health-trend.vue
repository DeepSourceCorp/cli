<template>
  <public-report-page-wrapper
    :level="level"
    :owner-login="ownerLogin"
    :created-at="createdAt"
    :report-key="ReportPageT.CODE_HEALTH_TREND"
    :repository-list="repositoryList"
  >
    <section v-if="report" class="space-y-4">
      <chart-container :chart-present="shareHistoricalData">
        <template #report-stats>
          <chart-stat
            :value="shortenLargeNumber(report.currentValue)"
            :loading="reportsDataLoading"
            title="Net New Issues"
          />
        </template>

        <template v-if="shareHistoricalData" #report-control>
          <date-range-picker
            :selected-filter="dateRangeFilter"
            :date-range-options="dateRangeOptions"
            @change="fetchHistoricValuesAndSetChartData"
          />
        </template>

        <template v-if="shareHistoricalData">
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
        </template>
      </chart-container>

      <recent-stats
        v-if="shareHistoricalData"
        :current-val="report.currentValue"
        :stats="recentStats"
        :loading="recentStatsLoading"
      />
    </section>
  </public-report-page-wrapper>
</template>

<script lang="ts">
import { Component, mixins, Prop } from 'nuxt-property-decorator'
import { ZChart } from '@deepsourcelabs/zeal'

import PublicReportMixin from '~/mixins/publicReportMixin'
import CodeHealthReportMixin from '~/mixins/codeHealthReportMixin'

import { ReportLevel, Repository } from '~/types/types'
import { ReportMeta, ReportPageT } from '~/types/reportTypes'
import { shortenLargeNumber } from '~/utils/string'

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
export default class PublicReportCodeHealth extends mixins(
  PublicReportMixin,
  CodeHealthReportMixin
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

  /**
   * Created hook for Vue component.
   * Sets meta data title and description
   *
   * @returns void
   */
  created(): void {
    const reportTitle = ReportMeta[ReportPageT.CODE_HEALTH_TREND].title
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
   * @param {string} [newDateRange]
   * @returns {Promise<void>}
   */
  async fetchHistoricValuesAndSetChartData(newDateRange?: string): Promise<void> {
    if (newDateRange) {
      this.dateRangeFilter = newDateRange
    }
    const { reportId } = this.$route.params

    await this.fetchPublicReportHistoricalValues(
      reportId,
      ReportPageT.CODE_HEALTH_TREND,
      this.token
    )

    this.datasets = this.formatCodeHealthChartData(this.historicalValues)
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
        reportKey: ReportPageT.CODE_HEALTH_TREND,
        token: this.token
      })

      if (this.shareHistoricalData) {
        await Promise.all([
          this.fetchPublicReportRecentStats({
            reportId,
            reportKey: ReportPageT.CODE_HEALTH_TREND,
            token: this.token
          }),
          this.fetchHistoricValuesAndSetChartData()
        ])
      }
    }
  }
}
</script>
