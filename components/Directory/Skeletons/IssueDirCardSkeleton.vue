<template>
  <div class="rounded-md border border-slate-400 px-4 py-3">
    <div>
      <div class="w-5/6 h-6 bg-ink-300 animate-pulse"></div>
      <div class="flex space-x-5 mt-4">
        <div class="h-4 w-16 bg-ink-300 animate-pulse"></div>
        <div class="h-4 w-16 bg-ink-300 animate-pulse"></div>
      </div>
      <div class="mt-4 h-17 w-full bg-ink-300 animate-pulse"></div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component({
  name: 'IssueDirCardSkeleton'
})
export default class IssueDirCardSkeleton extends Vue {}
</script>
