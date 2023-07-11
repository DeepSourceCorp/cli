<template>
  <div>
    <div class="flex flex-wrap items-start gap-x-2 gap-y-4 md:flex-nowrap">
      <div class="flex-grow space-y-1.5">
        <div class="flex min-h-8 items-center gap-x-3">
          <div class="flex items-center gap-x-2">
            <analyzer-logo v-if="!isAggregate" v-bind="analyzerInformation" size="medium" />
            <h1 class="text-lg font-medium leading-tight">
              {{ isAggregate ? metricMeta.name : namespacesTrend.key }}
            </h1>
          </div>
          <z-tag
            v-if="
              (namespacesTrend.threshold || namespacesTrend.threshold === 0) &&
              namespacesTrend.isPassing !== null
            "
            :icon-left="namespacesTrend.isPassing ? 'metric-high' : 'metric-low'"
            :icon-color="namespacesTrend.isPassing ? 'juniper' : 'cherry'"
            size="x-small"
            spacing="px-2 py-0"
            class="border border-slate-400"
          >
            <span
              class="py-1.5 text-xxs font-semibold uppercase leading-none tracking-wider"
              :class="namespacesTrend.isPassing ? 'text-juniper' : 'text-cherry'"
              >{{ namespacesTrend.isPassing ? 'Threshold passing' : 'Threshold failing' }}</span
            >
          </z-tag>
        </div>
        <p v-if="isAggregate" class="text-sm leading-6 text-vanilla-400">
          {{ metricMeta.description }}
        </p>
      </div>
      <div
        v-if="isAggregate"
        class="flex flex-grow flex-wrap items-center justify-between gap-2 md:flex-grow-0 md:flex-nowrap md:justify-start"
      >
        <z-button
          button-type="ghost"
          :to="METRICS_DOC"
          target="_blank"
          rel="noreferrer noopener"
          icon="help-circle"
          size="small"
          color="vanilla-100"
          class="border border-dashed border-slate-400"
          >How’s this calculated?</z-button
        >
        <div class="h-8 md:w-40">
          <z-select
            :key="filterValue"
            v-model="currentFilterValue"
            background-class="bg-ink-200"
            border-class="border-slate-400"
            border-radius="rounded-sm"
            spacing="px-2 py-1"
            placeholder="Duration filter"
            @change="(value) => (currentFilterValue = value)"
          >
            <template #icon>
              <z-icon color="vanilla-400" icon="calendar-clock" class="flex-shrink-0" />
            </template>
            <z-option
              v-for="(opt, index) in dayOptions"
              :key="opt"
              :label="`Last ${displayDayOptions[index]} ${displayDurationType}`"
              :value="opt"
            />
          </z-select>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'nuxt-property-decorator'

import { ZTag, ZSelect, ZOption, ZButton, ZIcon } from '@deepsource/zeal'

import { createDuration, DurationTypeT } from '~/utils/date'
import { StatType, MetricType } from '~/types/metric'
import { formatIntl } from '~/utils/string'
import { Metric, MetricNamespaceTrend } from '~/types/types'

/**
 * Section of a component on metrics page that displays name of a metric namespace, its chart and its values.
 */
@Component({
  name: 'TrendTitle',
  components: {
    ZTag,
    ZSelect,
    ZOption,
    ZButton,
    ZIcon
  },
  methods: {
    formatIntl
  }
})
export default class TrendTitle extends Vue {
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

  public currentFilterValue = 30
  readonly STAT_TYPE = StatType
  readonly AGGREGATE_METRIC_KEY = MetricType.aggregate
  readonly METRICS_DOC =
    'https://docs.deepsource.com/docs/repository-view-metrics#metric-aggregate-calculation'

  /**
   * Created hook for the component.
   *
   * @returns {void}
   */
  created(): void {
    this.currentFilterValue = this.filterValue

    if (process.client) {
      const { provider, owner, repo } = this.$route.params

      this.currentFilterValue =
        Number(this.$localStore.get(`${provider}-${owner}-${repo}`, 'metrics-last-days-filter')) ||
        this.filterValue
    }
  }

  get isAggregate(): boolean {
    return this.namespacesTrend.key === this.AGGREGATE_METRIC_KEY
  }

  get displayDayOptions(): number[] {
    return this.dayOptions.map((dayOption: number) =>
      createDuration(dayOption, 'days').as(this.displayDurationType)
    )
  }

  get analyzerInformation() {
    return {
      shortcode: this.namespacesTrend.analyzerShortcode,
      name: this.namespacesTrend.key,
      analyzerLogo: this.namespacesTrend.analyzerLogo
    }
  }

  /**
   * Emits `updateFilter` event whenever the value of the `currentFilterValue` changes.
   *
   * @param {number} newVal
   * @returns {void}
   */
  @Watch('currentFilterValue')
  updateFilter(newVal: number): void {
    this.$emit('updateFilter', Number(newVal))
  }
}
</script>
