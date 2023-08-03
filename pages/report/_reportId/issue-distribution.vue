<template>
  <public-report-page-wrapper
    :level="level"
    :owner-login="ownerLogin"
    :created-at="createdAt"
    :report-key="ReportPageT.DISTRIBUTION"
  >
    <section v-if="report" class="space-y-4">
      <chart-container :chart-present="shareHistoricalData">
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
              v-if="shareHistoricalData"
              v-model="dateRangeFilter"
              :date-range-options="dateRangeOptions"
              @change="fetchHistoricValuesAndSetChartData"
            />
          </div>
        </template>
        <template v-if="shareHistoricalData">
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
        </template>

        <distribution-switch
          v-model="activeFilter"
          class="mt-4 grid grid-cols-2 px-5 sm:hidden"
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
        :key="reportRerenderKey"
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

import PublicReportMixin from '~/mixins/publicReportMixin'
import DistributionReportMixin from '~/mixins/distributionReportMixin'

import { ReportLevel } from '~/types/types'
import { IssueDistributionT, ReportMeta, ReportPageT } from '~/types/reportTypes'

/**
 * Public Report Child page
 */
@Component({
  scrollToTop: true
})
export default class PublicReportIssueDistribution extends mixins(
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

  readonly ReportPageT = ReportPageT
  readonly IssueDistributionT = IssueDistributionT
  readonly chartColors: string[] = ReportMeta[ReportPageT.DISTRIBUTION].colors ?? []

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
  async mounted(): Promise<void> {
    await this.refetchData()
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
      ReportPageT.DISTRIBUTION,
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

    this.setDistributionChartData(ReportPageT.DISTRIBUTION)
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
