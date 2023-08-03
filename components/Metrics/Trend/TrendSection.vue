<template>
  <div class="space-y-8 border-b border-slate-400 py-4" :class="{ 'bg-ink-300': isAggregate }">
    <trend-title v-bind="$props" class="px-6" @updateFilter="updateFilter" />
    <!-- The `grid` class is to prevent the chart lib's height/width computation from overflowing the parent -->
    <div class="grid max-w-full grid-cols-1 gap-y-2">
      <div class="flex flex-wrap gap-9 px-6 sm:gap-x-16">
        <template v-for="(trend, index) in trendStats">
          <z-divider
            v-if="trend.type === 'blocker' && trendStatsLength > 1"
            :key="trend.type + index"
            color="ink-200"
            direction="vertical"
            margin="m-0"
            class="hidden h-full md:block"
          />
          <trend-stat
            v-else-if="trend.show"
            :key="trend.key"
            :type="trend.type"
            :metric="trend.metric"
            :can-modify-threshold="trend.canModifyThreshold"
            :class="{ 'w-full md:w-auto': trend.key === STAT_TYPE.metric }"
            v-on="trend.on"
          />
        </template>
      </div>

      <div v-show="dataLoading" class="mx-5 min-h-72 pb-2 pt-4">
        <div
          class="h-full animate-pulse rounded-lg"
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
        :tooltip-options="{
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

import { DurationTypeT, formatDate, parseISODate } from '~/utils/date'
import { StatType, MetricType, ThresholdType } from '~/types/metric'
import { formatIntl } from '~/utils/string'
import { roundToSignificantNumber } from '~/utils/number'
import { Metric, MetricNamespaceTrend } from '~/types/types'
import { TrendStatProps } from './TrendStat.vue'

interface TrendStatPropsT extends TrendStatProps {
  key: string
  show: boolean
  on: unknown
}

/**
 * Section of a component on metrics page that displays name of a metric namespace, its chart and its values.
 */
@Component({
  name: 'TrendSection',
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
  metricMeta: Pick<
    Metric,
    | 'shortcode'
    | 'name'
    | 'description'
    | 'supportsAggregateThreshold'
    | 'unit'
    | 'newCodeMetricShortcode'
  >

  @Prop({ default: false })
  canModifyThreshold: boolean

  @Prop({ default: false })
  dataLoading: boolean

  readonly STAT_TYPE = StatType
  readonly AGGREGATE_METRIC_KEY = MetricType.aggregate
  readonly METRICS_DOC = 'https://docs.deepsource.com/docs/repository-view-metrics'

  get trendStats() {
    const stats: Array<TrendStatPropsT | { type: 'blocker' }> = [
      {
        key: StatType.metric,
        metric: this.metricTrendStat,
        type: StatType.metric,
        show: true,
        on: false
      },
      { type: 'blocker' },
      {
        key: StatType.threshold + ThresholdType.threshold,
        metric: {
          name: 'Overall threshold',
          shortcode: this.metricMeta.shortcode,
          ...this.thresholdTrendStat
        },
        type: StatType.threshold,
        canModifyThreshold: this.canModifyThreshold,
        show: this.canViewThresholdModal,
        on: this.thresholdListeners(this.namespacesTrend.threshold, 'overall threshold')
      }
    ]

    if (this.newCodeThresholdTrendStat) {
      stats.push({
        key: StatType.threshold + ThresholdType.newCodeThreshold,
        metric: {
          name: 'New code threshold',
          shortcode: this.metricMeta.newCodeMetricShortcode as string,
          ...this.newCodeThresholdTrendStat
        },
        type: StatType.threshold,
        canModifyThreshold: this.canModifyThreshold,
        show: this.canViewThresholdModal,
        on: this.thresholdListeners(this.namespacesTrend.newCodeThreshold, 'new code threshold')
      })
    }

    return stats
  }

  /**
   * ? Get the length of `trendStats` excluding the blockers in it
   */
  get trendStatsLength() {
    return this.trendStats.reduce(
      (total, trendStat) => (trendStat.type !== 'blocker' && trendStat.show ? total + 1 : total),
      0
    )
  }

  get isAggregate() {
    return this.namespacesTrend.key === this.AGGREGATE_METRIC_KEY
  }

  get displayName() {
    return this.isAggregate ? 'Overall aggregate' : this.metricMeta.name ?? ''
  }

  thresholdListeners(
    threshold: MetricNamespaceTrend['threshold'] | MetricNamespaceTrend['newCodeThreshold'],
    thresholdName: string
  ) {
    return {
      ...this.$listeners,
      addThreshold: (shortcode: string) => {
        this.$emit('addThreshold', shortcode, threshold, this.namespacesTrend.key, thresholdName)
      },
      openUpdateThresholdModal: (shortcode: string) => {
        this.$emit(
          'openUpdateThresholdModal',
          shortcode,
          threshold,
          this.namespacesTrend.key,
          thresholdName
        )
      },
      deleteThreshold: (shortcode: string) => {
        this.$emit('deleteThreshold', shortcode, this.namespacesTrend.key)
      }
    }
  }

  get metricTrendStat() {
    return {
      name: this.displayName,
      value: this.namespacesTrend.valueDisplay
    }
  }

  get chartUpdateKey() {
    return (
      this.chartColors[0] +
      this.namespacesTrend.valueTrend.values.length +
      this.namespacesTrend.threshold
    )
  }

  get thresholdTrendStat() {
    return { value: this.namespacesTrend.threshold, unit: this.metricMeta.unit }
  }

  get newCodeThresholdTrendStat() {
    return this.metricMeta.newCodeMetricShortcode
      ? { value: this.namespacesTrend.newCodeThreshold, unit: this.metricMeta.unit }
      : null
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
                label: 'Overall threshold',
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
