<template>
  <div class="p-4">
    <h1 class="text-lg font-medium">Add-ons</h1>
    <div class="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="addOn in LIST_OF_ADDONS"
        :key="addOn.name"
        class="
          flex flex-col
          justify-between
          p-4
          border
          rounded-md
          border-ink-200
          bg-ink-300
          min-h-36
        "
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center justify-center w-12 h-12 rounded-sm bg-ink-200">
            <z-icon
              :icon="addOn.icon"
              size="large"
              :class="{ 'opacity-60': addOn.icon === 'add-ons' }"
            />
          </div>
          <div class="flex items-center gap-x-1.5">
            <z-tag
              v-if="addOn.isNew"
              bg-color="robin"
              text-size="xxs"
              size="x-small"
              spacing="px-2.5 py-1.5"
              class="font-semibold leading-none tracking-wide uppercase text-vanilla-100"
              >New</z-tag
            >
            <z-tag
              :bg-color="statusBgColorMap[addOn.status]"
              text-size="xxs"
              size="x-small"
              spacing="px-2.5 py-1.5"
            >
              <span
                class="flex items-center justify-center gap-x-2"
                :class="[statusTextColorMap[addOn.status]]"
              >
                <z-icon :icon="statusIconMap[addOn.status]" size="x-small" color="current" />
                <span class="font-semibold leading-none tracking-wide uppercase">{{
                  addOn.status
                }}</span>
              </span>
            </z-tag>
          </div>
        </div>
        <div class="mt-4">
          <h5 class="text-base font-medium">{{ addOn.name }}</h5>
          <p class="mt-2.5 text-xs text-vanilla-400">{{ addOn.description }}</p>
        </div>
      </div>
    </div>
    <div
      class="
        flex flex-col
        items-center
        p-4
        mt-4
        border
        rounded-md
        gap-x-4 gap-y-6
        md:flex-row
        border-ink-200
      "
    >
      <div class="flex-grow text-center md:text-left">
        <h2 class="font-medium">Need more add-ons?</h2>
        <p class="text-sm text-vanilla-400 mt-2.5 max-w-md">
          To enable additional add-ons, please contact DeepSource Enterprise Support.
        </p>
        <z-button
          icon="feather"
          size="small"
          label="Contact DeepSource"
          :to="`mailto:${$config.supportEmail}`"
          class="mt-6"
        />
      </div>
      <img role="presentation" src="~/assets/images/ui-states/server-error.svg" class="w-48" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZButton, ZTag } from '@deepsourcelabs/zeal'

import ControlPanelBaseMixin from '~/mixins/control-panel/ControlPanelBaseMixin'

enum statusList {
  comingSoon = 'Coming soon',
  enabled = 'Enabled',
  disabled = 'Disabled'
}

@Component({
  components: { ZIcon, ZButton, ZTag },
  layout: 'control-panel'
})
export default class AddOnsHome extends mixins(ControlPanelBaseMixin) {
  statusBgColorMap = {
    [statusList.comingSoon]: 'honey',
    [statusList.enabled]: 'juniper',
    [statusList.disabled]: 'ink-300'
  }

  statusTextColorMap = {
    [statusList.comingSoon]: 'text-ink-400',
    [statusList.enabled]: 'text-ink-400',
    [statusList.disabled]: 'text-vanilla-400'
  }

  statusIconMap = {
    [statusList.comingSoon]: 'clock',
    [statusList.enabled]: 'check',
    [statusList.disabled]: 'slash'
  }

  LIST_OF_ADDONS = [
    {
      name: 'Macros',
      description: 'Define your custom analyzers on DeepSource.',
      icon: 'macros',
      isNew: false,
      status: statusList.comingSoon
    },
    {
      name: 'Advanced reporting',
      description: 'Use advanced reporting tools to report data.',
      icon: 'document-layout-left',
      isNew: false,
      status: statusList.comingSoon
    }
  ]
}
</script>
