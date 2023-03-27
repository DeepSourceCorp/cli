<template>
  <div class="flex space-x-2">
    <div class="flex-grow h-8 lg:flex-grow-0 lg:w-56">
      <z-select
        v-model="currentFilterValue"
        background-class="bg-ink-300"
        border-class="border-slate-400"
      >
        <template #icon>
          <z-icon color="vanilla-400" icon="calendar-clock" />
        </template>
        <z-option
          v-for="(opt, index) in dayOptions"
          :key="opt"
          :label="`Last ${displayDayOptions[index]} ${displayDurationType}`"
          :value="opt"
        />
      </z-select>
    </div>
    <div v-if="allowChartTypeToggle" class="flex space-x-2">
      <div
        :class="currentChartType == 'bar' ? 'bg-ink-200' : 'hover:bg-ink-300'"
        class="flex items-center justify-center w-8 h-8 rounded-sm cursor-pointer"
        @click="toggleChart('bar')"
      >
        <z-icon
          icon="bar-chart-2"
          size="small"
          :color="currentChartType == 'bar' ? 'juniper' : 'vanilla-400'"
        />
      </div>
      <div
        :class="currentChartType == 'line' ? 'bg-ink-200' : 'hover:bg-ink-300'"
        class="flex items-center justify-center w-8 h-8 cursor-pointer rounded-s"
        @click="toggleChart('line')"
      >
        <z-icon
          icon="trending-up"
          size="small"
          :color="currentChartType == 'line' ? 'juniper' : 'vanilla-400'"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'nuxt-property-decorator'
import { ZIcon, ZDivider, ZChart, ZSelect, ZOption } from '@deepsource/zeal'

import { createDuration, DurationTypeT } from '~/utils/date'

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

  @Prop({ default: DurationTypeT.days })
  displayDurationType: DurationTypeT

  public currentFilterValue: number = 30
  public currentChartType: string = 'line'

  created() {
    this.currentFilterValue = this.filterValue
    this.currentChartType = this.chartType
  }

  get displayDayOptions(): number[] {
    return this.dayOptions.map((dayOption: number) =>
      createDuration(dayOption, 'days').as(this.displayDurationType)
    )
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
