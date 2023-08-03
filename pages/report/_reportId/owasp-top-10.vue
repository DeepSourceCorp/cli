<template>
  <public-report-page-wrapper
    :level="level"
    :owner-login="ownerLogin"
    :created-at="createdAt"
    :report-key="ReportPageT.OWASP_TOP_10"
  >
    <section v-if="report" class="space-y-4">
      <chart-container :chart-present="shareHistoricalData">
        <template #report-stats>
          <div class="flex flex-wrap gap-x-8 gap-y-6">
            <div class="flex flex-wrap gap-x-12 gap-y-6">
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
              class="hidden border-l border-slate-400 pl-8 md:flex lg:hidden xl:flex"
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
          class="mt-6 px-5 md:hidden lg:flex xl:hidden"
        />

        <template v-if="shareHistoricalData">
          <div
            v-if="historicalValuesLoading"
            class="mx-5 my-1.5 h-72 animate-pulse rounded-lg bg-ink-300"
          ></div>
          <div v-else>
            <template v-if="shouldChartBeShown">
              <z-chart
                :key="reportRerenderKey"
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
            </template>
            <div v-else class="h-full px-5">
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

      <div class="overflow-x-auto rounded-lg border border-slate-400">
        <z-table class="cursor border-none text-vanilla-100">
          <template #head>
            <z-table-row class="text-xs font-semibold uppercase tracking-wider text-vanilla-400">
              <z-table-cell class="mr-6 w-12 flex-initial text-left"> ID </z-table-cell>
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
                class="h-10 gap-x-4 px-2 text-sm"
              >
                <z-table-cell class="mr-6 w-12 flex-none text-left">
                  <div
                    class="-mx-2 h-full w-12 animate-pulse border-slate-400 bg-ink-300 opacity-50"
                  ></div>
                </z-table-cell>
                <z-table-cell class="text-left">
                  <div
                    class="-mx-6 h-full max-w-sm animate-pulse border-slate-400 bg-ink-300 opacity-50"
                  ></div>
                </z-table-cell>
                <z-table-cell class="ml-8 text-right sm:max-w-2xs">
                  <div
                    class="-mr-2 h-full animate-pulse border-slate-400 bg-ink-300 opacity-50"
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
                <z-table-cell class="mr-6 w-12 flex-initial text-sm font-semibold text-vanilla-400">
                  {{ issue.issueId }}
                </z-table-cell>
                <z-table-cell class="whitespace-nowrap text-sm font-normal text-vanilla-100">
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

import PublicReportMixin from '~/mixins/publicReportMixin'
import ComplianceReportMixin from '~/mixins/complianceReportMixin'

import { ReportLevel } from '~/types/types'
import { ReportMeta, ReportPageT } from '~/types/reportTypes'
import { getFormattedComplianceChartData } from '~/utils/reports'

/**
 * Public Report Child page
 */
@Component({})
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
  async mounted(): Promise<void> {
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

    this.datasets = getFormattedComplianceChartData(this.historicalValues)
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
