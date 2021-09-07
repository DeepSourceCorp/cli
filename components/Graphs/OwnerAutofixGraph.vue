<template>
  <stat-section
    class="min-h-40"
    title="Autofix overview"
    helpText="Summary of issues resolved using Autofix"
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
        :showTrends="false"
        :value="currentAutofixCount"
        labelBgClass="bg-robin"
        label="Autofixed issues"
      />
    </div>
    <base-graph
      v-if="autofixTrend.values.length"
      :datasets="dataSets"
      :labels="formattedLabels"
      :showControl="false"
      :colors="['robin-500']"
      :spline="false"
      type="line"
    ></base-graph>
  </stat-section>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { formatDate, parseISODate } from '@/utils/date'
import BaseGraph from './BaseGraph.vue'
import { getLastTwoTrends } from '~/utils/array'

import OwnerDetailMixin from '~/mixins/ownerDetailMixin'

interface Trend {
  labels: string[]
  values: number[]
}

@Component({
  components: { BaseGraph }
})
export default class OwnerAutofixGraph extends mixins(OwnerDetailMixin) {
  public lastDays = 30

  get autofixTrend(): Trend {
    if (this.owner.autofixedIssueTrend) {
      return this.owner.autofixedIssueTrend
    }
    return { labels: [], values: [] }
  }

  get currentAutofixCount(): number {
    return getLastTwoTrends(this.owner.autofixedIssueTrend)[0]
  }

  async fetch(): Promise<void> {
    await this.fetchAutofixTrends({
      login: this.$route.params.owner,
      provider: this.$route.params.provider,
      lastDays: this.lastDays
    })
  }

  get formattedLabels(): string[] {
    if (this.autofixTrend) {
      return this.autofixTrend.labels.map((label) => {
        return formatDate(parseISODate(label))
      })
    }
    return []
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

  updateLastDays(newVal: number): void {
    this.lastDays = newVal
    this.$fetch()
  }
}
</script>
