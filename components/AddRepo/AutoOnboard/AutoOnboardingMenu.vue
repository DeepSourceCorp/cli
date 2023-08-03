<template>
  <section :class="hasAutoOnboardEvents ? 'p-4' : 'px-4'">
    <div v-if="hasAutoOnboardEvents" class="-mx-1 rounded-md border border-slate-400 p-3">
      <div class="flex items-center justify-between" :class="isCollapsed ? 'pb-0' : 'pb-3'">
        <div class="flex items-center space-x-1.5">
          <span class="text-sm font-medium leading-none text-vanilla-300">
            Pending {{ activeProvider === 'gl' ? 'merge' : 'pull' }}-requests
          </span>
          <z-tag
            v-if="openCount || pendingCount"
            bg-color="ink-400 border border-slate-400"
            text-size="xxs"
            spacing="px-2 py-0.5"
            class="font-semibold tracking-wider"
          >
            <template v-if="openCount">{{ openCount }} OPEN</template>
            <template v-if="openCount && pendingCount">·</template>
            <template v-if="pendingCount">{{ pendingCount }} PENDING</template>
          </z-tag>
        </div>
        <button class="focus:outline-none">
          <z-icon
            class="transform duration-150"
            :class="{
              'rotate-180': isCollapsed
            }"
            icon="chevron-up"
            @click="isCollapsed = !isCollapsed"
          />
        </button>
      </div>
      <div v-if="!isCollapsed" class="default-scroll max-h-64 overflow-scroll">
        <transition-group move-class="duration-200 transform" tag="ul" class="space-y-2">
          <li
            v-for="event in sortedEvents"
            :key="event.id"
            class="group flex items-center justify-between rounded-md border border-slate-400 p-1.5 pl-3.5"
          >
            <span class="flex items-center space-x-2 text-vanilla-200 group-hover:text-vanilla-100">
              <z-icon :icon="event.repository.isPrivate ? 'z-lock' : 'globe'" />
              <span class="text-sm leading-none">
                <template v-if="event.repository.owner && event.repository.owner.login">
                  <span class="text-vanilla-400">{{ event.repository.owner.login }}</span> /
                  {{ event.repository.name }}
                </template>
                <template v-else>
                  <span class="text-vanilla-400">{{ activeOwner }}</span> /
                  {{ event.repository.name }}
                </template>
              </span>
            </span>
            <z-button
              v-if="event.status === 'OPEN'"
              size="small"
              :to="event.vcsPrUrl"
              target="_blank"
              button-type="secondary"
              rel="noopener noreferrer"
              icon="external-link"
              >View {{ prText }}-request</z-button
            >
            <z-button
              v-else-if="event.status === 'PEND'"
              size="small"
              button-type="secondary"
              :disabled="true"
              icon-color="vanilla-400 animate-spin"
              icon="spin-loader"
            >
              Creating {{ prText }}-request
            </z-button>
          </li>
        </transition-group>
      </div>
    </div>
    <button-input
      label="Onboard new repositories"
      input-id="onboard-new-repositories"
      button-label="Select template"
      button-type="primary"
      icon="file-plus"
      input-width="x-small"
      @click="$emit('startOnboarding')"
    >
      <template #description>
        Use Auto Onboard to activate DeepSource analysis on multiple repositories.
      </template>
    </button-input>
    <button-input
      label="Update templates"
      input-id="autoonboard-settings"
      button-label="Settings"
      button-type="secondary"
      :to="settingsLink"
      icon="settings"
      input-width="x-small"
    >
      <template #description>Create and edit templates to be used for Auto Onboard.</template>
    </button-input>
  </section>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { RepoCard } from '@/components/AddRepo'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import AutoOnboardMixin from '~/mixins/autoOnboardMixin'

@Component({
  components: {
    RepoCard
  }
})
export default class AutoOnboardingMenu extends mixins(ActiveUserMixin, AutoOnboardMixin) {
  public isCollapsed = false
  public pollingInterval: ReturnType<typeof setInterval>

  mounted() {
    this.$socket.$on('repo-onboarding-completed', () => {
      this.refetchEvents()
    })
    // refetch every 1 minute
    this.pollingInterval = setInterval(this.refetchEvents, 0.5 * 60 * 1000)
  }

  async refetchEvents(): Promise<void> {
    await this.fetchOnboardingEventList({
      login: this.activeOwner,
      provider: this.activeProvider,
      refetch: true
    })

    if (this.autoOnboardEvents.length === 0) {
      clearInterval(this.pollingInterval)
      this.$socket.$off('repo-onboarding-completed')
    }
  }

  beforeDestroy(): void {
    clearInterval(this.pollingInterval)
    this.$socket.$off('repo-onboarding-completed')
  }

  get openCount(): number {
    return this.sortedEvents.filter((event) => event.status === 'OPEN').length
  }

  get pendingCount(): number {
    return this.sortedEvents.filter((event) => event.status === 'PEND').length
  }

  get prText(): string {
    return this.activeProvider === 'gl' ? 'merge' : 'pull'
  }

  get settingsLink(): string {
    return ['', this.activeProvider, this.activeOwner, 'settings', 'auto-onboard'].join('/')
  }
}
</script>
