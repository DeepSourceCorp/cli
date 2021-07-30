<template>
  <div class="flex w-full border rounded-lg border-ink-300 hover:border-ink-200 flex-1">
    <!-- Left Section -->
    <div
      class="w-3/5 sm:w-3/4 md:w-4/5 border-ink-300 px-2 md:px-3.5 py-2 md:py-2.5 flex flex-col space-y-1 sm:space-y-2 justify-evenly"
    >
      <slot name="left"></slot>
    </div>
    <!-- Right Section -->
    <div class="relative w-2/5 sm:w-1/4 md:w-1/5 border-l border-ink-300 p-4">
      <slot name="right"></slot>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
@Component({})
export default class GistCard extends Vue {}
</script>
