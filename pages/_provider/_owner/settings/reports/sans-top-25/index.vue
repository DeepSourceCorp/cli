<template>
  <div class="flex flex-col gap-y-4">
    <chart-container>
      <template #report-stats>
        <chart-stat title="Status">
          <div
            v-if="reportsDataLoading"
            class="w-full h-5 mt-px rounded-sm bg-ink-300 animate-pulse"
          ></div>
          <template v-else>
            <span
              class="w-2 h-2 rounded-full"
              :class="compliancePassed ? 'bg-juniper' : 'bg-cherry'"
            />
            <span
              class="text-sm font-semibold tracking-wider uppercase"
              :class="compliancePassed ? 'text-juniper' : 'text-cherry'"
            >
              {{ compliancePassed ? 'Passing' : 'Failing' }}
            </span>
          </template>
        </chart-stat>

        <chart-stat title="Active Issues" :value="currentVal">
          <div
            v-if="reportsDataLoading"
            class="w-full h-5 mt-px rounded-sm bg-ink-300 animate-pulse"
          ></div>
        </chart-stat>
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
    </chart-container>

    <recent-stats :current-val="currentVal" :stats="recentStats" :loading="recentStatsLoading" />

    <div class="overflow-x-auto border rounded-lg border-ink-200">
      <z-table class="border-none text-vanilla-100 cursor">
        <template #head>
          <z-table-row class="text-xs font-semibold tracking-wider uppercase text-vanilla-400">
            <z-table-cell class="flex-none w-16 text-left"> Rank </z-table-cell>
            <z-table-cell class="flex-none w-20 text-left sm:w-28"> Id </z-table-cell>
            <z-table-cell class="text-left"> Name </z-table-cell>
            <z-table-cell class="text-right"> Occurrences </z-table-cell>
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
                <div class="h-full opacity-50 bg-ink-300 animate-pulse border-ink-200 -mx-5"></div>
              </z-table-cell>
              <z-table-cell class="flex-none w-16 text-left sm:w-24">
                <div class="h-full opacity-50 bg-ink-300 animate-pulse border-ink-200 -mx-5"></div>
              </z-table-cell>
              <z-table-cell class="text-left">
                <div
                  class="h-full w-100 sm:max-w-sm opacity-50 bg-ink-300 animate-pulse border-ink-200 -mx-5"
                ></div>
              </z-table-cell>
              <z-table-cell class="ml-20 xl:ml-22 text-right sm:flex-initial">
                <div class="h-full opacity-50 bg-ink-300 animate-pulse border-ink-200 -mx-5"></div>
              </z-table-cell>
            </z-table-row>
          </template>

          <template v-else>
            <z-table-row
              v-for="issue in complianceIssueList"
              :key="issue.issueId"
              class="text-sm text-vanilla-100 hover:bg-ink-300"
            >
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
          </template>
        </template>
      </z-table>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZChart, ZTable, ZTableCell, ZTableRow } from '@deepsourcelabs/zeal'

import { ReportPageT } from '~/types/reportTypes'

import ComplianceReportMixin from '~/mixins/complianceReportMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'

import { ReportLevel } from '~/types/types'

/**
 * Page for displaying the current and historical data of SANS-top-25 issues.
 */
@Component({
  layout: 'dashboard',
  components: { ZChart, ZTable, ZTableCell, ZTableRow }
})
export default class OwnerSans extends mixins(OwnerDetailMixin, ComplianceReportMixin) {
  /**
   * Fetch recent stats, compliance issues and trigger chart data fetching.
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    const { owner, provider } = this.$route.params
    if (!this.owner.id) {
      await this.fetchOwnerDetails({ login: owner, provider })
    }

    /**
     * ? Why was fetchReportBase pulled out of Promise.all ->
     * We need to finish report base query first so we have report.status (passing/failing) available.
     * Now setChartData will always be triggered AFTER we have report.status available.
     * So now the chart will always initiate with report.status available and hence, with the correct color.
     */
    await this.fetchReportBase(ReportLevel.Owner, this.owner.id, ReportPageT.SANS_TOP_25)

    await Promise.all([
      this.fetchRecentStats(ReportLevel.Owner, this.owner.id, ReportPageT.SANS_TOP_25),
      this.fetchComplianceIssues(ReportLevel.Owner, this.owner.id, ReportPageT.SANS_TOP_25),
      this.setChartData()
    ])
  }

  /**
   * fetch historical values and set the chart dataset
   *
   * @return {Promise<void>}
   */
  async setChartData(): Promise<void> {
    await this.fetchHistoricalValues(ReportLevel.Owner, this.owner.id, ReportPageT.SANS_TOP_25)

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
