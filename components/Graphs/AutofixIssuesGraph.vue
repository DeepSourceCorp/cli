<template>
  <stat-section
    title="Autofix issues"
    helpText="Summary of issues resolved using Autofix"
    :bodyIsGrid="false"
    :bodySpacing="0"
  >
    <template slot="controls">
      <div class="flex justify-end space-x-2 w-full">
        <graph-control
          class="w-full sm:w-auto float-right"
          :filterValue="30"
          @updateFilter="updateLastDays"
        ></graph-control>
      </div>
    </template>
    <div class="sm:flex sm:flex-row-reverse">
      <div
        v-if="repository.autofixableIssuesMetadata"
        class="flex sm:flex-col w-full sm:w-64 divide-ink-200 divide-y"
      >
        <div class="sm:flex sm:flex-col sm:justify-end sm:h-1/2 p-4">
          <h5 class="font-medium text-2xl">
            {{ repository.autofixableIssuesMetadata.autofixableIssueCount }}
          </h5>
          <p class="text-xs text-vanilla-400">Issues to Autofix</p>
        </div>
        <div class="sm:flex sm:flex-col justify-end sm:h-1/2 p-4">
          <h5 class="font-medium text-2xl">
            {{ estimatedTimeSaved || 0 }}
          </h5>
          <p class="text-xs text-vanilla-400">Estimated time to be saved</p>
        </div>
      </div>
      <div class="w-full sm:w-4/5 sm:border-r border-ink-200">
        <div class="flex items-start space-x-5 p-4 -ml-2">
          <graph-legend
            class="w-1/2 md:w-auto"
            :allowHover="false"
            :showTrends="false"
            :value="currentAutofixCount"
            labelBgClass="bg-robin"
            label="Autofixed issues"
          />
        </div>
        <base-graph
          v-if="autofixTrend.values.length"
          :datasets="dataSets"
          :showControl="false"
          :labels="formattedLabels"
          :height="240"
          type="line"
        ></base-graph>
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
  public lastDays = 30

  async fetch(): Promise<void> {
    await this.fetchBasicRepoDeatils({ ...this.baseRouteParams, refetch: true })
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
