<template>
  <stat-section
    class="min-h-40"
    :class="fullWidth ? 'col-span-full' : ''"
    title="Code quality overview"
    helpText="Summary of active and resolved issues<br/> for this account"
    :fullWidth="false"
    :bodyIsGrid="false"
    :bodySpacing="0"
  >
    <template slot="controls">
      <graph-control
        class="float-right w-full h-8 xl:w-auto"
        :filterValue="lastDays"
        @updateFilter="updateLastDays"
      ></graph-control>
    </template>
    <div
      class="grid grid-cols-1 gap-4 p-4"
      :class="fullWidth ? 'md:grid-cols-4' : 'md:grid-cols-2'"
    >
      <graph-legend
        :allowHover="false"
        :trendPositive="activeIssuesTickerData < 0"
        :trendDirection="activeIssuesTickerData >= 0 ? 'up' : 'down'"
        :trendValue="activeIssuesTickerData"
        trendHint="since yesterday"
        :isPercent="true"
        :value="currentActiveIssues"
        label="Active issues"
        :loading="$fetchState.pending"
      />
      <graph-legend
        :allowHover="false"
        :trendPositive="resolvedIssuesTickerData > 0"
        :trendDirection="resolvedIssuesTickerData >= 0 ? 'up' : 'down'"
        :trendValue="resolvedIssuesTickerData"
        trendHint="since yesterday"
        :isPercent="true"
        :value="currentResolvedIssues"
        label="Resolved issues"
        labelBgClass="bg-robin"
        :loading="$fetchState.pending"
      />
    </div>
    <div v-if="$fetchState.pending" class="p-4">
      <div style="height: 258px" class="rounded-md bg-ink-300 animate-pulse"></div>
    </div>
    <base-graph
      v-else-if="
        (issueData.values && issueData.values.length) ||
        (resolvedIssueData.values && resolvedIssueData.values.length)
      "
      :datasets="dataSets"
      :labels="formattedLabels"
      :showControl="false"
      :height="290"
      :colors="['vanilla-400', 'robin-500']"
      :spline="false"
      type="line"
    ></base-graph>
  </stat-section>
</template>
<script lang="ts">
import { Component, Prop, mixins, namespace } from 'nuxt-property-decorator'
import { formatDate, parseISODate } from '@/utils/date'
import { ZChart } from '@deepsourcelabs/zeal'
import { BaseGraph, GraphLegend } from '.'

import GraphControl from './GraphControl.vue'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import { getChangeFromTrend, getLastTwoTrends } from '~/utils/array'
import { Trend } from '~/store/owner/detail'

const ownerDetailStore = namespace('owner/detail')

@Component({
  components: { BaseGraph, GraphControl, GraphLegend, ZChart }
})
export default class OwnerIssuesGraph extends mixins(OwnerDetailMixin) {
  public lastDays = 30

  @Prop({ default: false })
  fullWidth: boolean

  @ownerDetailStore.State
  issueTrend: Trend

  @ownerDetailStore.State
  resolvedIssueTrend: Trend

  get currentActiveIssues(): number {
    return getLastTwoTrends(this.issueTrend)[0]
  }

  get currentResolvedIssues(): number {
    return getLastTwoTrends(this.resolvedIssueTrend)[0]
  }

  get activeIssuesTickerData(): number {
    return getChangeFromTrend(this.issueTrend)
  }

  get activeIssuesTickerDataCount(): number {
    return getChangeFromTrend(this.issueTrend, false)
  }

  get resolvedIssuesTickerData(): number {
    return getChangeFromTrend(this.resolvedIssueTrend)
  }

  get resolvedIssuesTickerDataCount(): number {
    return getChangeFromTrend(this.resolvedIssueTrend, false)
  }

  get resolvedIssueData(): Trend {
    if (this.resolvedIssueTrend) {
      return this.resolvedIssueTrend
    }
    return { labels: [], values: [] }
  }

  get issueData(): Trend {
    if (this.issueTrend) {
      return this.issueTrend
    }
    return { labels: [], values: [] }
  }

  fetchData() {
    const { owner, provider } = this.$route.params
    return this.fetchIssueTrends({
      provider,
      login: owner,
      lastDays: this.lastDays
    })
  }

  async fetch(): Promise<void> {
    await this.fetchData()
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
    this.fetchData()
  }
}
</script>
n
