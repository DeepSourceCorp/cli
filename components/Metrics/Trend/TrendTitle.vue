<template>
  <div>
    <div class="flex flex-wrap md:flex-nowrap items-start gap-x-2 gap-y-4">
      <div class="flex-grow space-y-1.5">
        <div class="flex items-center gap-x-3 min-h-8">
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
            class="border border-ink-200"
          >
            <span
              class="font-semibold text-xxs uppercase tracking-wider leading-none py-1.5"
              :class="namespacesTrend.isPassing ? 'text-juniper' : 'text-cherry'"
              >{{ namespacesTrend.isPassing ? 'Threshold passing' : 'Threshold failing' }}</span
            >
          </z-tag>
        </div>
        <p v-if="isAggregate" class="text-vanilla-400 text-sm leading-6">
          {{ metricMeta.description }}
        </p>
      </div>
      <div
        v-if="isAggregate"
        class="flex items-center gap-2 justify-between md:justify-start flex-grow md:flex-grow-0 flex-wrap md:flex-nowrap"
      >
        <z-button
          button-type="ghost"
          :to="METRICS_DOC"
          target="_blank"
          rel="noreferrer noopener"
          icon="help-circle"
          size="small"
          color="vanilla-100"
          class="border border-ink-100 border-dashed"
          >How’s this calculated?</z-button
        >
        <div class="md:w-40 h-8">
          <z-select
            v-model="currentFilterValue"
            :key="filterValue"
            backgroundClass="bg-ink-200"
            borderClass="border-ink-200"
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
            ></z-option>
          </z-select>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'nuxt-property-decorator'

import { ZTag, ZSelect, ZOption, ZButton, ZIcon } from '@deepsourcelabs/zeal'

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

  public currentFilterValue: number = 30
  readonly STAT_TYPE = StatType
  readonly AGGREGATE_METRIC_KEY = MetricType.aggregate
  readonly METRICS_DOC =
    'https://deepsource.io/docs/dashboard/repo-overview/#metric-aggregate-calculation'

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
