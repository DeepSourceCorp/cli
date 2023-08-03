<template>
  <nuxt-link
    :to="$generateRoute(['settings', 'integrations', shortcode])"
    class="group flex flex-col rounded-md bg-ink-300 p-4 text-left hover:bg-ink-200"
  >
    <div class="space-y-2" :class="{ 'mb-3': showInstallationStatus }">
      <div class="flex gap-x-3">
        <img :src="logo" alt="logo" class="mt-0.5 h-5 w-5 flex-shrink-0" />
        <h2 class="text-base font-medium text-vanilla-100">
          {{ name }}
        </h2>
      </div>
      <p class="integration-description mr-3 text-xs leading-6 text-vanilla-400">
        {{ getIntegrationDescription(shortcode) }}
      </p>
    </div>

    <div v-if="showInstallationStatus" class="mt-auto">
      <z-tag
        :bg-color="installed ? 'juniper' : 'ink-200 group-hover:bg-ink-100'"
        spacing="py-1 px-2"
        size="x-small"
        text-size="xxs"
      >
        <div class="flex items-center space-x-1.5">
          <z-icon v-if="installed" icon="check" color="ink-50" size="x-small" class="stroke-3" />
          <z-icon v-else icon="circle-dashed" color="vanilla-400" size="x-small" />
          <span
            class="font-semibold leading-none tracking-wide"
            :class="[installed ? 'text-ink-50' : 'text-vanilla-400']"
          >
            {{ installed ? 'INSTALLED' : 'NOT INSTALLED' }}
          </span>
        </div>
      </z-tag>
    </div>
  </nuxt-link>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { IntegrationShortcodes } from '~/mixins/integrationsDetailMixin'

@Component({
  name: 'IntegrationCard'
})

/**
 * Component that renders the integration cards in the list view
 */
export default class IntegrationCard extends Vue {
  @Prop({ required: true })
  shortcode: IntegrationShortcodes

  @Prop({ required: true })
  logo: string

  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  installed: boolean

  @Prop({ default: false })
  showInstallationStatus: boolean

  /**
   * Method to fetch description corresponding to the given integration
   *
   * @param {IntegrationShortcodes} shortcode
   * @returns {void}
   */
  getIntegrationDescription(shortcode: IntegrationShortcodes): string {
    const descriptionMap = {
      [IntegrationShortcodes.SLACK]: 'Send event alerts to your channels.',
      [IntegrationShortcodes.JIRA]: 'Create issues from DeepSource to Jira Cloud.',
      [IntegrationShortcodes.VANTA]: 'Send code vulnerability data to Vanta.'
    } as Record<IntegrationShortcodes, string>

    return descriptionMap[shortcode]
  }
}
</script>
