<template>
  <div class="flex flex-col gap-y-4">
    <chart-container>
      <template #report-stats>
        <chart-stat title="Status">
          <div
            v-if="reportsDataLoading"
            class="h-5 mt-px w-full bg-ink-300 animate-pulse rounded-sm"
          ></div>
          <template v-else>
            <span
              class="h-2 rounded-full w-2"
              :class="compliancePassed ? 'bg-juniper' : 'bg-cherry'"
            />
            <span
              class="uppercase tracking-wider font-semibold text-sm"
              :class="compliancePassed ? 'text-juniper' : 'text-cherry'"
            >
              {{ compliancePassed ? 'Passing' : 'Failing' }}
            </span>
          </template>
        </chart-stat>

        <chart-stat title="Active Issues" :value="currentVal">
          <div
            v-if="reportsDataLoading"
            class="h-5 mt-px w-full bg-ink-300 animate-pulse rounded-sm"
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
        v-if="historicalValuesLoading"
        class="bg-ink-300 animate-pulse mx-6 mt-6 mb-5 h-64 rounded-lg"
      ></div>

      <z-chart
        v-if="datasets.length && !historicalValuesLoading"
        :data-sets="datasets"
        :labels="labels"
        :colors="['cherry-500']"
        type="line"
      />
    </chart-container>

    <recent-stats :current-val="currentVal" :stats="recentStats" :loading="recentStatsLoading" />

    <div class="rounded-lg border border-ink-200 overflow-x-auto">
      <z-table class="text-vanilla-100 border-none">
        <template #head>
          <z-table-row class="text-vanilla-400 text-xs font-semibold uppercase tracking-wider">
            <z-table-cell class="text-left flex-initial w-12 mr-6"> Id </z-table-cell>
            <z-table-cell class="text-left"> Name </z-table-cell>
            <z-table-cell class="text-right"> Occurrences </z-table-cell>
          </z-table-row>
        </template>
        <template #body>
          <template v-if="complianceIssuesLoading">
            <div
              v-for="index in 10"
              :key="index"
              class="p-5 border-b opacity-50 bg-ink-300 animate-pulse border-ink-200"
            ></div>
          </template>
          <template v-else>
            <nuxt-link
              v-for="issue in complianceIssueList"
              :key="issue.issueId"
              :to="issueRoute(issue.issueId)"
            >
              <z-table-row class="text-vanilla-100 hover:bg-ink-300">
                <z-table-cell class="text-vanilla-400 text-sm font-semibold flex-initial w-12 mr-6">
                  {{ issue.issueId }}
                </z-table-cell>
                <z-table-cell class="whitespace-nowrap text-vanilla-100 text-sm font-normal">
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
import { ZChart, ZTable, ZTableCell, ZTableRow } from '@deepsourcelabs/zeal'

import ReportMixin from '~/mixins/reportMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'

import { ReportLevel, ReportStatus } from '~/types/types'
import { ReportPageT } from '~/types/reportTypes'

/**
 * Page for displaying the current and historical data of OWASP-top-10 issues.
 */
@Component({
  layout: 'repository',
  components: { ZChart, ZTable, ZTableCell, ZTableRow }
})
export default class Owasp extends mixins(RepoDetailMixin, ReportMixin) {
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

    await Promise.all([
      this.fetchReportBase(ReportLevel.Repository, this.repository.id, ReportPageT.OWASP_TOP_10),
      this.fetchRecentStats(ReportLevel.Repository, this.repository.id, ReportPageT.OWASP_TOP_10),
      this.fetchComplianceIssues(
        ReportLevel.Repository,
        this.repository.id,
        ReportPageT.OWASP_TOP_10
      ),
      this.setChartData()
    ])
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

    if (Array.isArray(this.historicalValues.values.count)) {
      this.datasets = [
        {
          name: 'Active Issues',
          values: this.historicalValues.values.count
        }
      ]
    }
  }

  get compliancePassed(): boolean {
    return this.report?.status === ReportStatus.Passing
  }

  get currentVal(): number {
    return this.report?.currentValue ?? 0
  }
}
</script>
