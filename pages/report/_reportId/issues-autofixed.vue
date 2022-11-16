<template>
  <public-report-page-wrapper
    :level="level"
    :owner-login="ownerLogin"
    :created-at="createdAt"
    :report-key="ReportPageT.ISSUES_AUTOFIXED"
    :repository-list="repositoryList"
  >
    <section v-if="report" class="space-y-4">
      <chart-container :chart-present="shareHistoricalData">
        <template #report-stats>
          <chart-stat
            :value="shortenLargeNumber(currentVal)"
            :loading="reportsDataLoading"
            title="Issues Autofixed"
          />
        </template>

        <template #report-control>
          <date-range-picker
            v-if="shareHistoricalData"
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
              :labels="labels"
              :colors="['juniper-500', 'juniper-100']"
              :bar-options="{ stacked: true }"
              :axis-options="{
                xIsSeries: true
              }"
              :y-axis-min="0"
              type="bar"
            />
            <div v-show="!shouldChartBeShown" class="h-full px-5">
              <lazy-empty-chart :count="2" :stacked="true" chart-type="bar" base-shade="#33CB9A" />
            </div>
          </div>
        </template>
      </chart-container>

      <recent-stats
        v-if="shareHistoricalData"
        :current-val="currentVal"
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

import { ReportLevel, Repository } from '~/types/types'
import { ReportMeta, ReportPageT } from '~/types/reportTypes'
import { shortenLargeNumber } from '~/utils/string'

/**
 * Public Report page for issues autofixed report
 */
@Component({
  components: {
    ZChart
  },
  methods: {
    shortenLargeNumber
  }
})
export default class PublicReportIssuesAutofixed extends mixins(PublicReportMixin) {
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
   * @returns {void}
   */
  created(): void {
    const reportTitle = ReportMeta[ReportPageT.ISSUES_AUTOFIXED].title
    this.setPageMetaData(reportTitle, this.ownerLogin)
  }

  /**
   * Fetch hook for Vue component that fetches the report base data,
   * historical values and recent stats, if allowed.
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    const { reportId } = this.$route.params

    if (reportId) {
      await this.fetchPublicReportBaseReport({
        reportId,
        reportKey: ReportPageT.ISSUES_AUTOFIXED,
        token: this.token
      })

      if (this.shareHistoricalData) {
        await Promise.all([
          this.fetchPublicReportRecentStats({
            reportId,
            reportKey: ReportPageT.ISSUES_AUTOFIXED,
            token: this.token
          }),
          this.fetchHistoricValuesAndSetChartData()
        ])
      }
    }
  }

  /**
   * fetch historical values and set the chart dataset
   *
   * @param {string} [newDateRange]
   * @returns {Promise<void>}
   */
  async fetchHistoricValuesAndSetChartData(newDateRange?: string): Promise<void> {
    if (newDateRange) {
      this.dateRangeFilter = newDateRange
    }

    const { reportId } = this.$route.params

    await this.fetchPublicReportHistoricalValues(reportId, ReportPageT.ISSUES_AUTOFIXED, this.token)

    const prValues = (this.historicalValues.values.pr ?? []) as number[]
    const defaultBranchValues = (this.historicalValues.values.default_branch ?? []) as number[]

    this.datasets = [
      {
        name: 'Fixed in Pull Requests',
        values: prValues,
        chartType: 'bar'
      },
      {
        name: 'Fixed in Default Branch',
        values: defaultBranchValues,
        chartType: 'bar'
      }
    ]
  }
}
</script>
