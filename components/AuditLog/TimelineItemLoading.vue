<template>
  <div class="space-y-4">
    <div class="h-3 w-full animate-pulse rounded-full bg-ink-200"></div>

    <div class="flex items-center gap-x-4">
      <div class="h-3 w-22 animate-pulse rounded-full bg-ink-200"></div>

      <div v-for="ii in 3" :key="ii" class="flex items-center justify-center gap-x-1">
        <div class="h-3 w-4 animate-pulse rounded-full bg-ink-200"></div>
        <div class="h-3 w-16 animate-pulse rounded-full bg-ink-200"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component({ name: 'TimelineItemLoading' })
export default class TimelineItemLoading extends Vue {}
</script>
