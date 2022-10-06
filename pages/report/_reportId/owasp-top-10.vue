<template>
  <public-report-page-wrapper
    :level="level"
    :owner-login="ownerLogin"
    :created-at="createdAt"
    :report-key="ReportPageT.OWASP_TOP_10"
    :repository-list="repositoryList"
  >
    <section v-if="report" class="space-y-4">
      <chart-container :chart-present="shareHistoricalData">
        <template #report-stats>
          <div class="flex flex-wrap gap-y-6 gap-x-8">
            <div class="flex flex-wrap gap-y-6 gap-x-16">
              <chart-stat title="Status" :loading="reportsDataLoading">
                <compliance-status
                  v-if="!reportsDataLoading"
                  :compliance-passed="compliancePassed"
                />
              </chart-stat>
              <chart-stat title="Active Issues" :value="currentVal" :loading="reportsDataLoading" />
            </div>

            <severity-counts
              v-if="complianceIssuesSeverityMap"
              v-bind="complianceIssuesSeverityMap"
              :loading="complianceIssuesLoading"
              class="hidden border-l border-ink-200 pl-8 md:flex lg:hidden xl:flex"
            />
          </div>
        </template>

        <template v-if="shareHistoricalData" #report-control>
          <date-range-picker
            v-model="dateRangeFilter"
            :date-range-options="dateRangeOptions"
            @change="fetchHistoricValuesAndSetChartData"
          />
        </template>

        <severity-counts
          v-if="complianceIssuesSeverityMap"
          v-bind="complianceIssuesSeverityMap"
          :loading="complianceIssuesLoading"
          class="px-5 mt-6 md:hidden lg:flex xl:hidden"
        />

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
              :colors="chartColors"
              :axis-options="{
                xIsSeries: true
              }"
              :y-axis-max="maxLineClip"
              :y-axis-min="0"
              type="line"
            />
            <div v-show="!shouldChartBeShown" class="h-full px-5">
              <lazy-empty-chart :count="1" chart-type="line" />
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

      <div class="overflow-x-auto border rounded-lg border-ink-200">
        <z-table class="border-none text-vanilla-100 cursor">
          <template #head>
            <z-table-row class="text-xs font-semibold tracking-wider uppercase text-vanilla-400">
              <z-table-cell class="flex-initial w-12 mr-6 text-left"> ID </z-table-cell>
              <z-table-cell class="text-left"> NAME </z-table-cell>
              <z-table-cell class="text-right"> OCCURRENCES </z-table-cell>
            </z-table-row>
          </template>
          <template #body>
            <template v-if="complianceIssuesLoading">
              <z-table-row
                v-for="index in 9"
                :key="index"
                :class="{ 'mb-2': index < 8 }"
                class="text-sm gap-x-4 h-10 px-2"
              >
                <z-table-cell class="flex-none w-12 mr-6 text-left">
                  <div
                    class="h-full opacity-50 bg-ink-300 animate-pulse border-ink-200 w-12 -mx-2"
                  ></div>
                </z-table-cell>
                <z-table-cell class="text-left">
                  <div
                    class="h-full max-w-sm opacity-50 bg-ink-300 animate-pulse border-ink-200 -mx-6"
                  ></div>
                </z-table-cell>
                <z-table-cell class="ml-8 sm:max-w-2xs text-right">
                  <div
                    class="h-full opacity-50 bg-ink-300 animate-pulse border-ink-200 -mx-5"
                  ></div>
                </z-table-cell>
              </z-table-row>
            </template>
            <template v-else>
              <z-table-row
                v-for="issue in complianceIssueList"
                :key="issue.issueId"
                class="text-vanilla-100"
              >
                <z-table-cell class="flex-initial w-12 mr-6 text-sm font-semibold text-vanilla-400">
                  {{ issue.issueId }}
                </z-table-cell>
                <z-table-cell class="text-sm font-normal whitespace-nowrap text-vanilla-100">
                  {{ issue.title }}
                </z-table-cell>
                <z-table-cell>
                  <occurrence-tags v-bind="issue.occurrence" class="justify-end" />
                </z-table-cell>
              </z-table-row>
            </template>
          </template>
        </z-table>
      </div>
    </section>
  </public-report-page-wrapper>
</template>

<script lang="ts">
import { Component, mixins, Prop } from 'nuxt-property-decorator'
import { ZChart, ZTable, ZTableCell, ZTableRow, ZDivider } from '@deepsourcelabs/zeal'

import PublicReportMixin from '~/mixins/publicReportMixin'
import ComplianceReportMixin from '~/mixins/complianceReportMixin'

import { ReportLevel, Repository } from '~/types/types'
import { ReportMeta, ReportPageT } from '~/types/reportTypes'
import { shortenLargeNumber } from '~/utils/string'

/**
 * Public Report Child page
 */
@Component({
  components: {
    ZChart,
    ZTable,
    ZTableCell,
    ZTableRow,
    ZDivider
  },
  methods: {
    shortenLargeNumber
  }
})
export default class PublicReportOwasp extends mixins(PublicReportMixin, ComplianceReportMixin) {
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
  created() {
    const reportTitle = ReportMeta[ReportPageT.OWASP_TOP_10].title
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
  async fetchHistoricValuesAndSetChartData(): Promise<void> {
    const { reportId } = this.$route.params

    await this.fetchPublicReportHistoricalValues(reportId, ReportPageT.OWASP_TOP_10, this.token)

    if (Array.isArray(this.historicalValues?.values?.count)) {
      this.datasets = [
        {
          name: 'Active Issues',
          values: this.historicalValues?.values?.count
        }
      ]
    }
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
        reportKey: ReportPageT.OWASP_TOP_10,
        token: this.token
      })

      const promises: Array<Promise<void>> = [
        this.fetchPublicReportComplianceIssues(reportId, ReportPageT.OWASP_TOP_10, this.token)
      ]

      if (this.shareHistoricalData) {
        promises.push(
          this.fetchPublicReportRecentStats({
            reportId,
            reportKey: ReportPageT.OWASP_TOP_10,
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
