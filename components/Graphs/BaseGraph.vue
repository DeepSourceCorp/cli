<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
    <div v-if="title" class="col-span-full">
      <div class="text-xs tracking-wide uppercase text-vanilla-400 w-44">{{ title }}</div>
    </div>
    <div v-if="hasMetrics" class="col-span-full hidden lg:block lg:col-span-1 space-y-2">
      <div
        v-for="metric in metrics"
        :key="metric.name"
        @click="toggleMetric(metric.name)"
        :class="selectedMetric == metric.name ? 'bg-ink-200' : 'cursor-pointer hover:bg-ink-300'"
        class="flex flex-col p-2 space-y-2 rounded-md"
      >
        <div class="flex flex-row items-end justify-between flex-grow">
          <h5 class="text-sm overflow-ellipsis">{{ metric.title }}</h5>
          <div
            v-if="selectedMetric !== metric.name"
            :class="`space-y-1 text-sm text-right text-${metric.color}`"
          >
            {{ metric.value }}%
          </div>
        </div>
        <div v-if="selectedMetric == metric.name" class="flex flex-row items-end justify-between">
          <span class="text-2xl leading-none font-extralight"> {{ metric.value }}% </span>
          <div :class="`space-y-1 text-xs text-right text-${metric.color}`">
            {{ metric.value > metric.threshold ? 'Above' : 'Below' }} threshold of
            {{ metric.threshold }}%
          </div>
        </div>
      </div>
    </div>
    <div class="min-h-40" :class="hasMetrics ? 'lg:col-span-3' : 'col-span-full'">
      <z-chart
        class="flex-grow md:mx-auto"
        :dataSets="datasets"
        :height="chartHeight"
        :labels="labels"
        :colors="colors"
        :type="chartType"
        :tooltipOptions="{
          formatTooltipY: formatIntl
        }"
        :showLegend="false"
        :axisOptions="axisOptions"
        :lineOptions="lineOptions"
      ></z-chart>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZDivider, ZChart, ZSelect, ZOption } from '@deepsourcelabs/zeal'
import GraphControl from './GraphControl.vue'
import { formatIntl } from '@/utils/string'

@Component({
  components: {
    ZIcon,
    ZDivider,
    ZChart,
    ZSelect,
    ZOption,
    GraphControl
  },
  layout: 'repository'
})
export default class BaseGraph extends Vue {
  @Prop({ default: '' })
  title: string

  @Prop({ default: () => [] })
  datasets: Array<Record<string, string>>

  @Prop({ default: '' })
  labels: Array<string>

  @Prop({ default: 'line' })
  type: string

  @Prop({ default: 280 })
  height: number

  @Prop({ default: true })
  spline: boolean

  @Prop({ default: () => [] })
  metrics: Array<Record<string, string>>

  @Prop({ default: ['robin'] })
  colors: Array<string>

  @Prop({ default: true })
  xIsSeries: boolean

  public chartType = ''
  public selectedMetric = ''
  public formatIntl = formatIntl

  get axisOptions(): Record<string, string | boolean> {
    return {
      xIsSeries: this.xIsSeries
    }
  }

  get lineOptions(): Record<string, number | boolean> {
    return {
      regionFill: 1
    }
  }

  created(): void {
    this.chartType = this.type
    if (this.hasMetrics) this.selectedMetric = this.metrics[0].name
  }

  get hasMetrics(): boolean {
    return this.metrics && this.metrics.length > 0
  }

  get chartHeight(): number {
    return this.height
  }

  toggleMetric(name: string): void {
    if (this.selectedMetric === name) return
    this.selectedMetric = name
    this.$emit('metricUpdate', name)
  }
}
</script>
