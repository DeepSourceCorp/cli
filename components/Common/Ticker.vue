<template>
  <div
    v-if="trendValue"
    class="p-1 space-x-1 text-xs font-normal leading-none text-center rounded-md cursor"
    :class="[
      customBgClass || bgClass,
      customBgClass ? '' : showBg ? 'bg-opacity-10' : 'bg-opacity-0'
    ]"
  >
    <z-icon v-if="icon" :icon="icon" :color="iconColor" class="inline" :class="iconClass"></z-icon>
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
import { ZIcon } from '@deepsourcelabs/zeal'

/**
 * Ticker component for showing trends.
 */
@Component({
  components: {
    ZIcon
  },
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
