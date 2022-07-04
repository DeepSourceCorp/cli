<template>
  <div class="grid grid-cols-1 py-4 border rounded-lg border-ink-200 min-h-96">
    <div class="flex flex-col-reverse px-5 gap-y-4 md:flex-row">
      <div class="grid flex-grow gap-10 grid-cols-repeat-8">
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
