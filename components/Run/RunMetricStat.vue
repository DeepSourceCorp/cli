<template>
  <div class="py-4 px-3 grid content-between" :class="{ aggregate: isMetricAggregate }">
    <div v-if="isMetricAggregate" class="flex items-center justify-between w-full">
      <div class="flex items-center gap-x-2 w-full justify-between">
        <div class="flex items-center gap-x-2">
          <z-icon icon="aggregate" />
          <span class="leading-normal text-sm text-vanilla-100">Aggregate</span>
        </div>
        <div class="flex items-center gap-x-2">
          <ticker
            v-if="metric.valueTrendDisplay"
            v-tooltip="tooltipText"
            :trend-value="trendDisplay"
            :trend-positive="trendPositive"
            :is-percent="trendIsPercent"
            :trend-direction="trendDirection"
            custom-bg-class="bg-ink-100"
            :class="[trendPositive ? 'text-juniper' : 'text-cherry']"
          />
          <span class="stat-value font-semibold leading-snug text-vanilla-100">
            {{ metric.valueDisplay }}</span
          >
        </div>
      </div>
    </div>
    <div v-else class="space-y-4">
      <div class="flex justify-between">
        <div class="flex items-center gap-x-2 leading-normal text-sm text-vanilla-100">
          <lazy-analyzer-logo
            :name="metric.namespace.key"
            :shortcode="metric.namespace.analyzer_shortcode"
            :analyzer-logo="metric.namespace.analyzer_logo"
          />
          {{ metric.namespace.key }}
        </div>

        <div class="flex items-center gap-x-2">
          <ticker
            v-if="metric.valueTrendDisplay"
            v-tooltip="tooltipText"
            :trend-value="trendDisplay"
            :trend-positive="trendPositive"
            :is-percent="trendIsPercent"
            :trend-direction="trendDirection"
            custom-bg-class="bg-ink-100"
            :class="[trendPositive ? 'text-juniper' : 'text-cherry']"
          />
          <span class="stat-value font-semibold leading-snug text-vanilla-100">
            {{ metric.valueDisplay }}</span
          >
        </div>
      </div>
      <div
        v-if="metricThresholdRelation || showMetricSuppressButton"
        class="flex w-full gap-x-2 justify-between"
      >
        <div v-if="metricThresholdRelation" class="flex items-center justify-between w-full">
          <div
            v-if="metric.isSuppressed"
            class="inline-flex items-center space-x-2 px-2 rounded-md justify-evenly text-vanilla-100 bg-ink-100"
          >
            <z-icon icon="minus-circle" size="x-small" />
            <span
              class="font-semibold text-xxs uppercase tracking-wider leading-none py-1.5 text-vanilla-400"
              >{{ metricThresholdRelation }}</span
            >
          </div>
          <div
            v-else
            class="inline-flex items-center space-x-2 px-2 rounded-md justify-evenly text-vanilla-100 bg-ink-100"
          >
            <z-icon
              :icon="metricThresholdRelationIcon"
              :color="metric.isPassing ? 'juniper' : 'cherry'"
              size="x-small"
            />
            <span
              class="font-semibold text-xxs uppercase tracking-wider leading-none py-1.5"
              :class="metric.isPassing ? 'text-juniper' : 'text-cherry'"
              >{{ metricThresholdRelation }}</span
            >
          </div>
        </div>
        <button
          v-if="showMetricSuppressButton"
          class="flex items-center gap-x-1 pl-3 pr-2 text-xs text-vanilla-400 rounded-md cursor-pointer bg-ink-100 hover:bg-ink-50 border border-ink-50"
          @click="$emit('confirmMetricSuppression', metric)"
        >
          <z-icon icon="minus-circle" size="x-small" />
          Suppress
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { ZIcon, ZTag, ZButton } from '@deepsourcelabs/zeal'
import { RepositoryMetricValue } from '~/types/types'
import { MetricType } from '~/types/metric'

enum VALUE_STATE {
  ABOVE = 'Above threshold',
  BELOW = 'Below threshold',
  MEETS = 'Meets threshold'
}

const ICON_VALUE_STATE = {
  [VALUE_STATE.ABOVE]: 'metric-high',
  [VALUE_STATE.BELOW]: 'metric-low',
  [VALUE_STATE.MEETS]: 'metric-medium'
}
/**
 * Renders the card for a single `RepositoryMetricValue` within a grouped set of metrics with `RunMetricCard`
 * Includes the metric's namespace or aggregagte label, value, trend, threshold and indicator / button to suppress the metric
 */
@Component({
  components: {
    ZIcon,
    ZTag,
    ZButton
  }
})
export default class RunMetricStat extends Vue {
  @Prop({ required: true })
  metric: RepositoryMetricValue

  @Prop({ default: false })
  isInModal: boolean

  @Prop({ default: '' })
  tooltipText: string

  @Prop({ default: false })
  canSuppressMetric: boolean

  get trendDisplay(): string {
    return this.metric.valueTrendDisplay?.split(' ')?.[1] ?? ''
  }

  get trendDirection(): string {
    return this.metric.valueTrendDisplay?.split(' ')?.[0]?.toLowerCase() || ''
  }

  get trendPositive(): boolean {
    return this.metric.valueTrendDisplay?.split(' ')?.[0]?.toLowerCase() === 'up'
  }

  get trendIsPercent(): boolean {
    return this.metric.valueTrendDisplay?.includes('%') || false
  }

  get metricThresholdRelation(): VALUE_STATE | '' {
    if (
      this.metric.value !== null &&
      this.metric.value !== undefined &&
      this.metric.threshold !== null &&
      this.metric.threshold !== undefined
    ) {
      if (this.metric.value === this.metric.threshold) {
        return VALUE_STATE.MEETS
      }
      if (this.metric.value > this.metric.threshold) {
        return VALUE_STATE.ABOVE
      }
      return VALUE_STATE.BELOW
    }
    return ''
  }

  get metricThresholdRelationIcon(): string {
    return this.metricThresholdRelation ? ICON_VALUE_STATE[this.metricThresholdRelation] : ''
  }

  get isMetricAggregate(): boolean {
    return this.metric.namespace.key === MetricType.aggregate
  }

  get showMetricSuppressButton(): boolean {
    return (
      this.canSuppressMetric &&
      this.metric.isPassing === false &&
      !this.metric.isSuppressed &&
      !this.isInModal
    )
  }
}
</script>

<style scoped>
.aggregate {
  background-color: #1d2023;
}

.stat-value {
  font-size: 18px;
}
</style>
