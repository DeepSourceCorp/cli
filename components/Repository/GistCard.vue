<template>
  <div class="flex w-full flex-1 rounded-lg border border-slate-400 hover:border-slate-400">
    <!-- Left Section -->
    <div
      class="flex w-3/5 flex-col justify-evenly space-y-1 border-slate-400 px-2 py-2 sm:w-3/4 sm:space-y-2 md:w-4/5 md:px-3.5 md:py-2.5"
    >
      <slot name="left"></slot>
    </div>
    <!-- Right Section -->
    <div class="relative w-2/5 border-l border-slate-400 p-4 sm:w-1/4 md:w-1/5">
      <slot name="right"></slot>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
@Component({})
export default class GistCard extends Vue {}
</script>
