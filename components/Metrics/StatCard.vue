<template>
  <component
    :is="to ? 'nuxt-link' : 'div'"
    :to="to"
    class="flex flex-col justify-between flex-grow space-y-2"
    :class="{ 'bg-ink-300 rounded-md min-h-26': !removeStyles }"
  >
    <div class="flex flex-row justify-between pt-3 pr-4 space-x-2" :class="color ? 'pl-2' : 'pl-4'">
      <div class="text-sm leading-6 flex items-start space-x-1.5">
        <div v-if="color" class="flex w-1 h-3.5 mt-0.5 rounded-full" :class="`bg-${color}`"></div>
        <slot name="title">
          <h5 class="font-medium text-vanilla-100">
            {{ title }}
            <span class="font-normal text-vanilla-400" v-if="subtitle"> / {{ subtitle }}</span>
          </h5>
        </slot>
      </div>
      <div class="flex-shrink-0">
        <z-icon
          v-if="icon"
          class="float-right p-px"
          :icon="icon"
          size="medium"
          color="transparent"
        ></z-icon>
      </div>
    </div>
    <div class="flex items-center px-4 pb-3 space-x-2">
      <span class="text-xl font-bold leading-none text-vanilla-100">
        <slot> {{ value }} </slot>
      </span>
      <div class="space-y-1">
        <slot name="info">
          <ticker
            class="hidden md:flex"
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
  </component>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsourcelabs/zeal'
import Ticker from '@/components/Ticker.vue'

@Component({
  components: {
    ZIcon,
    Ticker
  }
})
export default class StatCard extends Vue {
  @Prop()
  icon!: string

  @Prop()
  value!: string

  @Prop()
  title!: string

  @Prop({ default: null })
  trendValue!: number

  @Prop({ default: null })
  trendIcon!: string

  @Prop({ default: null })
  subtitle!: string

  @Prop({ default: null })
  trendDirection!: string

  @Prop({ default: null })
  trendHint!: number

  @Prop({ default: null })
  trendPositive!: boolean

  @Prop({ default: null })
  color!: string

  @Prop({ default: false })
  removeStyles!: boolean

  @Prop({ default: null })
  to!: string

  @Prop({ default: true })
  hintAsTooltip!: boolean
}
</script>
