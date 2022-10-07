<template>
  <div
    class="grid grid-cols-1 py-4 border rounded-lg border-ink-200"
    :class="{ 'min-h-96': chartPresent }"
  >
    <div class="flex justify-between gap-4 px-5">
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
@Component({})
export default class ChartContainer extends Vue {
  @Prop({ default: true })
  chartPresent: boolean
}
</script>
