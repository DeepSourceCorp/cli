<template>
  <div class="space-y-6 py-6 border-b border-slate-400" :class="{ 'bg-ink-300': isAggregate }">
    <trend-title v-bind="$props" @updateFilter="updateFilter" class="px-6" />
    <!-- The `grid` class is to prevent the chart lib's height/width computation from overflowing the parent -->
    <div class="grid grid-cols-1 max-w-full gap-y-1">
      <div class="flex gap-x-9 sm:gap-x-23 px-6">
        <trend-stat :type="STAT_TYPE.metric" :metric="metricTrendStat" />
        <trend-stat
          v-if="canViewThresholdModal"
          v-on="thresholdListeners"
          :type="STAT_TYPE.threshold"
          :metric="thresholdTrendStat"
          :can-modify-threshold="canModifyThreshold"
        />
      </div>

      <div v-show="dataLoading" class="min-h-72 mx-5 pt-4 pb-2">
        <div
          class="h-full rounded-lg animate-pulse"
          :class="isAggregate ? 'bg-ink-200 bg-opacity-30' : 'bg-ink-300'"
        ></div>
      </div>

      <z-chart
        v-show="!dataLoading"
        v-bind="graphData"
        :key="chartUpdateKey"
        :height="288"
        :colors="chartColors"
        :type="chartType"
        :tooltipOptions="{
          formatTooltipY: formatIntl
        }"
        :axis-options="{
          xIsSeries: true
        }"
        :y-axis-max="maxClip"
        :y-axis-min="clip ? 0 : null"
        class="min-h-72"
        :class="{ 'aggregate-chart': isAggregate }"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { ZTag, ZSelect, ZOption, ZButton, ZChart, ZIcon } from '@deepsource/zeal'

import { DurationTypeT, formatDate, parseISODate } from '~/utils/date'
import { StatType, MetricType } from '~/types/metric'
import { formatIntl } from '~/utils/string'
import { roundToSignificantNumber } from '~/utils/number'
import { Metric, MetricNamespaceTrend } from '~/types/types'

/**
 * Section of a component on metrics page that displays name of a metric namespace, its chart and its values.
 */
@Component({
  name: 'TrendSection',
  components: {
    ZTag,
    ZSelect,
    ZOption,
    ZButton,
    ZChart,
    ZIcon
  },
  methods: {
    formatIntl
  }
})
export default class TrendSection extends Vue {
  @Prop({ default: 30 })
  filterValue: number

  @Prop({ default: () => [30, 60, 90] })
  dayOptions: number[]

  @Prop({ default: 'line' })
  chartType: string

  @Prop({ default: DurationTypeT.days })
  displayDurationType: DurationTypeT

  @Prop({ default: false })
  clip: boolean

  @Prop({ required: true })
  namespacesTrend: MetricNamespaceTrend

  @Prop({ required: true })
  metricMeta: {
    shortcode?: Metric['shortcode']
    name?: Metric['name']
    description?: Metric['description']
    supportsAggregateThreshold?: Metric['supportsAggregateThreshold']
    unit: Metric['unit']
  }

  @Prop({ default: false })
  canModifyThreshold: boolean

  @Prop({ default: false })
  dataLoading: boolean

  readonly STAT_TYPE = StatType
  readonly AGGREGATE_METRIC_KEY = MetricType.aggregate
  readonly METRICS_DOC = 'https://deepsource.io/docs/dashboard/repo-overview#the-metrics-tab'

  get isAggregate(): boolean {
    return this.namespacesTrend.key === this.AGGREGATE_METRIC_KEY
  }

  get displayName(): string {
    return this.isAggregate ? 'Aggregate' : this.metricMeta.name ?? ''
  }

  get thresholdListeners() {
    return {
      ...this.$listeners,
      addThreshold: () => {
        this.$emit('addThreshold', this.namespacesTrend)
      },
      openUpdateThresholdModal: () => {
        this.$emit('openUpdateThresholdModal', this.namespacesTrend)
      },
      deleteThreshold: () => {
        this.$emit('deleteThreshold', this.namespacesTrend)
      }
    }
  }

  get metricTrendStat() {
    return {
      name: this.displayName,
      value: this.namespacesTrend.valueDisplay
    }
  }

  get thresholdTrendStat() {
    return { value: this.namespacesTrend.threshold, unit: this.metricMeta.unit }
  }

  get graphData(): Record<string, Array<string | number | unknown> | undefined> {
    return {
      labels: this.namespacesTrend.valueTrend.labels.map((label: string | number) =>
        formatDate(parseISODate(label))
      ),
      dataSets: [
        {
          name: this.displayName,
          values: this.namespacesTrend.valueTrend.values
        }
      ],
      yMarkers:
        this.namespacesTrend.threshold || this.namespacesTrend.threshold === 0
          ? [
              {
                label: 'Threshold',
                value: this.namespacesTrend.threshold,
                options: { labelPos: 'right', stroke: 'vanilla-400', lineType: 'dashed' }
              }
            ]
          : []
    }
  }

  get chartColors() {
    return this.namespacesTrend.threshold || this.namespacesTrend.threshold === 0
      ? this.namespacesTrend.isPassing
        ? ['juniper-500']
        : ['cherry-500']
      : ['robin-500']
  }

  get isUnitPercentage() {
    //? Clip max if the unit is defined, assuming it to be a %
    return Boolean(this.metricMeta.unit)
  }

  get maxDigitInGraph() {
    return Math.max(...this.namespacesTrend.valueTrend.values)
  }

  get maxClip() {
    if (this.isUnitPercentage) {
      return 100
    }

    return this.chartType === 'line' ? this.maxLineClip : this.maxBarClip
  }

  get maxLineClip() {
    const exaggeratedMax = this.maxDigitInGraph * 1.25
    return roundToSignificantNumber(exaggeratedMax, exaggeratedMax.toString().length - 1)
  }

  get maxBarClip() {
    return roundToSignificantNumber(
      this.maxDigitInGraph,
      this.maxDigitInGraph.toString().length - 1
    )
  }

  get chartUpdateKey() {
    return this.chartColors[0] + this.namespacesTrend.valueTrend.values.length
  }

  get canViewThresholdModal(): boolean {
    return Boolean(
      (this.thresholdTrendStat.value ||
        this.thresholdTrendStat.value === 0 ||
        this.canModifyThreshold) &&
        (!this.isAggregate || this.metricMeta.supportsAggregateThreshold)
    )
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

<style scoped lang="postcss">
.aggregate-chart {
  --chart-axis-color: theme('colors.ink.200');
}
</style>
