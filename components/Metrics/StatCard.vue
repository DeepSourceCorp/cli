<template>
  <transition :appear="withTransition" :name="withTransition ? 'flash' : ''">
    <component
      :is="to ? 'nuxt-link' : 'div'"
      :to="to"
      class="flex flex-grow flex-col justify-between space-y-5"
      :class="{ 'min-h-26 rounded-md bg-ink-300 p-5': !removeStyles }"
    >
      <div class="flex flex-row justify-between space-x-2">
        <div class="flex items-start space-x-1.5 text-sm leading-6">
          <slot name="title">
            <h5 class="font-medium text-vanilla-100">
              {{ title }}
            </h5>
          </slot>
        </div>

        <slot name="icon">
          <div v-if="icon" class="flex-shrink-0">
            <z-icon
              v-if="isIconShortcode"
              :icon="icon"
              size="medium"
              color="transparent"
              class="float-right p-px"
            />
            <analyzer-logo v-else v-bind="icon" size="medium" />
          </div>
        </slot>
      </div>
      <div class="flex flex-row space-x-2">
        <div class="flex items-center space-x-2">
          <span class="font-medium tracking-snug text-vanilla-100" :class="valueTextSize">
            <slot> {{ value }} </slot>
          </span>

          <div class="space-y-1">
            <slot name="info">
              <ticker
                v-if="trendValue"
                v-tooltip="hintAsTooltip ? trendHint : ''"
                :icon="trendIcon"
                :trend-direction="trendDirection"
                :trend-hint="hintAsTooltip ? '' : trendHint"
                :trend-positive="trendPositive"
                :trend-value="trendValue"
              />
            </slot>
          </div>
        </div>
        <z-tag v-if="isPassing !== null" class="border border-slate-400">
          <z-icon :icon="isPassing ? 'metric-high' : 'metric-low'" :color="color" />
          <span class="text-xxs font-semibold uppercase tracking-wider" :class="`text-${color}`">{{
            thresholdLabel
          }}</span>
        </z-tag>
      </div>
    </component>
  </transition>
</template>
<script lang="ts">
import { ZIcon, ZTag } from '@deepsource/zeal'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import Ticker from '~/components/Common/Ticker.vue'
import { Analyzer } from '~/types/types'

@Component({
  components: {
    ZIcon,
    ZTag,
    Ticker
  }
})
export default class StatCard extends Vue {
  @Prop()
  icon: string | Analyzer

  @Prop()
  value!: string

  @Prop()
  title!: string

  @Prop({ default: null })
  trendValue!: number

  @Prop({ default: null })
  trendIcon!: string

  @Prop({ default: null })
  trendDirection!: string

  @Prop({ default: null })
  trendHint!: number

  @Prop({ default: null })
  trendPositive!: boolean

  @Prop({ default: false })
  removeStyles!: boolean

  @Prop({ default: null })
  to!: string

  @Prop({ default: true })
  hintAsTooltip!: boolean

  @Prop({ default: false })
  withTransition!: boolean

  @Prop({ default: null })
  isPassing: boolean | null

  @Prop({ default: null })
  threshold: number | null

  @Prop({ default: 'text-1.5xl', validator: (val: string) => val.startsWith('text-') })
  valueTextSize: string

  get color(): string {
    return this.isPassing === false ? 'cherry' : 'juniper'
  }

  get thresholdLabel(): string {
    return `${this.isPassing ? 'Above' : 'Below'} ${
      this.threshold !== null ? this.threshold + '%' : 'threshold'
    }`
  }

  get isIconShortcode() {
    return typeof this.icon === 'string'
  }
}
</script>

<style scoped lang="postcss">
.flash-leave-active {
  transition: background-color 0.5s ease-in-out, transform 0.5s ease;
}
.flash-enter-active {
  transition: background-color 0.5s ease-in-out, transform 0.5s ease;
  transition-delay: 0.5s;
}
.flash-enter,
.flash-leave-to {
  @apply bg-cherry-500 bg-opacity-10;
}
.flash-enter-to,
.flash-leave {
  @apply bg-ink-300;
}
</style>
