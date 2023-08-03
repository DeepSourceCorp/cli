<template>
  <div class="flex min-h-60 flex-col rounded-md border border-slate-400 p-4">
    <div class="flex justify-between space-x-2">
      <div
        class="flex h-15 w-15 flex-shrink-0 animate-pulse place-items-center rounded-md bg-ink-300 p-2"
      ></div>
      <div class="flex flex-grow justify-end space-x-1.5 space-y-1.5">
        <div class="h-6 w-32 animate-pulse rounded-full bg-ink-300"></div>
      </div>
    </div>
    <h6 class="mt-5 font-semibold">
      <div class="h-6 w-52 animate-pulse bg-ink-300"></div>
    </h6>
    <div class="mt-1.5 h-4 w-23 animate-pulse bg-ink-300"></div>
    <div class="flex-grow"></div>
    <div v-if="isAnalyzer" class="mt-4 flex">
      <div class="mr-2 h-9 w-17 animate-pulse bg-ink-300"></div>
      <div class="h-9 w-20 animate-pulse bg-ink-300"></div>
    </div>
    <div class="mt-3 flex items-center justify-between py-1 text-xxs leading-none">
      <div class="h-5 w-28 animate-pulse bg-ink-300"></div>
      <div class="h-5 w-9 animate-pulse bg-ink-300"></div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component({
  name: 'DirectoryCardSkeleton'
})
export default class DirectoryCardSkeleton extends Vue {
  @Prop({ default: 'analyzer' })
  type!: string

  get isAnalyzer(): boolean {
    return this.type === 'analyzer'
  }
}
</script>
