<template>
  <div class="rounded-md border border-slate-400 px-4 py-3">
    <div>
      <div class="h-6 w-5/6 animate-pulse bg-ink-300"></div>
      <div class="mt-4 flex space-x-5">
        <div class="h-4 w-16 animate-pulse bg-ink-300"></div>
        <div class="h-4 w-16 animate-pulse bg-ink-300"></div>
      </div>
      <div class="mt-4 h-17 w-full animate-pulse bg-ink-300"></div>
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
