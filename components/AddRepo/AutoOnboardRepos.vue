<template>
  <z-tab-pane class="flex h-full flex-col">
    <template v-if="!loadingAutoOnboardData">
      <install-autofix-for-auto-onboard v-if="!owner.isAutofixEnabled" @refetch="refetch" />
      <template v-else>
        <auto-onboarding-menu
          v-if="currentStage === stages.TOP_MENU"
          @startOnboarding="currentStage = stages.SELECT_TEMPLATE"
        />
        <select-template
          v-else-if="currentStage === stages.SELECT_TEMPLATE"
          @back="currentStage = stages.TOP_MENU"
          @selectTemplate="selectTemplate"
          @close="closeModal"
        />
        <select-repo-to-onboard
          v-else-if="currentStage === stages.SELECT_REPO"
          @back="resetTemplate"
          @backToStart="startOver"
          @onboardingTriggered="onboardingTriggered"
        />
      </template>
    </template>
    <div
      v-else-if="currentStage === stages.SELECT_REPO"
      class="animate-pulse space-y-3 p-4 opacity-50"
    >
      <div class="h-10 w-full rounded-md bg-ink-200"></div>
      <div class="h-10 w-full rounded-md bg-ink-200"></div>
      <div class="space-y-2">
        <div v-for="ii in 10" :key="ii" class="h-6 w-full rounded-md bg-ink-200"></div>
      </div>
    </div>
    <div
      v-else-if="currentStage === stages.SELECT_TEMPLATE"
      class="animate-pulse space-y-4 p-4 opacity-50"
    >
      <div class="h-10 w-full rounded-md bg-ink-200"></div>
      <div class="h-10 w-full rounded-md bg-ink-200"></div>
      <div class="space-y-3">
        <div v-for="ii in 3" :key="ii" class="h-20 w-full rounded-md bg-ink-200"></div>
      </div>
    </div>
    <div v-else class="animate-pulse space-y-4 p-4 opacity-50">
      <div class="h-64 w-full rounded-md bg-ink-200"></div>
      <div class="h-20 w-full rounded-md bg-ink-200"></div>
      <div class="h-20 w-full rounded-md bg-ink-200"></div>
    </div>
  </z-tab-pane>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZInput, ZButton, ZIcon, ZTabPane, ZDivider } from '@deepsource/zeal'
import { RepoCard } from '@/components/AddRepo'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import AutoOnboardMixin from '~/mixins/autoOnboardMixin'
import { ConfigTemplate } from '~/types/types'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'

export enum Stages {
  INSTALL_AUTOFIX,
  TOP_MENU,
  SELECT_TEMPLATE,
  SELECT_REPO
}

@Component({
  components: {
    ZInput,
    ZButton,
    ZIcon,
    ZTabPane,
    ZDivider,
    RepoCard
  },
  name: 'AutoOnboardRepos'
})
export default class AutoOnboardRepos extends mixins(
  ActiveUserMixin,
  AutoOnboardMixin,
  OwnerDetailMixin
) {
  public stages = Stages
  public currentStage = Stages.SELECT_TEMPLATE
  public loadingAutoOnboardData = false

  /**
   * Mounted hook for Vue component
   *
   * @returns {void}
   */
  mounted(): void {
    this.$socket.$on('vcs-installed-repos-updated', this.refetchAppConfig)
  }

  /**
   * The fetch hook
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    this.loadingAutoOnboardData = true
    await Promise.all([
      this.fetchEvents(),
      this.fetchOwnerDetails({
        login: this.activeOwner,
        provider: this.activeProvider,
        refetch: true
      }),
      this.fetchAppConfig({
        login: this.activeOwner,
        provider: this.activeProvider,
        refetch: true
      })
    ])
    this.setPage()
    this.loadingAutoOnboardData = false
  }

  async refetch(): Promise<void> {
    this.loadingAutoOnboardData = true
    await this.fetchOwnerDetails({
      login: this.activeOwner,
      provider: this.activeProvider,
      refetch: true
    })
    this.setPage()
    this.loadingAutoOnboardData = false
  }

  /**
   * Method to refetch app configuration
   *
   * @returns {Promise<void>}
   */
  async refetchAppConfig(): Promise<void> {
    await this.fetchAppConfig({
      login: this.activeOwner,
      provider: this.activeProvider,
      refetch: true
    })
  }

  setPage(): void {
    if (this.sortedEvents.length !== 0) {
      this.currentStage = Stages.TOP_MENU
    }

    if (this.selectedTemplate) {
      this.currentStage = Stages.SELECT_REPO
    }
  }

  created() {
    this.setPage()
  }

  async fetchEvents(refetch?: boolean): Promise<void> {
    await this.fetchOnboardingEventList({
      login: this.activeOwner,
      provider: this.activeProvider,
      refetch
    })
  }

  async onboardingTriggered(): Promise<void> {
    this.selectTemplateToOnboard(undefined)
    this.currentStage = Stages.TOP_MENU
    await this.fetchEvents(true)
  }

  selectTemplate(config: ConfigTemplate) {
    this.selectTemplateToOnboard(config)
    this.currentStage = Stages.SELECT_REPO
  }

  resetTemplate() {
    this.selectTemplateToOnboard(undefined)
    this.currentStage = Stages.SELECT_TEMPLATE
  }

  startOver() {
    this.selectTemplateToOnboard(undefined)
    this.currentStage = Stages.TOP_MENU
  }

  closeModal() {
    this.$emit('close')
  }

  /**
   * beforeDestroy hook for Vue component
   *
   * @returns {void}
   */
  beforeDestroy(): void {
    this.$socket.$off('vcs-installed-repos-updated', this.refetchAppConfig)
  }
}
</script>
