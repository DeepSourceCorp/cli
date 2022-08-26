<template>
  <public-report-page-wrapper
    :level="level"
    :owner-login="ownerLogin"
    :created-at="createdAt"
    :report-key="ReportPageT.SANS_TOP_25"
    :repository-list="repositoryList"
  >
    <section v-if="report" class="space-y-4">
      <chart-container :chart-present="shareHistoricalData">
        <template #report-stats>
          <chart-stat title="Status">
            <div
              v-if="reportsDataLoading"
              class="w-24 h-5 mt-px rounded-sm bg-ink-300 animate-pulse"
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

          <chart-stat title="Active Issues" :value="shortenLargeNumber(currentVal)">
            <div
              v-if="reportsDataLoading"
              class="w-24 h-5 mt-px rounded-sm bg-ink-300 animate-pulse"
            ></div>
          </chart-stat>
        </template>

        <template v-if="shareHistoricalData" #report-control>
          <date-range-picker
            v-model="dateRangeFilter"
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
              <z-table-cell class="flex-none w-16 text-left"> Rank </z-table-cell>
              <z-table-cell class="flex-none w-20 text-left sm:w-28"> Id </z-table-cell>
              <z-table-cell class="text-left"> Name </z-table-cell>
              <z-table-cell class="text-right"> Occurrences </z-table-cell>
            </z-table-row>
          </template>
          <template #body>
            <template v-if="complianceIssuesLoading">
              <z-table-row v-for="index in 25" :key="index" class="text-sm gap-x-4 mb-2 h-10 px-2">
                <z-table-cell class="flex-none w-14 text-left">
                  <div
                    class="h-full opacity-50 bg-ink-300 animate-pulse border-ink-200 w-12 -mx-2"
                  ></div>
                </z-table-cell>
                <z-table-cell class="flex-none w-16 text-left sm:w-24">
                  <div
                    class="h-full opacity-50 bg-ink-300 animate-pulse border-ink-200 -mx-5"
                  ></div>
                </z-table-cell>
                <z-table-cell class="text-left">
                  <div
                    class="h-full w-64 sm:max-w-sm opacity-50 bg-ink-300 animate-pulse border-ink-200 -mx-5"
                  ></div>
                </z-table-cell>
                <z-table-cell class="ml-20 xl:ml-22 text-right sm:flex-initial">
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
                class="text-sm text-vanilla-100"
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
    </section>
  </public-report-page-wrapper>
</template>

<script lang="ts">
import { Component, mixins, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZDivider, ZTag, ZChart, ZTable, ZTableCell, ZTableRow } from '@deepsourcelabs/zeal'

import PublicReportMixin from '~/mixins/publicReportMixin'
import ComplianceReportMixin from '~/mixins/complianceReportMixin'

import { ReportLevel, ReportType, Repository } from '~/types/types'
import { ReportPageT } from '~/types/reportTypes'
import { smartApostrophe, shortenLargeNumber } from '~/utils/string'

/**
 * Public Report Child page
 */
@Component({
  components: {
    ZIcon,
    ZDivider,
    ZTag,
    ZChart,
    ZTable,
    ZTableCell,
    ZTableRow
  },
  methods: {
    smartApostrophe,
    shortenLargeNumber
  }
})
export default class PublicReportSans extends mixins(PublicReportMixin, ComplianceReportMixin) {
  @Prop()
  shareHistoricalData: boolean

  @Prop()
  level: ReportLevel

  @Prop({ default: '' })
  ownerLogin: string

  @Prop()
  objectId: string

  @Prop()
  createdAt: string

  @Prop()
  token: string

  @Prop()
  repositoryList: Array<Repository>

  readonly ReportType = ReportType
  readonly ReportPageT = ReportPageT

  /**
   * Mounted hook for Vue component.
   * Fetch report data on mount.
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

    await this.fetchPublicReportHistoricalValues(reportId, ReportPageT.SANS_TOP_25, this.token)

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
        reportKey: ReportPageT.SANS_TOP_25,
        token: this.token
      })

      const promises: Array<Promise<void>> = [
        this.fetchPublicReportComplianceIssues({
          reportId,
          reportKey: ReportPageT.SANS_TOP_25,
          token: this.token
        })
      ]

      if (this.shareHistoricalData) {
        promises.push(
          this.fetchPublicReportRecentStats({
            reportId,
            reportKey: ReportPageT.SANS_TOP_25,
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
