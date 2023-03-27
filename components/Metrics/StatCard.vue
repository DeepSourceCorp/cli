<template>
  <transition :appear="withTransition" :name="withTransition ? 'flash' : ''">
    <component
      :is="to ? 'nuxt-link' : 'div'"
      :to="to"
      class="flex flex-col justify-between flex-grow space-y-5"
      :class="{ 'bg-ink-300 rounded-md min-h-26 p-5': !removeStyles }"
    >
      <div class="flex flex-row justify-between space-x-2">
        <div class="text-sm leading-6 flex items-start space-x-1.5">
          <!-- <div v-if="color" class="flex w-1 h-3.5 mt-0.5 rounded-full" :class="`bg-${color}`"></div> -->
          <slot name="title">
            <h5 class="font-medium text-vanilla-100">
              {{ title }}
            </h5>
          </slot>
        </div>
        <div class="flex-shrink-0">
          <template v-if="icon">
            <z-icon
              v-if="isIconShortcode"
              :icon="icon"
              size="medium"
              color="transparent"
              class="float-right p-px"
            />
            <analyzer-logo v-else v-bind="icon" size="medium" />
          </template>
        </div>
      </div>
      <div class="flex flex-row space-x-2">
        <div class="flex items-center space-x-2">
          <span class="text-1.5xl font-medium tracking-snug text-vanilla-100">
            <slot> {{ value }} </slot>
          </span>
          <div class="space-y-1">
            <slot name="info">
              <ticker
                v-if="trendValue"
                v-tooltip="hintAsTooltip ? trendHint : ''"
                class="hidden md:flex"
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
          <span class="font-semibold text-xxs uppercase tracking-wider" :class="`text-${color}`">{{
            thresholdLabel
          }}</span>
        </z-tag>
      </div>
    </component>
  </transition>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZTag } from '@deepsource/zeal'
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
