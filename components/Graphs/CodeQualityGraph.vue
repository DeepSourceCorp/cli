<template>
  <stat-section
    title="Code quality overview"
    helpText="Summary of active and resolved issues"
    :bodyIsGrid="false"
    :bodySpacing="0"
  >
    <div class="grid grid-cols-1">
      <div class="grid grid-cols-1 gap-4 p-4 md:grid-cols-4">
        <graph-legend
          :isActive="showActiveIssues"
          @toggle="toggleActiveIssues"
          :trendPositive="activeIssuesTickerData < 0"
          :trendDirection="activeIssuesTickerData >= 0 ? 'up' : 'down'"
          :trendValue="activeIssuesTickerData"
          trendHint="since yesterday"
          :value="currentActiveIssues"
          :isPercent="true"
          label="Active issues"
          :loading="$fetchState.pending"
        />
        <graph-legend
          :isActive="showResolvedIssues"
          @toggle="toggleResolvedIssues"
          :trendPositive="resolvedIssuesTickerData > 0"
          :trendDirection="resolvedIssuesTickerData >= 0 ? 'up' : 'down'"
          :trendValue="resolvedIssuesTickerData"
          trendHint="since yesterday"
          :value="currentResolvedIssues"
          :isPercent="true"
          label="Resolved issues"
          labelBgClass="bg-robin"
          :loading="$fetchState.pending"
        />
      </div>

      <div class="h-full col-span-2">
        <div v-if="$fetchState.pending" class="p-4">
          <div style="height: 268px" class="rounded-md bg-ink-300 animate-pulse"></div>
        </div>
        <z-chart
          v-else
          ref="code-quality-chart"
          :dataSets="codeQualityData.data"
          :labels="codeQualityData.labels"
          :height="300"
          :tooltipOptions="{
            formatTooltipY: formatIntl
          }"
          :colors="codeQualityData.colors"
          type="line"
          :yAxisMin="0"
          :showLegend="false"
          :axisOptions="axisOptions"
        />
      </div>
    </div>
    <template slot="controls">
      <div class="flex justify-end w-full space-x-2">
        <graph-control
          class="w-full h-8 md:w-auto"
          :allowChartTypeToggle="false"
          @updateFilter="updateLastDays"
        ></graph-control>
        <z-button
          v-if="isAddBadgeBtnVisible"
          :to="$generateRoute(['settings', 'badges'])"
          buttonType="secondary"
          icon="award"
          size="small"
          class="stroke-1.5"
          v-tooltip="'Add badge to repository'"
        >
        </z-button>
      </div>
    </template>
  </stat-section>
</template>
<script lang="ts">
import { Component, Ref, mixins } from 'nuxt-property-decorator'
import { ZButton, ZChart } from '@deepsourcelabs/zeal'
import { parseISODate, formatDate } from '@/utils/date'
import { formatIntl } from '@/utils/string'

import { GraphControl, GraphLegend } from '.'

import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RouteParamsMixin from '~/mixins/routeParamsMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'

import { getChangeFromTrend, getLastTwoTrends } from '~/utils/array'
import { RepoPerms } from '~/types/permTypes'

interface ChartComponent extends Vue {
  initChart?: () => void
}

/**
 * Component to show current count & graph of active
 * and resolved issues
 */
@Component({
  components: {
    GraphControl,
    GraphLegend,
    ZButton,
    ZChart
  }
})
export default class CodeQualityGraph extends mixins(
  RepoDetailMixin,
  RouteParamsMixin,
  RoleAccessMixin
) {
  @Ref('code-quality-chart')
  chart: ChartComponent

  /**
   * Mounted hook for Vue component.
   *
   * @returns void
   */
  mounted() {
    this.chart = this.$refs['code-quality-chart'] as ChartComponent
    this.$socket.$on('repo-analysis-updated', this.refetchData)
  }

  lastDays = 30

  axisOptions = {
    yAxisMode: '',
    xAxisMode: 'tick',
    shortenYAxisNumbers: true,
    xIsSeries: 1
  }

  codeQualityData: {
    data: Array<Record<string, string | number[]>>
    labels: string[]
    colors: string[]
  } = {
    data: [],
    labels: [],
    colors: ['vanilla-400', 'robin-500']
  }

  /**
   * Before destroy hook for Vue component.
   * Called right before a Vue instance is destroyed.
   *
   * @returns void
   */
  beforeDestroy() {
    this.$socket.$off('repo-analysis-updated', this.refetchData)
  }

  /**
   * Function to fetch latest Issues trend data with cleared cache
   *
   * @returns Promise<void>
   */
  async refetchData(): Promise<void> {
    await this.fetchIssueTrends({
      ...this.baseRouteParams,
      lastDays: this.lastDays,
      refetch: true
    })
  }

  /**
   * Function to fetch Issues trend data
   *
   * @returns Promise<void>
   */
  async fetchData() {
    await this.fetchIssueTrends({
      ...this.baseRouteParams,
      lastDays: this.lastDays
    })
    this.buildChart()
  }

  /**
   * Fetch hook for Vue component
   *
   * @returns Promise<void>
   */
  async fetch(): Promise<void> {
    await this.fetchData()
  }

  public formatIntl = formatIntl
  public showActiveIssues = true
  public showResolvedIssues = true

  /**
   * Function to toggle show/hide active issues data in graph
   *
   * @returns void
   */
  toggleActiveIssues() {
    this.showActiveIssues = !this.showActiveIssues
    if (!this.showActiveIssues && !this.showResolvedIssues) {
      this.showResolvedIssues = true
    }
    this.buildChart()
  }

  /**
   * Function to toggle show/hide resolved issues data in graph
   *
   * @returns void
   */
  toggleResolvedIssues() {
    this.showResolvedIssues = !this.showResolvedIssues
    if (!this.showActiveIssues && !this.showResolvedIssues) {
      this.showActiveIssues = true
    }
    this.buildChart()
  }

  get currentActiveIssues(): number {
    return getLastTwoTrends(this.repository.issueTrend)[0]
  }

  get currentResolvedIssues(): number {
    return getLastTwoTrends(this.repository.resolvedIssueTrend)[0]
  }

  get activeIssuesTickerData(): number {
    return getChangeFromTrend(this.repository.issueTrend)
  }

  get activeIssuesTickerDataCount(): number {
    return getChangeFromTrend(this.repository.issueTrend, false)
  }

  get resolvedIssuesTickerData(): number {
    return getChangeFromTrend(this.repository.resolvedIssueTrend)
  }

  get resolvedIssuesTickerDataCount(): number {
    return getChangeFromTrend(this.repository.resolvedIssueTrend, false)
  }

  get isAddBadgeBtnVisible(): boolean {
    return this.$gateKeeper.repo(RepoPerms.VIEW_BADGES, this.repoPerms.permission)
  }

  /**
   * Function to build chart with all its props
   *
   * @returns void
   */
  buildChart(): void {
    const data = []
    const colors = []
    let labels = []
    if (this.repository.issueTrend && this.showActiveIssues) {
      data.push({
        name: 'Active Issues',
        values: this.repository?.issueTrend?.values || []
      })
      colors.push('vanilla-400')
      labels = this.repository.issueTrend.labels
    }

    if (this.repository.resolvedIssueTrend && this.showResolvedIssues) {
      data.push({
        name: 'Resolved Issues',
        values: this.repository?.resolvedIssueTrend?.values || []
      })
      colors.push('robin-500')
      labels = this.repository.resolvedIssueTrend.labels
    }

    if (labels) {
      labels = labels.map((timestamp: string) => formatDate(parseISODate(timestamp)))
    }
    this.codeQualityData = { data, colors, labels }

    this.refreshChart()
    this.$nextTick(() => {
      this.refreshChart()
    })
  }

  /**
   * Function to refresh chart by initializing it again
   *
   * @returns void
   */
  refreshChart() {
    if (this.chart?.initChart) {
      this.chart.initChart()
    }
  }

  /**
   * Update the value of lastDays and refetch data for graph
   *
   * @param {number} newVal - new value for number of days
   * for which data is shown in graph
   * @returns void
   */
  updateLastDays(newVal: number): void {
    this.lastDays = newVal
    this.fetchData()
  }

  public chartType = 'line'
}
</script>
