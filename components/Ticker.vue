<template>
  <span
    v-if="trendValue"
    class="bg-opacity-10 rounded-md font-semibold text-xs p-1 leading-none text-center flex items-center space-x-1 cursor"
    :class="bgClass"
  >
    <z-icon v-if="icon" :icon="icon" :color="iconColor" size="small"></z-icon>
    <span class="leading-none"> {{ trendSign }}{{ valueDisplay }} </span>
  </span>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { shortenLargeNumber } from '@/utils/string'
import { ZIcon } from '@deepsourcelabs/zeal'

@Component({
  components: {
    ZIcon
  }
})
export default class CodeQualityGraph extends Vue {
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

  get trendSign(): string {
    if (this.icon) {
      return ''
    }
    if (this.trendDirection === 'up') {
      return '+'
    }

    if (this.trendDirection === 'down') {
      return '-'
    }

    return ''
  }

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
    if (this.trendValue === 0 || this.trendPositive === null) {
      return 'bg-vanilla-300 text-vanilla-100'
    }

    if (this.trendPositive === true) {
      return 'bg-juniper text-juniper'
    }

    if (this.trendPositive === false) {
      return 'bg-cherry text-cherry'
    }

    return 'bg-vanilla-300 text-vanilla-100'
  }

  get iconColor(): string {
    if (this.trendValue === 0 || this.trendPositive === null) {
      return 'vanilla-100'
    }

    if (this.trendPositive === true) {
      return 'juniper'
    }

    if (this.trendPositive === false) {
      return 'cherry'
    }

    return 'vanilla-100'
  }

  public shortenLargeNumber = shortenLargeNumber
}
</script>
