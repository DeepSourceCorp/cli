<template>
  <chart-container :is-widget="true" class="gap-y-2" @mouseleave.native="hideReportControls">
    <template #report-header>
      <div class="inline-flex items-center justify-between w-full">
        <div
          v-if="loadingValue.status && isReportGettingSwapped"
          class="h-5 w-56 animate-pulse bg-ink-300"
        ></div>

        <h3
          v-else
          class="inline-flex items-center gap-x-2 text-vanilla-100 text-sm font-normal whitespace-nowrap"
          :class="{ 'overflow-hidden': revealReportControls }"
        >
          <span>
            {{ label }}<template v-if="metadata && metadata.text"> {{ metadata.text }} </template>
          </span>

          <z-icon
            v-if="helpText"
            v-tooltip="{ content: helpText, delay: { show: 0, hide: 100 } }"
            icon="help"
            color="vanilla-400"
            class="hidden lg:inline stroke-1.5 transition-opacity duration-75 flex-shrink-0"
          />

          <compliance-status
            v-if="isComplianceReport"
            :compliance-passed="compliancePassing"
            text-size="text-xxs md:text-xs"
            class="border border-ink-200 rounded-full px-2 hidden xs:flex lg:hidden"
          />
        </h3>

        <!-- Report controls section for smaller screens -->
        <z-button
          v-tooltip="'View full report'"
          :to="reportPageUrl"
          button-type="ghost"
          color="vanilla-400"
          icon="pie-chart"
          size="small"
          class="lg:hidden"
        />

        <!-- Report controls section for larger screens -->
        <div
          class="hidden lg:block h-8 relative"
          :class="[
            reportControlsWidth,
            {
              'lg:bg-ink-400 lg:shadow-blur xl:shadow-none': revealReportControls
            }
          ]"
          @mouseenter="showReportControls"
        >
          <transition name="slide-fade">
            <div
              v-if="!revealReportControls"
              :key="1"
              class="w-full h-full inline-flex items-center justify-end absolute top-0 left-0"
            >
              <z-icon icon="more-horizontal" />
            </div>

            <div
              v-else
              :key="2"
              class="w-full h-full inline-flex items-center justify-end gap-x-2 absolute top-0 left-0"
            >
              <z-button
                v-tooltip="'View full report'"
                :to="reportPageUrl"
                button-type="ghost"
                color="vanilla-400"
                icon="pie-chart"
                size="small"
              />

              <pinnable-reports-list
                v-if="allowPinningReports"
                :current-selection="reportType"
                :level="level"
                :owner="owner"
                :pinned-reports="pinnedReports"
                :provider="provider"
                :repo-name="repoName"
                :report-slot="reportSlot"
              >
                <template #menu-trigger="{ toggle }">
                  <z-button
                    button-type="secondary"
                    color="vanilla-400"
                    icon="settings-2"
                    size="small"
                    @click="toggle"
                  />
                </template>
              </pinnable-reports-list>

              <date-range-picker
                :selected-filter="dateRangeFilter"
                :date-range-options="dateRangeOptions"
                class="whitespace-nowrap"
                @change="updateDateRangeHandler"
              />
            </div>
          </transition>
        </div>
      </div>
    </template>

    <div class="inline-flex items-center gap-x-3 px-5 mt-3.5">
      <div
        v-if="loadingValue.status && isReportGettingSwapped"
        class="h-7 w-52 bg-ink-300 animate-pulse"
      ></div>

      <template v-else>
        <compliance-status
          v-if="isComplianceReport"
          :compliance-passed="compliancePassing"
          text-size="text-xs"
          class="border border-ink-200 rounded-full px-2 hidden lg:flex"
        />

        <div class="inline-flex items-center gap-x-1 text-sm">
          <z-icon icon="activity" />

          <span v-tooltip="value > 1000 ? `${value}` : ''">{{ shortenLargeNumber(value) }}</span>
          <span class="text-vanilla-400">{{ valueLabel }}</span>
        </div>
      </template>
    </div>

    <div
      v-if="loadingValue.status"
      class="chart-skeleton-loader mx-5 my-1.5 rounded-lg bg-ink-300 animate-pulse"
    ></div>

    <template v-else>
      <div v-if="showChartEmptyState" class="px-5">
        <lazy-empty-chart v-bind="emptyChartProps" />
      </div>

      <z-chart v-else :key="dateRangeFilter" v-bind="chartProps" />
    </template>
  </chart-container>
</template>

<script lang="ts">
import { ZButton, ZChart, ZIcon, ZTag } from '@deepsource/zeal'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import {
  CompiledPinnedReportT,
  Dataset,
  DataSetsT,
  DateRangeOptionT,
  HistoricalValues,
  ILoadingValue,
  IReportMetadata,
  IssueDistributionT,
  LoadingConditions,
  ReportMeta,
  ReportPageT
} from '~/types/reportTypes'
import { ReportLevel } from '~/types/types'
import { roundToSignificantNumber } from '~/utils/number'
import {
  dateRangeOptions,
  getDateRange,
  getFilterType,
  getMaxDigitDistributionHistoricalValues,
  prepareLabels
} from '~/utils/reports'
import { shortenLargeNumber } from '~/utils/string'
import { getColorShades } from '~/utils/ui'

interface IChartProps {
  axisOptions: Record<string, boolean>
  barOptions?: Record<string, number | boolean>
  class: string
  colors: Array<string>
  dataSets: DataSetsT
  tooltipOptions?: Record<string, unknown>
  labels: Array<string>
  type: string
  yAxisMax?: number
  yAxisMin: number
}

interface IEmptyChartProps {
  baseShade?: string
  chartColors?: Array<string>
  chartDataset?: Array<Dataset>
  chartType?: string
  count: number
  length?: number
  stacked?: boolean
}

/**
 * Component representing a pinned report widget
 */
@Component({
  name: 'PinnedChartReport',
  components: { ZButton, ZChart, ZIcon, ZTag },
  methods: { shortenLargeNumber }
})
export default class PinnedChartReport extends Vue {
  @Prop({ required: true })
  allowPinningReports: boolean

  @Prop({ required: false })
  compliancePassing: boolean

  @Prop({ required: true })
  datasets: DataSetsT

  @Prop({ required: true })
  historicalValues: HistoricalValues

  @Prop({ required: true })
  reportKey: ReportPageT

  @Prop({ required: true })
  label: string

  @Prop({ required: true })
  level: ReportLevel

  @Prop({ required: true })
  loadingValue: ILoadingValue

  @Prop({ required: true })
  metadata: IReportMetadata

  @Prop({ required: true })
  owner: string

  @Prop({ required: true })
  pinnedReports: Array<CompiledPinnedReportT>

  @Prop({ required: true })
  provider: string

  @Prop({ required: false })
  repoName: string

  @Prop({ required: true })
  reportSlot: number

  @Prop({ required: true })
  value: number

  @Prop({ required: true })
  valueLabel: string

  dateRangeFilter = this.getDateRangeFilter()
  dateRangeOptions: Record<string, DateRangeOptionT> = dateRangeOptions

  revealReportControls = false

  timeoutId: ReturnType<typeof setTimeout>

  LoadingConditions = LoadingConditions

  get chartProps(): IChartProps {
    const { startDate, endDate } = getDateRange(this.dateRangeFilter)

    const labels = prepareLabels(this.historicalValues?.labels, startDate, endDate)

    const commonProps = {
      axisOptions: { xIsSeries: true },
      class: 'chart-tooltip-z-20',
      dataSets: this.datasets,
      labels,
      yAxisMin: 0
    }

    if (this.isComplianceReport) {
      const maxDigitHistoricalValues = Math.max(...(this.datasets?.[0].values as Array<number>))
      const exaggeratedMax = maxDigitHistoricalValues * 1.25
      const maxLineClip = roundToSignificantNumber(
        exaggeratedMax,
        exaggeratedMax.toString().length - 1
      )

      const colors = this.compliancePassing ? ['juniper-500'] : ['cherry-500']

      return {
        ...commonProps,
        colors,
        type: 'line',
        yAxisMax: maxLineClip
      }
    }

    if (this.isIssuesAutofixedReport) {
      return {
        ...commonProps,
        barOptions: { stacked: true },
        colors: ['juniper-500', 'juniper-100'],
        type: 'bar'
      }
    }

    if (this.isCodeHealthTrendReport) {
      return {
        ...commonProps,
        barOptions: { stacked: true },
        colors: ['cherry-500', 'juniper-500', 'robin-500'],
        tooltipOptions: {
          formatTooltipY: (d: number, set: Record<string, unknown>) =>
            set.index === 1 ? Math.abs(d) : d
        },
        type: 'axis-mixed'
      }
    }

    // Remove the report key prefix from the `filter`
    // `issue-distribution-category` -> `category`
    const filterType = getFilterType(this.metadata?.filter) as IssueDistributionT
    const maxDigitHistoricalValues = getMaxDigitDistributionHistoricalValues(
      filterType,
      this.historicalValues as HistoricalValues
    )

    const maxBarClip = roundToSignificantNumber(
      maxDigitHistoricalValues,
      maxDigitHistoricalValues.toString().length - 1
    )

    const baseColorMap = {
      [ReportPageT.DISTRIBUTION]: '#1035ad',
      [ReportPageT.ISSUES_PREVENTED]: '#2eb78b'
    } as Record<ReportPageT, string>

    const colors = getColorShades(
      baseColorMap[this.reportKey as ReportPageT],
      this.datasets?.length as number
    )

    return {
      ...commonProps,
      barOptions: { stacked: true },
      colors,
      type: 'bar',
      yAxisMax: maxBarClip
    }
  }

  get emptyChartProps(): IEmptyChartProps {
    const emptyCodeHealthChartDataSet = [
      { name: 'ACTIVE ISSUES', chartType: 'bar', values: [17, 19, 12, 9, 14, 5, 5, 4] },
      { name: 'RESOLVED ISSUES', chartType: 'bar', values: [-17, -15, -19, -11, -12, 0, -4, -2] },
      { name: 'NET NEW ISSUES', chartType: 'line', values: [0, 4, -7, -2, 2, 5, 1, 2] }
    ]

    const propsMap = {
      [ReportPageT.OWASP_TOP_10]: {
        count: 1,
        chartType: 'line'
      },
      [ReportPageT.SANS_TOP_25]: {
        count: 1,
        chartType: 'line'
      },
      [ReportPageT.DISTRIBUTION]: {
        chartType: 'bar',
        count: 5,
        stacked: true
      },
      [ReportPageT.ISSUES_PREVENTED]: {
        baseShade: '#2eb78b',
        chartType: 'bar',
        count: 5,
        stacked: true
      },
      [ReportPageT.ISSUES_AUTOFIXED]: {
        baseShade: '#33CB9A',
        count: 2,
        chartType: 'bar'
      },
      [ReportPageT.CODE_HEALTH_TREND]: {
        count: 3,
        length: 7,
        chartColors: ['cherry-500', 'juniper-500', 'robin-500'],
        chartDataset: emptyCodeHealthChartDataSet,
        stacked: true
      }
    } as Record<ReportPageT, IEmptyChartProps>

    return propsMap[this.reportKey]
  }

  get helpText(): string {
    const { helpText } = ReportMeta[this.reportKey]
    return helpText ?? ''
  }

  get isCodeHealthTrendReport(): boolean {
    return this.reportKey === ReportPageT.CODE_HEALTH_TREND
  }

  get isComplianceReport(): boolean {
    return [ReportPageT.OWASP_TOP_10, ReportPageT.SANS_TOP_25].includes(
      this.reportKey as ReportPageT
    )
  }

  get isReportGettingSwapped(): boolean {
    return this.loadingValue.condition === LoadingConditions.REPORT_SWAP
  }

  get isIssuesAutofixedReport(): boolean {
    return this.reportKey === ReportPageT.ISSUES_AUTOFIXED
  }

  get reportControlsWidth(): string {
    // Report controls width should be slightly more between `1024px` and `1280px`
    // since a part of the title gets clipped, and the controls go above it
    if (this.allowPinningReports) {
      return `w-60 ${
        this.metadata ? 'lg:w-72' : 'lg:w-64' // Distribution-based reports have filter text appended to the title, hence more width
      } xl:w-60`
    }

    return `w-52
      ${
        this.metadata ? 'lg:w-72 xl:w-52' : '' // Distribution-based reports have filter text appended to the title, hence more width
      }
    `
  }

  get reportPageUrl(): string {
    // issue-distribution-analyzer -> analyzer
    const filterType = getFilterType(this.metadata?.filter)

    const path = [ReportPageT.DISTRIBUTION, ReportPageT.ISSUES_PREVENTED].includes(this.reportKey)
      ? `${this.reportKey}?filter=${filterType}`
      : this.reportKey

    return this.$generateRoute(['reports', path])
  }

  get showChartEmptyState(): boolean {
    return (this.historicalValues?.labels?.length as number) < 2 || this.datasets?.length === 0
  }

  /**
   * Method to compute the current report type
   *
   * @returns {string}
   */
  get reportType(): string {
    const reportType = this.metadata?.filter || this.reportKey

    if (this.loadingValue.status || !reportType) {
      return ''
    }
    return reportType
  }

  /**
   * Method to get the current date range filter
   *
   * @returns {string}
   */
  getDateRangeFilter(): string {
    const reportType = this.metadata?.filter || this.reportKey
    const cookieIdentifier = `${this.provider}_${this.owner}${
      this.level === ReportLevel.Repository ? `_${this.repoName}` : ''
    }_${reportType}_date-range-filter_${this.reportSlot}`

    const validKeys = Object.keys(dateRangeOptions)
    const valueFromCookie = this.$cookies.get(cookieIdentifier)

    return validKeys.includes(valueFromCookie) ? valueFromCookie : validKeys[2]
  }

  /**
   * Method to hide report controls after a `1s` delay
   * Report controls remain visible if the user comes back before `1s`
   *
   * @returns {void}
   */
  hideReportControls(): void {
    this.timeoutId = setTimeout(() => {
      this.revealReportControls = false
    }, 1000)
  }

  /**
   * Method to reveal report controls after clearing the currently active timer
   *
   * @returns {void}
   */
  showReportControls(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
    this.revealReportControls = true
  }

  /**
   * Method to emit an event by the name `update-report-controls`
   *
   * @param {string}} newDateRange
   * @returns {void}
   */
  updateDateRangeHandler(newDateRange: string): void {
    this.dateRangeFilter = newDateRange

    // Emit the `update-report-controls` event signifying a change in date range
    this.$emit('update-report-controls', this.reportSlot, newDateRange)
  }
}
</script>

<style scoped>
.chart-skeleton-loader {
  height: 260px;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
</style>
