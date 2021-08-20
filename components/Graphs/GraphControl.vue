<template>
  <div class="flex space-x-2">
    <div class="flex-grow lg:flex-grow-0 lg:w-56 h-8">
      <z-select
        v-model="currentFilterValue"
        backgroundClass="bg-ink-300"
        borderClass="border-ink-300"
      >
        <z-option
          v-for="opt in dayOptions"
          :key="opt"
          :label="`Last ${opt} Days`"
          :value="opt"
        ></z-option>
      </z-select>
    </div>
    <div class="flex space-x-2" v-if="allowChartTypeToggle">
      <div
        :class="currentChartType == 'bar' ? 'bg-ink-200' : 'hover:bg-ink-300'"
        @click="toggleChart('bar')"
        class="h-8 w-8 flex items-center justify-center rounded-sm cursor-pointer"
      >
        <z-icon
          icon="bar-chart-2"
          size="small"
          :color="currentChartType == 'bar' ? 'juniper' : 'vanilla-400'"
        ></z-icon>
      </div>
      <div
        :class="currentChartType == 'line' ? 'bg-ink-200' : 'hover:bg-ink-300'"
        @click="toggleChart('line')"
        class="h-8 w-8 flex items-center justify-center rounded-s cursor-pointer"
      >
        <z-icon
          icon="trending-up"
          size="small"
          :color="currentChartType == 'line' ? 'juniper' : 'vanilla-400'"
        ></z-icon>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'nuxt-property-decorator'
import { ZIcon, ZDivider, ZChart, ZSelect, ZOption } from '@deepsourcelabs/zeal'

@Component({
  components: {
    ZIcon,
    ZDivider,
    ZChart,
    ZSelect,
    ZOption
  },
  layout: 'repository'
})
export default class GraphControl extends Vue {
  @Prop({ default: 30 })
  filterValue: number

  @Prop({ default: false })
  allowChartTypeToggle: boolean

  @Prop({ default: () => [30, 60, 90] })
  dayOptions: number[]

  @Prop({ default: 'line' })
  chartType: string

  public currentFilterValue: number = 30
  public currentChartType: string = 'line'

  created() {
    this.currentFilterValue = this.filterValue
    this.currentChartType = this.chartType
  }

  @Watch('currentFilterValue')
  updateFilter(newVal: number) {
    this.$emit('updateFilter', Number(newVal))
  }

  toggleChart(newVal: string) {
    this.currentChartType = newVal
    this.$emit('updateChartType', newVal)
  }
}
</script>
