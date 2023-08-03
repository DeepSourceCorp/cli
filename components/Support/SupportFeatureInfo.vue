<template>
  <div
    class="flex gap-3 rounded-md border border-ink-200 bg-ink-200 bg-opacity-50 pl-4 pt-4 text-vanilla-100"
  >
    <z-icon icon="bulb" color="current" class="flex-shrink-0" />
    <div class="flex flex-grow gap-x-3">
      <div class="pb-4 pr-4">
        <div class="text-xs font-medium leading-4">Request a feature</div>
        <div class="mt-1.5 text-xs leading-6 text-vanilla-400">
          Have something in mind that you want to see in DeepSource or think can improve your
          experience? Submit the idea in our product roadmap.
        </div>
        <a
          href="https://roadmap.deepsource.com"
          target="_blank"
          rel="noopener noreferrer"
          class="auxillary-button mt-4 px-3 py-2 text-xs leading-3"
        >
          <span>Open roadmap</span>
          <z-icon icon="arrow-right" size="x-small" color="current" />
        </a>
      </div>
      <picture class="max-w-picture hidden w-full flex-grow place-self-end md:block">
        <source srcset="~/assets/images/support/request-feature.webp" type="image/webp" />
        <img src="~/assets/images/support/request-feature.png" alt="" />
      </picture>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component({ name: 'SupportFeatureInfo' })
export default class SupportFeatureInfo extends Vue {}
</script>

<style scoped>
.max-w-picture {
  max-width: 154px;
}
</style>
