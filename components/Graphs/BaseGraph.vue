<template>
  <div class="grid grid-cols-1 min-h-40 col-span-full">
    <z-chart
      :data-sets="datasets"
      :height="chartHeight"
      :labels="labels"
      :colors="colors"
      :type="chartType"
      :tooltip-options="{
        formatTooltipY: formatIntl
      }"
      :axis-options="axisOptions"
      :line-options="lineOptions"
      :bar-options="barOptions"
      :y-axis-min="0"
      ref="base-graph-chart"
      class="flex-grow md:mx-auto"
    />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZChart } from '@deepsource/zeal'
import { formatIntl } from '@/utils/string'

@Component({
  components: {
    ZChart
  },
  methods: {
    formatIntl
  },
  layout: 'repository'
})
export default class BaseGraph extends Vue {
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

  @Prop({ default: ['robin-500'] })
  colors: Array<string>

  @Prop({ default: true })
  xIsSeries: boolean

  @Prop({ default: () => {} })
  barOptions: Object

  public chartType = ''
  public selectedMetric = ''

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
  }

  get chartHeight(): number {
    return this.height
  }
}
</script>
