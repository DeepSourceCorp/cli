<template>
  <div
    class="rounded-md px-2"
    :class="{
      'opacity-50': !isActive,
      'hover:bg-ink-300 cursor-pointer': allowHover
    }"
    @click="$emit('toggle')"
  >
    <div class="flex items-center space-x-2">
      <z-animated-integer
        v-if="!Number.isNaN(value)"
        class="text-2.5xl font-medium"
        :format="shortenLargeNumber"
        :value="value"
      ></z-animated-integer>
      <div v-else>0</div>
      <ticker
        v-if="showTrends"
        :trendDirection="trendDirection"
        :trendValue="trendValue"
        :isPercent="isPercent"
        :trendPositive="trendPositive"
      />
    </div>

    <div class="text-sm flex space-x-2 items-center ml-px">
      <div class="h-2 w-2 rounded-full" :class="labelBgClass"></div>
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

  public shortenLargeNumber = shortenLargeNumber
}
</script>
