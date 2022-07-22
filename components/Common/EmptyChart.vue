<template>
  <div class="relative h-full rounded-md pointer-events-none">
    <div class="absolute inset-0 z-10 grid mx-auto rounded-md place-content-center">
      <p class="text-sm text-center text-vanilla-400">
        <slot name="subtitle">{{ subtitle }}</slot>
      </p>
    </div>
    <z-chart
      :data-sets="chartData"
      :labels="mockLabels"
      :colors="colors"
      :bar-options="{ stacked: this.chartType === 'bar' && this.stacked }"
      type="axis-mixed"
      class="mx-auto no-filter:opacity-10 blur-chart opacity-60"
    >
    </z-chart>
  </div>
</template>
<script lang="ts">
import { Vue, Prop, Component } from 'nuxt-property-decorator'
import { Dataset } from '~/types/reportTypes'
import { ZChart } from '@deepsourcelabs/zeal'
import { getColorShades } from '~/utils/ui'

const BASE_COLOR = '#1035ad'

/**
 * Component to show empty chart
 */
@Component({
  components: { ZChart }
})
export default class EmptyChart extends Vue {
  @Prop({ default: `Not enough data to show a trend. Please come back later.` })
  subtitle: string

  @Prop({ default: 1 })
  count: number

  @Prop({ default: BASE_COLOR, type: String })
  baseShade: string

  @Prop({ default: 15 })
  length: number

  @Prop({ default: false, type: Boolean })
  stacked: boolean

  @Prop({ default: 'line' })
  chartType: string

  get mockLabels(): Array<string> {
    return Array.from(Array(this.length).keys()).map((idx) => `Label ${idx}`)
  }

  get colors(): string[] {
    if (this.chartType === 'bar' && this.stacked) {
      return getColorShades(this.baseShade, this.count)
    }

    return ['robin', 'cherry', 'honey', 'juniper']
  }

  get chartData(): Dataset[] {
    return Array.from(Array(this.count).keys()).map((idx) => {
      return {
        name: `Random Data #${idx}`,
        values: Array.from({ length: this.length }, () => Math.floor(10 + Math.random() * 100)),
        chartType: this.chartType
      }
    })
  }
}
</script>
<style scoped>
.blur-chart {
  filter: blur(0.5rem);
}
</style>
