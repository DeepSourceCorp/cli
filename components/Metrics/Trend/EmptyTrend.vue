<template>
  <div class="space-y-4 border-b border-slate-400 px-6 py-4" :class="{ 'bg-ink-300': isAggregate }">
    <trend-title v-bind="$props" @updateFilter="updateFilter" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { DurationTypeT } from '~/utils/date'
import { Metric, MetricNamespaceTrend } from '~/types/types'
import { MetricType } from '~/types/metric'

/**
 * Empty state for section of a component on metrics page that displays name of a metric namespace, its chart and its values.
 */
@Component({
  name: 'EmptyTrend'
})
export default class EmptyTrend extends Vue {
  @Prop({ default: 30 })
  filterValue: number

  @Prop({ default: () => [30, 60, 90] })
  dayOptions: number[]

  @Prop({ default: DurationTypeT.days })
  displayDurationType: DurationTypeT

  @Prop({ required: true })
  namespacesTrend: MetricNamespaceTrend

  @Prop({ required: true })
  metricMeta: {
    shortcode?: Metric['shortcode']
    name?: Metric['name']
    description?: Metric['description']
    supportsAggregateThreshold?: Metric['supportsAggregateThreshold']
  }

  readonly AGGREGATE_METRIC_KEY = MetricType.aggregate

  get isAggregate(): boolean {
    return this.namespacesTrend.key === this.AGGREGATE_METRIC_KEY
  }

  /**
   * Emitter for filter value from TrendTitle.
   *
   * @param {Number} newValue - Value to emit
   *
   * @returns {void}
   */
  updateFilter(newValue: Number): void {
    this.$emit('updateFilter', newValue)
  }
}
</script>
