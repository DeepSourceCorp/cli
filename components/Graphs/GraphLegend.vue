<template>
  <div
    class="rounded-md bg-ink-300 px-4 py-3"
    :class="{
      'opacity-50': !isActive,
      'cursor-pointer': allowHover
    }"
    @click="$emit('toggle')"
  >
    <div class="flex items-center space-x-2">
      <div v-if="loading" class="my-2 h-10 w-15 animate-pulse rounded-md bg-ink-300"></div>
      <span v-else-if="!Number.isNaN(value)" class="text-2.5xl font-medium">
        {{ shortenLargeNumber(value) }}
      </span>
      <ticker
        v-if="showTrends && isFinite(trendValue)"
        :trend-hint="trendHint"
        :trend-direction="trendDirection"
        :trend-value="trendValue"
        :is-percent="isPercent"
        :trend-positive="trendPositive"
      />
    </div>

    <div class="ml-px flex items-center space-x-2 text-sm">
      <div class="h-2 w-2 rounded-full" :class="labelBgClass"></div>
      <span class="text-vanilla-400">{{ label }}</span>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { shortenLargeNumber } from '@/utils/string'
import Ticker from '~/components/Common/Ticker.vue'

/**
 * Component to show current value and increment/decrement trend
 */
@Component({
  components: {
    Ticker
  },
  methods: {
    shortenLargeNumber
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
