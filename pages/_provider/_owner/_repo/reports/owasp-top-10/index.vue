<template>
  <div class="flex flex-col gap-y-4">
    <chart-container>
      <template #report-stats>
        <div class="flex flex-wrap gap-x-8 gap-y-6">
          <div class="flex flex-wrap gap-x-12 gap-y-6">
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
        class="mt-6 px-5 md:hidden lg:flex xl:hidden"
      />

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
            class="chart-tooltip-z-20"
          />
        </template>
        <div v-else class="h-full px-5">
          <lazy-empty-chart :count="1" chart-type="line" />
        </div>
      </div>
    </chart-container>

    <recent-stats :current-val="currentVal" :stats="recentStats" :loading="recentStatsLoading" />

    <div class="overflow-x-auto rounded-lg border border-slate-400">
      <z-table class="border-none text-vanilla-100">
        <template #head>
          <z-table-row class="text-xs font-semibold uppercase tracking-wider text-vanilla-400">
            <z-table-cell class="mr-6 w-12 flex-initial text-left"> Id </z-table-cell>
            <z-table-cell class="text-left"> Name </z-table-cell>
            <z-table-cell class="text-right"> Occurrences </z-table-cell>
          </z-table-row>
        </template>
        <template #body>
          <template v-if="complianceIssuesLoading">
            <template v-if="complianceIssuesLoading">
              <z-table-row
                v-for="index in 9"
                :key="index"
                :class="{ 'mb-2': index < 8 }"
                class="h-10 gap-x-4 px-2 text-sm text-vanilla-100 hover:bg-ink-300"
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
          </template>
          <template v-else>
            <nuxt-link
              v-for="issue in complianceIssueList"
              :key="issue.issueId"
              :to="issueRoute(issue.issueId)"
            >
              <z-table-row class="text-vanilla-100 hover:bg-ink-300">
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
            </nuxt-link>
          </template>
        </template>
      </z-table>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'

import ComplianceReportMixin from '~/mixins/complianceReportMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'

import { ReportLevel } from '~/types/types'
import { ReportPageT } from '~/types/reportTypes'
import { getFormattedComplianceChartData } from '~/utils/reports'

/**
 * Page for displaying the current and historical data of OWASP-top-10 issues.
 */
@Component({
  layout: 'repository'
})
export default class Owasp extends mixins(RepoDetailMixin, ComplianceReportMixin) {
  /**
   * Fetch recent stats, compliance issues and trigger chart data fetching.
   *
   * @returns {Promise<void>}
   */
  async mounted(): Promise<void> {
    const { repo, provider, owner } = this.$route.params
    if (!this.validateRepoDetails(this.repository)) {
      await this.fetchBasicRepoDetails({
        name: repo,
        provider,
        owner,
        refetch: true
      })
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
    await this.fetchReportBase(ReportLevel.Repository, this.repository.id, ReportPageT.OWASP_TOP_10)

    await Promise.all([
      this.fetchRecentStats(ReportLevel.Repository, this.repository.id, ReportPageT.OWASP_TOP_10),
      this.fetchComplianceIssues(
        ReportLevel.Repository,
        this.repository.id,
        ReportPageT.OWASP_TOP_10
      ),
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
    await this.fetchHistoricalValues(
      ReportLevel.Repository,
      this.repository.id,
      ReportPageT.OWASP_TOP_10
    )

    this.datasets = getFormattedComplianceChartData(this.historicalValues)
  }
}
</script>
