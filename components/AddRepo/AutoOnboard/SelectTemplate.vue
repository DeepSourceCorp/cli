<template>
  <section class="flex flex-col space-y-4 h-full">
    <div
      v-if="hasAutoOnboardEvents"
      class="px-4 py-3 border-b border-ink-200 flex flex-row items-center"
    >
      <z-breadcrumb separator="/" class="text-sm text-vanilla-100">
        <z-breadcrumb-item class="text-vanilla-400 cursor-pointer">
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
        :showBorder="false"
        backgroundColor="ink-400"
        @debounceInput="search"
        placeholder="Search templates..."
      >
        <template slot="left">
          <z-icon icon="search" class="ml-1.5" size="small"></z-icon>
        </template>
      </z-input>
    </div>
    <div class="overflow-scroll flex-grow space-y-2 px-4 pb-4">
      <template v-if="templatesLoading">
        <div
          v-for="index in 3"
          :key="index"
          class="h-20 bg-ink-300 animate-pulse opacity-50 rounded-md"
        ></div>
      </template>
      <template v-else-if="configTemplateList.length">
        <base-card
          v-for="template in configTemplateList"
          :showInfo="false"
          class="cursor-pointer hover:bg-ink-200"
          :key="template.shortcode"
          @click="$emit('selectTemplate', template)"
        >
          <template slot="title">
            <span class="text-base">{{ template.title }}</span>
          </template>
          <template slot="description">
            <p class="line-clamp-1 text-sm">
              {{ template.description }}
            </p>
          </template>
        </base-card>
      </template>
      <div class="grid place-content-center h-full" v-else-if="searchCandidate">
        <div class="text-center">
          <h4 class="text-vanilla-400 text-base mb-5">
            Found no repositories matching name "{{ searchCandidate }}"
          </h4>
        </div>
      </div>
      <div class="grid place-content-center h-full" v-else-if="!templatesLoading">
        <div class="text-center">
          <h4 class="text-vanilla-300 text-base">No AutoOnbard templates found.</h4>
          <p class="text-vanilla-400 text-sm mb-5">
            You can create new templates in the Auto Onboard settings.
          </p>
          <nuxt-link :to="settingsLink">
            <z-button size="small" icon="settings">Open settings</z-button>
          </nuxt-link>
        </div>
      </div>
    </div>
  </section>
</template>
<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import {
  ZInput,
  ZButton,
  ZIcon,
  ZTabPane,
  ZBreadcrumb,
  ZBreadcrumbItem
} from '@deepsourcelabs/zeal'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import AutoOnboardMixin from '~/mixins/autoOnboardMixin'

@Component({
  components: {
    ZInput,
    ZButton,
    ZIcon,
    ZTabPane,
    ZBreadcrumb,
    ZBreadcrumbItem
  }
})
export default class SelectTemplate extends mixins(ActiveUserMixin, AutoOnboardMixin) {
  // make this default
  public searchCandidate = ''
  hasRunningAutoOnboards(): boolean {
    return false
  }

  search(newVal: string) {
    this.searchCandidate = newVal
    this.$emit('search', newVal)
  }

  get settingsLink(): string {
    return ['', this.activeProvider, this.activeOwner, 'settings', 'auto-onboard'].join('/')
  }
}
</script>
