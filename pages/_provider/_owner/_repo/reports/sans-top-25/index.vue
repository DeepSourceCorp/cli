<template>
  <div class="flex flex-col gap-y-4">
    <chart-container>
      <template #report-stats>
        <chart-stat title="Status" :loading="reportsDataLoading">
          <compliance-status v-if="!reportsDataLoading" :compliance-passed="compliancePassed" />
        </chart-stat>

        <chart-stat title="Active Issues" :value="currentVal" :loading="reportsDataLoading" />
      </template>

      <template #report-control>
        <date-range-picker
          v-model="dateRangeFilter"
          :date-range-options="dateRangeOptions"
          @change="setChartData"
        />
      </template>

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
            <z-table-cell class="w-16 flex-none text-left"> RANK </z-table-cell>
            <z-table-cell class="w-20 flex-none text-left sm:w-28"> ID </z-table-cell>
            <z-table-cell class="text-left"> NAME </z-table-cell>
            <z-table-cell class="text-right"> OCCURRENCES </z-table-cell>
          </z-table-row>
        </template>
        <template #body>
          <template v-if="complianceIssuesLoading">
            <z-table-row
              v-for="index in 25"
              :key="index"
              class="mb-2 h-10 gap-x-4 px-2 text-sm text-vanilla-100 hover:bg-ink-300"
            >
              <z-table-cell class="w-14 flex-none text-left">
                <div
                  class="-mx-2 h-full w-12 animate-pulse border-slate-400 bg-ink-300 opacity-50"
                ></div>
              </z-table-cell>
              <z-table-cell class="w-16 flex-none text-left sm:w-20">
                <div
                  class="-mx-4 h-full animate-pulse border-slate-400 bg-ink-300 opacity-50"
                ></div>
              </z-table-cell>
              <z-table-cell class="pl-1 text-left sm:pl-5">
                <div
                  class="-mr-4 h-full w-100 animate-pulse border-slate-400 bg-ink-300 opacity-50 sm:w-auto sm:max-w-md"
                ></div>
              </z-table-cell>
              <z-table-cell class="ml-20 pr-8 text-right sm:flex-initial xl:ml-22">
                <div
                  class="-mx-5 h-full animate-pulse border-slate-400 bg-ink-300 opacity-50"
                ></div>
              </z-table-cell>
            </z-table-row>
          </template>

          <template v-else>
            <nuxt-link
              v-for="issue in complianceIssueList"
              :key="issue.issueId"
              :to="issueRoute(issue.issueId)"
            >
              <z-table-row class="text-sm text-vanilla-100 hover:bg-ink-300">
                <z-table-cell class="w-16 flex-none text-left font-semibold text-vanilla-400">
                  {{ issue.rank }}
                </z-table-cell>
                <z-table-cell
                  class="w-20 flex-none whitespace-nowrap text-left font-semibold text-vanilla-400 sm:w-28"
                >
                  {{ issue.issueId }}
                </z-table-cell>
                <z-table-cell class="whitespace-nowrap text-left font-normal sm:whitespace-normal">
                  <p class="leading-8">{{ issue.title }}</p>
                </z-table-cell>
                <z-table-cell class="ml-20 text-right font-semibold sm:flex-initial xl:ml-22">
                  {{ issue.occurrence.total }}
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

import { ReportPageT } from '~/types/reportTypes'

import ComplianceReportMixin from '~/mixins/complianceReportMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import { ReportLevel } from '~/types/types'
import { getFormattedComplianceChartData } from '~/utils/reports'

/**
 * Page for displaying the current and historical data of SANS-top-25 issues.
 */
@Component({
  layout: 'repository'
})
export default class Sans extends mixins(RepoDetailMixin, ComplianceReportMixin) {
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
    await this.fetchReportBase(ReportLevel.Repository, this.repository.id, ReportPageT.SANS_TOP_25)

    await Promise.all([
      this.fetchRecentStats(ReportLevel.Repository, this.repository.id, ReportPageT.SANS_TOP_25),
      this.fetchComplianceIssues(
        ReportLevel.Repository,
        this.repository.id,
        ReportPageT.SANS_TOP_25
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
      ReportPageT.SANS_TOP_25
    )

    this.datasets = getFormattedComplianceChartData(this.historicalValues)
  }
}
</script>
