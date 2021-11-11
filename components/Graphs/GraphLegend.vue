<template>
  <div
    class="px-2 rounded-md"
    :class="{
      'opacity-50': !isActive,
      'hover:bg-ink-300 cursor-pointer': allowHover
    }"
    @click="$emit('toggle')"
  >
    <div class="flex items-center space-x-2">
      <div v-if="loading" class="h-10 my-2 w-15 bg-ink-300 rounded-md animate-pulse"></div>
      <z-animated-integer
        v-else-if="!Number.isNaN(value)"
        class="text-2.5xl font-medium"
        :format="shortenLargeNumber"
        :value="value"
      />
      <ticker
        v-if="showTrends && isFinite(trendValue)"
        :trendHint="trendHint"
        :trendDirection="trendDirection"
        :trendValue="trendValue"
        :isPercent="isPercent"
        :trendPositive="trendPositive"
      />
    </div>

    <div class="flex items-center ml-px space-x-2 text-sm">
      <div class="w-2 h-2 rounded-full" :class="labelBgClass"></div>
      <span class="text-vanilla-400">{{ label }}</span>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZAnimatedInteger } from '@deepsourcelabs/zeal'
import { shortenLargeNumber } from '@/utils/string'
import Ticker from '@/components/Ticker.vue'

@Component({
  components: {
    ZAnimatedInteger,
    Ticker
  }
})
export default class GraphLegend extends Vue {
  @Prop({ default: true })
  isActive: boolean

  @Prop({ default: true })
  allowHover: boolean

  @Prop({ required: true })
  value: number

  @Prop({ required: true })
  label: number

  @Prop({ default: true })
  showTrends: boolean

  @Prop({ default: 'bg-vanilla-400' })
  labelBgClass: string

  @Prop({ default: null })
  trendValue: number

  @Prop({ default: false })
  isPercent: boolean

  @Prop({ required: false })
  trendPositive: boolean

  @Prop({ required: false })
  trendDirection: string

  @Prop({ default: '' })
  trendHint: string

  @Prop({ default: false })
  loading: boolean

  public shortenLargeNumber = shortenLargeNumber

  get tooltipText(): string {
    if (this.trendHint) {
      return this.trendHint
    }

    if (this.trendDirection === 'up') {
      return `Increased by ${this.trendValue}${this.isPercent ? '%' : ''} since yesterday`
    }

    return `Decreased by ${Math.abs(this.trendValue)}${this.isPercent ? '%' : ''} since yesterday`
  }
}
</script>
