<template>
  <stat-section
    title="Code quality overview"
    helpText="Summary of active and resolved issues"
    :bodyIsGrid="false"
    :bodySpacing="0"
  >
    <div class="grid grid-cols-1">
      <div class="grid grid-cols-1 gap-5 p-4 -ml-2 md:grid-cols-4">
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
        />
      </div>
      <div class="h-full col-span-2">
        <z-chart
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
        ></z-chart>
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
import { ZButton, ZAnimatedInteger, ZChart } from '@deepsourcelabs/zeal'
import { parseISODate, formatDate } from '@/utils/date'
import { shortenLargeNumber, formatIntl } from '@/utils/string'

import { GraphControl, GraphLegend } from '.'

import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RouteParamsMixin from '~/mixins/routeParamsMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'

import { getChangeFromTrend, getLastTwoTrends } from '~/utils/array'
import { RepoPerms } from '~/types/permTypes'

interface ChartComponent extends Vue {
  initChart?: () => void
}

@Component({
  components: {
    GraphControl,
    GraphLegend,
    ZButton,
    ZAnimatedInteger,
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

  beforeDestroy() {
    this.$socket.$off('repo-analysis-updated', this.refetchData)
  }

  async refetchData(): Promise<void> {
    await this.fetchIssueTrends({ ...this.baseRouteParams, lastDays: this.lastDays, refetch: true })
  }

  async fetch(): Promise<void> {
    await this.fetchIssueTrends({
      ...this.baseRouteParams,
      lastDays: this.lastDays
    })
    this.buildChart()
  }

  public shortenLargeNumber = shortenLargeNumber
  public formatIntl = formatIntl
  public showActiveIssues = true
  public showResolvedIssues = true

  toggleActiveIssues() {
    this.showActiveIssues = !this.showActiveIssues
    if (!this.showActiveIssues && !this.showResolvedIssues) {
      this.showResolvedIssues = true
    }
    this.buildChart()
  }

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

  refreshChart() {
    if (this.chart?.initChart) {
      this.chart.initChart()
    }
  }

  updateLastDays(newVal: number): void {
    this.lastDays = newVal
    this.$fetch()
  }

  public chartType = 'line'
}
</script>
