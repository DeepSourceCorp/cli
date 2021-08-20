<template>
  <stat-section
    class="min-h-40"
    title="Code quality overview"
    helpText="Summary of active and resolved issues<br/> for this account"
    :fullWidth="false"
    :bodyIsGrid="false"
    :bodySpacing="0"
  >
    <template slot="controls">
      <graph-control
        class="float-right h-8 w-full xl:w-auto"
        :filterValue="lastDays"
        @updateFilter="updateLastDays"
      ></graph-control>
    </template>
    <div class="flex items-start space-x-5 p-4 -ml-2">
      <graph-legend
        class="w-1/2 md:w-auto"
        :allowHover="false"
        :trendPositive="activeIssuesTickerData < 0"
        :trendDirection="activeIssuesTickerData >= 0 ? 'up' : 'down'"
        :trendValue="activeIssuesTickerData"
        :trendHint="getTooltipText(activeIssuesTickerDataCount, activeIssuesTickerData >= 0)"
        :isPercent="true"
        :value="currentActiveIssues"
        label="Active issues"
      />
      <graph-legend
        class="w-1/2 md:w-auto"
        :allowHover="false"
        :trendPositive="resolvedIssuesTickerData > 0"
        :trendDirection="resolvedIssuesTickerData >= 0 ? 'up' : 'down'"
        :trendValue="resolvedIssuesTickerData"
        :trendHint="getTooltipText(resolvedIssuesTickerDataCount, resolvedIssuesTickerData >= 0)"
        :isPercent="true"
        :value="currentResolvedIssues"
        label="Resolved issues"
        labelBgClass="bg-robin"
      />
    </div>
    <base-graph
      v-if="issueData.values.length || resolvedIssueData.values.length"
      :datasets="dataSets"
      :labels="formattedLabels"
      :showControl="false"
      :height="290"
      :colors="['vanilla-400', 'robin']"
      :spline="false"
      type="line"
    ></base-graph>
  </stat-section>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { formatDate, parseISODate } from '@/utils/date'
import { ZChart } from '@deepsourcelabs/zeal'
import { BaseGraph, GraphLegend } from '.'

import GraphControl from './GraphControl.vue'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import { getChangeFromTrend, getLastTwoTrends } from '~/utils/array'

interface Trend {
  labels: string[]
  values: number[]
}

@Component({
  components: { BaseGraph, GraphControl, GraphLegend, ZChart }
})
export default class OwnerIssuesGraph extends mixins(OwnerDetailMixin) {
  public lastDays = 30

  get currentActiveIssues(): number {
    return getLastTwoTrends(this.owner.issueTrend)[0]
  }

  get currentResolvedIssues(): number {
    return getLastTwoTrends(this.owner.resolvedIssueTrend)[0]
  }

  get activeIssuesTickerData(): number {
    return getChangeFromTrend(this.owner.issueTrend)
  }

  get activeIssuesTickerDataCount(): number {
    return getChangeFromTrend(this.owner.issueTrend, false)
  }

  get resolvedIssuesTickerData(): number {
    return getChangeFromTrend(this.owner.resolvedIssueTrend)
  }

  get resolvedIssuesTickerDataCount(): number {
    return getChangeFromTrend(this.owner.resolvedIssueTrend, false)
  }

  getTooltipText(count: number, isUpward: boolean): string {
    if (isUpward) {
      return `Increased by ${count} since yesterday`
    }
    return `Decreased by ${Math.abs(count)} since yesterday`
  }

  get resolvedIssueData(): Trend {
    if (this.owner.resolvedIssueTrend) {
      return this.owner.resolvedIssueTrend
    }
    return { labels: [], values: [] }
  }

  get issueData(): Trend {
    if (this.owner.issueTrend) {
      return this.owner.issueTrend
    }
    return { labels: [], values: [] }
  }

  async fetch(): Promise<void> {
    const { owner, provider } = this.$route.params

    await this.fetchIssueTrends({
      provider,
      login: owner,
      lastDays: this.lastDays
    })
  }

  get formattedLabels(): string[] {
    if (this.issueData) {
      return this.issueData.labels.map((label) => {
        return formatDate(parseISODate(label))
      })
    }
    if (this.resolvedIssueData) {
      return this.resolvedIssueData.labels.map((label) => {
        return formatDate(parseISODate(label))
      })
    }
    return []
  }

  mounted(): void {
    this.$fetch()
  }

  get dataSets(): { name: string; values: number[] }[] {
    const data: { name: string; values: number[] }[] = []
    if (this.issueData.values) {
      data.push({
        name: 'Active Issues',
        values: this.issueData.values
      })
    }
    if (this.resolvedIssueData.values) {
      data.push({
        name: 'Resolved issues',
        values: this.resolvedIssueData.values
      })
    }
    return data
  }

  updateLastDays(newVal: number): void {
    this.lastDays = newVal
    this.$fetch()
  }
}
</script>
n
