<template>
  <div
    class="flex flex-wrap gap-3 rounded-md border border-ink-200 bg-ink-200 bg-opacity-50 p-4 text-vanilla-100 md:flex-nowrap"
  >
    <div class="flex gap-x-3">
      <z-icon icon="flag" color="current" class="flex-shrink-0" />
      <div class="flex flex-grow flex-col">
        <div class="text-xs font-medium leading-4">Report a false positive</div>
        <div class="mt-1.5 flex-grow text-xs leading-6 text-vanilla-400">
          If you’ve spotted an occurrence of an issue that you believe is invalid, please report it
          directly from the occurrence in the dashboard. Refer to this short tutorial video to see
          how you can do that.
        </div>
        <a
          href="https://docs.deepsource.com/docs/repository-view-issues#reporting-a-false-positive"
          target="_blank"
          rel="noopener noreferrer"
          class="place-se mt-2 inline-flex items-center gap-x-1 text-xs text-vanilla-200 hover:text-vanilla-100 focus:text-vanilla-100"
        >
          <span>Learn more</span>
          <z-icon icon="arrow-right" color="current" size="x-small" />
        </a>
      </div>
    </div>
    <a
      href="https://www.youtube.com/watch?v=Nqyz-HrVLBk"
      target="_blank"
      rel="noopener noreferrer"
      class="fp-img w-full flex-shrink-0 rounded-3px border border-robin border-opacity-10 md:w-52"
    >
      <picture>
        <source srcset="~/assets/images/support/false-positives.webp" type="image/webp" />
        <img
          src="~/assets/images/support/false-positives.png"
          alt="Video on how to report a false positive"
          class="rounded-sm"
        />
      </picture>
    </a>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component({ name: 'SupportFpInfo' })
export default class SupportFpInfo extends Vue {}
</script>
<style scoped>
.fp-img {
  aspect-ratio: 63 / 41;
}
</style>
