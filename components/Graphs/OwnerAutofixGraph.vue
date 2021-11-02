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
        class="float-right w-full h-8 xl:w-auto"
        :filterValue="lastDays"
        @updateFilter="updateLastDays"
      ></graph-control>
    </template>
    <div class="grid grid-cols-1 gap-5 p-4 -ml-2 md:grid-cols-2">
      <graph-legend
        :allowHover="false"
        :showTrends="false"
        :value="currentAutofixCount"
        labelBgClass="bg-robin"
        label="Autofixed issues"
      />
    </div>
    <base-graph
      v-if="autofixTrend.values && autofixTrend.values.length"
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
import { Component, namespace, mixins } from 'nuxt-property-decorator'
import { formatDate, parseISODate } from '@/utils/date'
import BaseGraph from './BaseGraph.vue'
import { getLastTwoTrends } from '~/utils/array'

import { Trend } from '~/store/owner/detail'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'

const ownerDetailStore = namespace('owner/detail')

@Component({
  components: { BaseGraph }
})
export default class OwnerAutofixGraph extends mixins(OwnerDetailMixin) {
  public lastDays = 30

  @ownerDetailStore.State
  autofixTrend: Trend

  get currentAutofixCount(): number {
    return getLastTwoTrends(this.autofixTrend)[0]
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
