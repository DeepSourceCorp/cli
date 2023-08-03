<template>
  <div
    v-if="trendValue"
    class="cursor space-x-1 rounded-md p-1 text-center text-xs font-normal leading-none"
    :class="[
      customBgClass || bgClass,
      customBgClass ? '' : showBg ? 'bg-opacity-10' : 'bg-opacity-0'
    ]"
  >
    <z-icon
      v-if="icon"
      :icon="icon"
      :color="iconColor"
      :size="iconSize"
      class="inline"
      :class="iconClass"
    />
    <z-icon
      v-else
      :icon="trendDirection === 'up' ? 'triangle-up' : 'triangle-down'"
      :color="iconColor"
      size="x-small"
      class="inline"
      :class="iconClass"
    />
    {{ valueDisplay }} {{ trendHint }}
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { shortenLargeNumber } from '@/utils/string'

/**
 * Ticker component for showing trends.
 */
@Component({
  name: 'Ticker'
})
export default class Ticker extends Vue {
  @Prop({ default: null })
  trendValue: number | string

  @Prop({ default: null })
  trendPositive: boolean

  @Prop({ default: false })
  isPercent: boolean

  @Prop({ default: null })
  trendDirection: string

  @Prop({ default: null })
  icon: string

  @Prop({ default: 'small' })
  iconSize: string

  @Prop({ default: 'pb-0.5' })
  iconClass: string

  @Prop({ default: null })
  trendHint: string

  @Prop({ default: true })
  showBg: boolean

  @Prop({ default: null })
  customBgClass: string | null

  get valueDisplay(): string | number {
    if (typeof this.trendValue === 'number') {
      if (this.isPercent) {
        return `${Math.abs(this.trendValue)}%`
      }
      return shortenLargeNumber(Math.abs(this.trendValue))
    }
    return this.trendValue
  }

  get bgClass(): string {
    if (this.trendPositive === true) {
      return 'bg-juniper text-juniper'
    }

    if (this.trendPositive === false) {
      return 'bg-cherry text-cherry'
    }

    return 'bg-vanilla-300 text-vanilla-100'
  }

  get iconColor(): string {
    if (this.trendPositive === true) {
      return 'juniper'
    }

    if (this.trendPositive === false) {
      return 'cherry'
    }

    return 'vanilla-100'
  }
}
</script>
