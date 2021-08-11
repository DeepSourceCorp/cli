<template>
  <z-tab-pane class="h-full flex flex-col">
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
          @search="fetchTemplates"
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
      class="p-4 space-y-3 animate-pulse opacity-50"
    >
      <div class="w-full h-10 bg-ink-200 rounded-md"></div>
      <div class="w-full h-10 bg-ink-200 rounded-md"></div>
      <div class="space-y-2">
        <div v-for="ii in 10" :key="ii" class="w-full h-6 bg-ink-200 rounded-md"></div>
      </div>
    </div>
    <div
      v-else-if="currentStage === stages.SELECT_TEMPLATE"
      class="p-4 space-y-4 animate-pulse opacity-50"
    >
      <div class="w-full h-10 bg-ink-200 rounded-md"></div>
      <div class="w-full h-10 bg-ink-200 rounded-md"></div>
      <div class="space-y-3">
        <div v-for="ii in 3" :key="ii" class="w-full h-20 bg-ink-200 rounded-md"></div>
      </div>
    </div>
    <div v-else class="p-4 space-y-4 animate-pulse opacity-50">
      <div class="w-full h-64 bg-ink-200 rounded-md"></div>
      <div class="w-full h-20 bg-ink-200 rounded-md"></div>
      <div class="w-full h-20 bg-ink-200 rounded-md"></div>
    </div>
  </z-tab-pane>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZInput, ZButton, ZIcon, ZTabPane, ZDivider } from '@deepsourcelabs/zeal'
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
  }
})
export default class AutoOnboardRepos extends mixins(
  ActiveUserMixin,
  AutoOnboardMixin,
  OwnerDetailMixin
) {
  public stages = Stages
  public currentStage = Stages.SELECT_TEMPLATE
  public loadingAutoOnboardData = false

  async fetch(): Promise<void> {
    this.loadingAutoOnboardData = true
    await this.fetchEvents()
    await this.fetchOwnerDetails({
      login: this.activeOwner,
      provider: this.activeProvider,
      refetch: true
    })
    await this.fetchTemplates()
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

  async fetchTemplates(search?: string): Promise<void> {
    search = search ? search : ''

    await this.fetchConfigTemplatesList({
      login: this.activeOwner,
      provider: this.activeProvider,
      limit: 25,
      q: search,
      currentPage: 1
    })
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
}
</script>
