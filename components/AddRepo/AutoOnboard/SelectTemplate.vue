<template>
  <section class="flex h-full flex-col space-y-4">
    <div
      v-if="hasAutoOnboardEvents"
      class="flex flex-row items-center border-b border-slate-400 px-4 py-3"
    >
      <z-breadcrumb separator="/" class="text-sm text-vanilla-100">
        <z-breadcrumb-item class="cursor-pointer text-vanilla-400">
          <span @click="$emit('back')">Auto Onboard</span>
        </z-breadcrumb-item>
        <z-breadcrumb-item>All templates</z-breadcrumb-item>
      </z-breadcrumb>
    </div>
    <div class="px-4" :class="hasAutoOnboardEvents ? '' : 'pt-4'">
      <z-input
        v-model="searchCandidate"
        icon="search"
        class="p-2"
        :show-border="false"
        background-color="ink-400"
        placeholder="Search templates..."
        @debounceInput="fetchTemplates"
      >
        <template #left>
          <z-icon icon="search" class="ml-1.5" size="small" />
        </template>
      </z-input>
    </div>
    <div class="flex-grow space-y-2 overflow-scroll px-4 pb-4">
      <template v-if="$fetchState.pending">
        <div
          v-for="index in 3"
          :key="index"
          class="h-20 animate-pulse rounded-md bg-ink-300 opacity-50"
        ></div>
      </template>
      <template v-else-if="currentTemplateList.length">
        <base-card
          v-for="template in currentTemplateList"
          :key="template.shortcode"
          :show-info="false"
          class="cursor-pointer hover:bg-ink-200"
          @click="$emit('selectTemplate', template)"
        >
          <template #title>
            <span class="text-base">{{ template.title }}</span>
          </template>
          <template #description>
            <p class="line-clamp-1 text-sm">
              {{ template.description }}
            </p>
          </template>
        </base-card>
      </template>
      <div v-else-if="searchCandidate" class="grid h-full place-content-center">
        <div class="text-center">
          <h4 class="mb-5 text-base text-vanilla-400">
            Found no templates matching name "{{ searchCandidate }}"
          </h4>
        </div>
      </div>
      <div v-else-if="!$fetchState.pending" class="grid h-full place-content-center">
        <div class="text-center">
          <h4 class="text-base text-vanilla-300">No Auto Onboard templates found.</h4>
          <p class="mb-5 text-sm text-vanilla-400">
            You can create new templates in the Auto Onboard settings.
          </p>
          <nuxt-link :to="settingsLink">
            <z-button size="small" icon="settings" @click="optionallyCloseModal">
              Open settings
            </z-button>
          </nuxt-link>
        </div>
      </div>
    </div>
  </section>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import AutoOnboardMixin from '~/mixins/autoOnboardMixin'
import { ConfigTemplate } from '../../../types/types'
import { resolveNodes } from '~/utils/array'

@Component({})
export default class SelectTemplate extends mixins(ActiveUserMixin, AutoOnboardMixin) {
  public currentTemplateList: ConfigTemplate[] = []
  public searchCandidate = ''

  async fetch(): Promise<void> {
    await this.fetchTemplates()
  }

  async fetchTemplates(): Promise<void> {
    const connection = await this.fetchConfigTemplatesList({
      login: this.activeOwner,
      provider: this.activeProvider,
      limit: 25,
      q: this.searchCandidate,
      currentPage: 1,
      refetch: true
    })

    this.currentTemplateList = resolveNodes(connection)
  }

  get settingsLink(): string {
    return ['', this.activeProvider, this.activeOwner, 'settings', 'auto-onboard'].join('/')
  }

  get onAutoOnboardPage(): boolean {
    return this.$route.path === this.settingsLink
  }

  optionallyCloseModal(): void {
    if (this.onAutoOnboardPage) this.$emit('close')
  }
}
</script>
