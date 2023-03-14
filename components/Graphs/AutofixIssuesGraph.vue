<template>
  <stat-section
    title="Autofixed issues"
    help-text="Summary of issues resolved using Autofix"
    :body-is-grid="false"
    :body-spacing="0"
  >
    <template slot="controls">
      <div class="flex justify-end w-full space-x-2">
        <graph-control
          class="float-right w-full sm:w-auto"
          :filter-value="30"
          @updateFilter="updateLastDays"
        />
      </div>
    </template>
    <div class="sm:flex sm:flex-row-reverse">
      <div
        v-if="repository.autofixableIssuesMetadata"
        class="flex w-full divide-y sm:flex-col sm:w-64 divide-ink-200"
      >
        <div class="p-4 sm:flex sm:flex-col sm:justify-end sm:h-1/2">
          <h5 class="text-2xl font-medium">
            {{ repository.autofixableIssuesMetadata.autofixableIssueCount }}
          </h5>
          <p class="text-xs text-vanilla-400">Issues to Autofix</p>
        </div>
        <div class="justify-end p-4 sm:flex sm:flex-col sm:h-1/2">
          <h5 class="text-2xl font-medium">
            {{ estimatedTimeSaved || 0 }}
          </h5>
          <p class="text-xs text-vanilla-400">Estimated time to be saved</p>
        </div>
      </div>
      <div class="w-full sm:border-r border-slate-400">
        <div class="flex items-start p-4 space-x-5">
          <graph-legend
            class="w-1/2 md:w-auto"
            :allow-hover="false"
            :show-trends="false"
            :value="currentAutofixCount"
            label-bg-class="bg-robin"
            label="Autofixed issues"
            :loading="$fetchState.pending"
          />
        </div>
        <div v-if="$fetchState.pending" class="p-4">
          <div class="h-52 rounded-md bg-ink-300 animate-pulse"></div>
        </div>
        <base-graph
          v-else-if="autofixTrend.values && autofixTrend.values.length"
          :datasets="dataSets"
          :show-control="false"
          :labels="formattedLabels"
          :height="240"
          class="chart-tooltip-z-20"
          type="line"
        />
      </div>
    </div>
  </stat-section>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { BaseGraph, GraphControl } from '.'
import { formatDate, parseISODate, formatSeconds } from '@/utils/date'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import { getLastTwoTrends } from '~/utils/array'

interface Trend {
  labels: string[]
  values: number[]
}

@Component({
  components: {
    BaseGraph,
    GraphControl
  },
  layout: 'repository'
})
export default class Autofix extends mixins(RepoDetailMixin) {
  async fetch(): Promise<void> {
    await this.fetchBasicRepoDetails({ ...this.baseRouteParams, refetch: true })
    await this.fetchRepo()
  }

  async fetchRepo(): Promise<void> {
    await this.fetchAutofixTrends({
      ...this.baseRouteParams,
      lastDays: this.lastDays
    })
  }

  async fetchAutoRuns(): Promise<void> {}

  get estimatedTimeSaved(): string {
    const seconds = Number(this.repository?.autofixableIssuesMetadata?.estimatedTimeSaved)
    return formatSeconds(seconds, true)
  }

  get showAvailableAutofixes(): boolean {
    const available = this.repository.autofixableIssuesPerAnalyzer
    return Boolean(available && available.length > 0)
  }

  get autofixTrend(): Trend {
    if (this.repository.autofixedIssueTrend) {
      return this.repository.autofixedIssueTrend
    }
    return { labels: [], values: [] }
  }

  get currentAutofixCount(): number {
    return getLastTwoTrends(this.repository.autofixedIssueTrend)[0]
  }

  get dataSets(): { name: string; values: number[] }[] {
    if (this.autofixTrend) {
      return [
        {
          name: 'Issues Autofixed',
          values: this.autofixTrend.values
        }
      ]
    }
    return []
  }

  get formattedLabels(): string[] {
    if (this.autofixTrend) {
      return this.autofixTrend.labels.map((label) => {
        return formatDate(parseISODate(label))
      })
    }
    return []
  }

  async updateLastDays(newVal: number): Promise<void> {
    this.lastDays = newVal
    await this.fetchRepo()
  }
}
</script>
