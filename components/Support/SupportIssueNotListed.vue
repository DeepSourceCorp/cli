<template>
  <div
    class="flex gap-3 rounded-md border border-ink-200 bg-ink-200 bg-opacity-50 pt-4 pl-4 text-vanilla-100"
  >
    <z-icon icon="alert-circle" color="current" class="flex-shrink-0" />
    <div class="flex flex-grow gap-x-3">
      <div class="pb-4 pr-4">
        <div class="text-xs font-medium leading-4">My issue is not listed</div>
        <div class="mt-1.5 text-xs leading-6 text-vanilla-400">
          You are currently on the
          <span class="rounded-sm bg-ink-200 p-0.5">{{ supportTier }} Support</span> tier which
          covers help from DeepSource team on the listed issues. For all other issues, please create
          a discussion topic at
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://discuss.deepsource.com"
            class="font-medium text-juniper hover:text-juniper-300 focus:text-juniper-300"
            >discuss.deepsource.com</a
          >.
        </div>
        <a
          href="https://discuss.deepsource.com"
          target="_blank"
          rel="noopener noreferrer"
          class="auxillary-button mt-4 px-3 py-2 text-xs leading-3"
        >
          <span>Join the forum</span>
          <z-icon icon="arrow-up-right" size="x-small" color="current" />
        </a>
      </div>
      <picture class="max-w-picture hidden w-full flex-grow place-self-end md:block">
        <source srcset="~/assets/images/support/issue-not-listed.webp" type="image/webp" />
        <img src="~/assets/images/support/issue-not-listed.png" alt="" />
      </picture>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsource/zeal'

@Component({ name: 'SupportIssueNotListed', components: { ZIcon } })
export default class SupportIssueNotListed extends Vue {
  @Prop({ type: String, default: '' })
  supportTier: string
}
</script>

<style scoped>
.max-w-picture {
  max-width: 94px;
}
</style>
