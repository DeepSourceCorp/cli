<template>
  <div class="flex space-x-2">
    <div class="h-8 flex-grow lg:w-56 lg:flex-grow-0">
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
        class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm"
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
        class="rounded-s flex h-8 w-8 cursor-pointer items-center justify-center"
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
import { createDuration, DurationTypeT } from '~/utils/date'

@Component({
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

  public currentFilterValue = 30
  public currentChartType = 'line'

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
