<template>
  <div
    :class="[isWidget ? 'rounded-md' : 'rounded-lg', { 'min-h-96': chartPresent }]"
    class="py-4 border border-slate-400"
  >
    <div v-if="$slots['report-header']" class="px-5">
      <slot name="report-header"></slot>
    </div>

    <div
      v-if="$slots['report-stats'] || $slots['report-control']"
      class="flex justify-between gap-4 px-5"
    >
      <div class="flex flex-wrap gap-y-6 gap-x-12">
        <slot name="report-stats"></slot>
      </div>
      <div class="flex-shrink-0">
        <slot name="report-control"></slot>
      </div>
    </div>

    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

/**
 * Container component for chart and report stats.
 */
@Component({ name: 'ChartContainer' })
export default class ChartContainer extends Vue {
  @Prop({ default: true })
  chartPresent: boolean

  @Prop({ default: false })
  isWidget: boolean
}
</script>
