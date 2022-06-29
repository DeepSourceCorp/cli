<template>
  <div class="rounded-lg border border-ink-200 py-4 min-h-96 grid grid-cols-1">
    <div class="flex flex-col-reverse gap-y-4 px-5 md:flex-row">
      <div class="grid grid-cols-repeat-6 gap-10 flex-grow">
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
import { Vue, Component } from 'nuxt-property-decorator'

/**
 * Container component for chart and report stats.
 */
@Component({})
export default class ChartContainer extends Vue {}
</script>
