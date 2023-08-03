<template>
  <div>
    <div class="border-b border-b-ink-200 bg-ink-400 px-4">
      <div class="sticky top-0 z-10 mx-auto flex max-w-6xl items-center justify-between py-4">
        <div class="flex items-center gap-x-5">
          <img class="h-5" src="~/assets/images/logo-wordmark-white.svg" alt="DeepSource" />
          <div class="hidden h-5 border-l border-l-ink-200 md:block"></div>
          <span class="hidden text-sm font-medium capitalize md:block"
            >Enterprise Control Panel</span
          >
        </div>
        <z-button
          button-type="secondary"
          icon="feather"
          label="Feedback"
          size="small"
          @click="showFeedbackModal = true"
        />
      </div>
    </div>
    <div class="p-4">
      <div class="mx-auto max-w-6xl">
        <div v-if="!$fetchState.pending" class="flex items-center gap-x-4">
          <div class="h-11 w-11 rounded-sm bg-ink-200">
            <img :src="orgInfo.logo" :alt="orgInfo.name && `${orgInfo.name}'s logo`" />
          </div>
          <h1 class="text-1.5xl font-medium leading-none">{{ orgInfo.name }}</h1>
        </div>
        <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <component
            :is="getCardType(card)"
            v-for="card in CONTROL_PANELS"
            :key="getPageTitle(card.title)"
            :to="card.to || null"
            :href="card.href ? card.href : managementConsoleUrl ? managementConsoleUrl : null"
            :target="card.to ? false : '_blank'"
            :rel="card.to ? false : 'noopener noreferrer'"
            class="cursor-pointer rounded-md border border-slate-400 p-4 hover:bg-ink-300"
          >
            <div class="flex h-12 w-12 items-center justify-center rounded-sm bg-ink-200">
              <z-icon :icon="card.icon" size="large" />
            </div>
            <div class="mt-4">
              <h5 class="text-base font-medium">{{ getPageTitle(card.title) }}</h5>
              <p class="mt-2.5 text-sm text-vanilla-400">
                {{ card.description }}
              </p>
            </div>
          </component>
        </div>
      </div>
    </div>
    <portal to="modal">
      <control-panel-feedback-modal v-if="showFeedbackModal" @close="showFeedbackModal = false" />
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'

import ControlPanelBaseMixin from '~/mixins/control-panel/ControlPanelBaseMixin'

@Component({
  middleware: ['restrictControlPanelAccess'],
  meta: {
    auth: { strict: true }
  }
})
export default class ControlPanelHome extends mixins(ControlPanelBaseMixin) {
  showFeedbackModal = false

  async fetch(): Promise<void> {
    await this.getOrgBaseData()
  }

  getCardType(cardInfo: { href?: string; to?: string }): string {
    if (cardInfo.to) {
      return 'nuxt-link'
    }
    return 'a'
  }
}
</script>
