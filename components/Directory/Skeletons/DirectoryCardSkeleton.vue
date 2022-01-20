<template>
  <div class="flex flex-col border border-ink-200 rounded-md min-h-60 p-4">
    <div class="flex justify-between space-x-2">
      <div
        class="h-15 w-15 flex place-items-center p-2 bg-ink-300 rounded-md flex-shrink-0 animate-pulse"
      ></div>
      <div class="flex-grow flex justify-end space-x-1.5 space-y-1.5">
        <div class="h-6 w-32 bg-ink-300 animate-pulse rounded-full"></div>
      </div>
    </div>
    <h6 class="font-semibold mt-5">
      <div class="h-6 w-52 bg-ink-300 animate-pulse"></div>
    </h6>
    <div class="h-4 w-23 bg-ink-300 animate-pulse mt-1.5"></div>
    <div class="flex-grow"></div>
    <div v-if="isAnalyzer" class="flex mt-4">
      <div class="w-17 mr-2 h-9 bg-ink-300 animate-pulse"></div>
      <div class="w-20 h-9 bg-ink-300 animate-pulse"></div>
    </div>
    <div class="mt-3 flex items-center justify-between text-xxs leading-none py-1">
      <div class="h-5 w-28 bg-ink-300 animate-pulse"></div>
      <div class="h-5 w-9 bg-ink-300 animate-pulse"></div>
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
