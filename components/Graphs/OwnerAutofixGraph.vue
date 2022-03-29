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
    <div class="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
      <graph-legend
        :allowHover="false"
        :showTrends="false"
        :value="currentAutofixCount"
        labelBgClass="bg-robin"
        label="Autofixed issues"
        :loading="isLoading"
      />
    </div>
    <div v-if="isLoading" class="p-4">
      <div style="height: 258px" class="rounded-md bg-ink-300 animate-pulse"></div>
    </div>
    <base-graph
      v-else-if="autofixTrend.values && autofixTrend.values.length"
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

/**
 * Component to show Autofix trends on owner dashboard
 */
@Component({
  components: { BaseGraph }
})
export default class OwnerAutofixGraph extends mixins(OwnerDetailMixin) {
  public lastDays = 30
  public isLoading = true

  @ownerDetailStore.State
  autofixTrend: Trend

  get currentAutofixCount(): number {
    return getLastTwoTrends(this.autofixTrend)[0]
  }

  /**
   * Function to fetch Autofix trend data
   *
   * @returns Promise<void>
   */
  fetchData() {
    return this.fetchAutofixTrends({
      login: this.$route.params.owner,
      provider: this.$route.params.provider,
      lastDays: this.lastDays
    })
  }

  /**
   * Mounted hook
   *
   * @returns {void}
   */
  async mounted(): Promise<void> {
    this.isLoading = true
    await this.fetchData()
    this.isLoading = false
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
}
</script>
