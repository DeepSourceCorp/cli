<template>
  <div class="text-xs h-14 flex flex-col justify-between">
    <p class="text-vanilla-400 mb-2 font-semibold uppercase tracking-wider leading-7">
      {{ title }}
    </p>

    <slot>
      <div v-if="loading" class="h-6 mt-px rounded-sm bg-ink-300 animate-pulse"></div>
      <p v-else class="text-base text-vanilla-100 font-semibold leading-8">{{ value }}</p>
    </slot>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

/**
 * Component to show a stat in ChartContainer
 */
@Component({})
export default class ChartStat extends Vue {
  @Prop({ required: true })
  title: string

  @Prop()
  value: number | string

  @Prop({ default: false })
  loading: boolean
}
</script>
