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
        v-show="historicalValuesLoading"
        class="h-72 mx-5 my-1.5 rounded-lg bg-ink-300 animate-pulse"
      ></div>
      <div v-show="!historicalValuesLoading">
        <z-chart
          v-if="shouldChartBeShown"
          :data-sets="datasets"
          :key="reportRerenderKey"
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
        <div v-show="!shouldChartBeShown" class="h-full px-5">
          <lazy-empty-chart :count="1" chart-type="line" />
        </div>
      </div>
    </chart-container>

    <recent-stats :current-val="currentVal" :stats="recentStats" :loading="recentStatsLoading" />

    <div class="overflow-x-auto border rounded-lg border-ink-200">
      <z-table class="border-none text-vanilla-100">
        <template #head>
          <z-table-row class="text-xs font-semibold tracking-wider uppercase text-vanilla-400">
            <z-table-cell class="flex-none w-16 text-left"> RANK </z-table-cell>
            <z-table-cell class="flex-none w-20 text-left sm:w-28"> ID </z-table-cell>
            <z-table-cell class="text-left"> NAME </z-table-cell>
            <z-table-cell class="text-right"> OCCURRENCES </z-table-cell>
          </z-table-row>
        </template>
        <template #body>
          <template v-if="complianceIssuesLoading">
            <z-table-row
              v-for="index in 25"
              :key="index"
              class="text-sm text-vanilla-100 hover:bg-ink-300 gap-x-4 mb-2 h-10 px-2"
            >
              <z-table-cell class="flex-none w-14 text-left">
                <div
                  class="h-full opacity-50 bg-ink-300 animate-pulse border-ink-200 w-12 -mx-2"
                ></div>
              </z-table-cell>
              <z-table-cell class="flex-none w-16 text-left sm:w-20">
                <div class="h-full opacity-50 bg-ink-300 animate-pulse border-ink-200 -mx-4"></div>
              </z-table-cell>
              <z-table-cell class="text-left pl-1 sm:pl-5">
                <div
                  class="h-full w-100 sm:w-auto sm:max-w-md opacity-50 bg-ink-300 animate-pulse border-ink-200 -mr-4"
                ></div>
              </z-table-cell>
              <z-table-cell class="ml-20 xl:ml-22 text-right sm:flex-initial pr-8">
                <div class="h-full opacity-50 bg-ink-300 animate-pulse border-ink-200 -mx-5"></div>
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
                <z-table-cell class="flex-none w-16 font-semibold text-left text-vanilla-400">
                  {{ issue.rank }}
                </z-table-cell>
                <z-table-cell
                  class="flex-none w-20 font-semibold text-left sm:w-28 text-vanilla-400 whitespace-nowrap"
                >
                  {{ issue.issueId }}
                </z-table-cell>
                <z-table-cell class="font-normal text-left whitespace-nowrap sm:whitespace-normal">
                  <p class="leading-8">{{ issue.title }}</p>
                </z-table-cell>
                <z-table-cell class="ml-20 xl:ml-22 font-semibold text-right sm:flex-initial">
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
import { ZChart, ZTable, ZTableCell, ZTableRow } from '@deepsource/zeal'

import { ReportPageT } from '~/types/reportTypes'

import ComplianceReportMixin from '~/mixins/complianceReportMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import { ReportLevel } from '~/types/types'

/**
 * Page for displaying the current and historical data of SANS-top-25 issues.
 */
@Component({
  layout: 'repository',
  components: { ZChart, ZTable, ZTableCell, ZTableRow }
})
export default class Sans extends mixins(RepoDetailMixin, ComplianceReportMixin) {
  /**
   * Fetch recent stats, compliance issues and trigger chart data fetching.
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
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

    if (Array.isArray(this.historicalValues.values.count)) {
      this.datasets = [
        {
          name: 'Active Issues',
          values: this.historicalValues.values.count
        }
      ]
    }
  }
}
</script>
