<template>
  <div class="flex flex-col gap-y-4">
    <chart-container>
      <template #report-stats>
        <div class="flex flex-wrap gap-y-6 gap-x-8">
          <div class="flex flex-wrap gap-y-6 gap-x-12">
            <chart-stat title="Status" :loading="reportsDataLoading">
              <compliance-status v-if="!reportsDataLoading" :compliance-passed="compliancePassed" />
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

      <template #report-control>
        <date-range-picker
          v-model="dateRangeFilter"
          :date-range-options="dateRangeOptions"
          @change="setChartData"
        />
      </template>

      <severity-counts
        v-if="complianceIssuesSeverityMap"
        v-bind="complianceIssuesSeverityMap"
        :loading="complianceIssuesLoading"
        class="px-5 mt-6 md:hidden lg:flex xl:hidden"
      />

      <div
        v-if="historicalValuesLoading"
        class="h-72 mx-5 my-1.5 rounded-lg bg-ink-300 animate-pulse"
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
            class="chart-tooltip-z-20"
          />
        </template>
        <div v-else class="h-full px-5">
          <lazy-empty-chart :count="1" chart-type="line" />
        </div>
      </div>
    </chart-container>

    <recent-stats :current-val="currentVal" :stats="recentStats" :loading="recentStatsLoading" />

    <div class="overflow-x-auto border rounded-lg border-slate-400">
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
              class="text-sm text-vanilla-100 hover:bg-ink-300 gap-x-4 h-10 px-2"
            >
              <z-table-cell class="flex-none w-12 mr-6 text-left">
                <div
                  class="h-full opacity-50 bg-ink-300 animate-pulse border-slate-400 w-12 -mx-2"
                ></div>
              </z-table-cell>
              <z-table-cell class="text-left">
                <div
                  class="h-full max-w-sm opacity-50 bg-ink-300 animate-pulse border-slate-400 -mx-6"
                ></div>
              </z-table-cell>
              <z-table-cell class="ml-8 sm:max-w-2xs text-right">
                <div
                  class="h-full opacity-50 bg-ink-300 animate-pulse border-slate-400 -mr-2"
                ></div>
              </z-table-cell>
            </z-table-row>
          </template>
          <template v-else>
            <z-table-row
              v-for="issue in complianceIssueList"
              :key="issue.issueId"
              class="text-vanilla-100 hover:bg-ink-300"
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
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZChart, ZTable, ZTableCell, ZTableRow } from '@deepsource/zeal'

import ComplianceReportMixin from '~/mixins/complianceReportMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'

import { ReportLevel } from '~/types/types'
import { ReportPageT } from '~/types/reportTypes'
import { getFormattedComplianceChartData } from '~/utils/reports'

/**
 * Page for displaying the current and historical data of OWASP-top-10 issues.
 */
@Component({
  layout: 'dashboard',
  components: { ZChart, ZTable, ZTableCell, ZTableRow }
})
export default class OwnerOwasp extends mixins(OwnerDetailMixin, ComplianceReportMixin) {
  /**
   * Fetch recent stats, compliance issues and trigger chart data fetching.
   *
   * @returns {Promise<void>}
   */
  async mounted(): Promise<void> {
    const { owner, provider } = this.$route.params
    if (!this.owner.id) {
      await this.fetchOwnerDetails({ login: owner, provider })
    }

    this.reportsDataLoading = true
    this.historicalValuesLoading = true
    this.recentStatsLoading = true
    this.complianceIssuesLoading = true

    /**
     * ? Why was fetchReportBase pulled out of Promise.all ->
     * We need to finish report base query first so we have report.status (passing/failing) available.
     * Now setChartData will always be triggered AFTER we have report.status available.
     * So now the chart will always initiate with report.status available and hence, with the correct color.
     */
    await this.fetchReportBase(ReportLevel.Owner, this.owner.id, ReportPageT.OWASP_TOP_10)

    await Promise.all([
      this.fetchRecentStats(ReportLevel.Owner, this.owner.id, ReportPageT.OWASP_TOP_10),
      this.fetchComplianceIssues(ReportLevel.Owner, this.owner.id, ReportPageT.OWASP_TOP_10),
      this.setChartData()
    ])

    this.reportsDataLoading = false
    this.historicalValuesLoading = false
    this.recentStatsLoading = false
    this.complianceIssuesLoading = false
  }

  /**
   * fetch historical values and set the chart dataset
   *
   * @return {Promise<void>}
   */
  async setChartData(): Promise<void> {
    await this.fetchHistoricalValues(ReportLevel.Owner, this.owner.id, ReportPageT.OWASP_TOP_10)

    this.datasets = getFormattedComplianceChartData(this.historicalValues)
  }
}
</script>
