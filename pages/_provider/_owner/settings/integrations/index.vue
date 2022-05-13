<template>
  <div class="max-w-4xl p-4 space-y-4">
    <h2 class="text-lg font-medium">Integrations</h2>

    <div v-if="$fetchState.pending" class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div class="h-32 bg-opacity-50 rounded-md animate-pulse bg-ink-200"></div>
    </div>

    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <nuxt-link
        v-for="integration in integrations"
        :key="integration.shortcode"
        :to="$generateRoute(['settings', 'integrations', integration.shortcode])"
        class="flex flex-col p-4 text-left rounded-md bg-ink-300 hover:bg-ink-200"
      >
        <div class="mb-4 space-y-2">
          <div class="flex gap-x-3">
            <img :src="integration.logo" alt="logo" class="flex-shrink-0 w-5 h-5 mt-0.5" />
            <h2 class="text-base font-medium text-vanilla-100">
              {{ integration.name }}
            </h2>
          </div>
          <p class="mr-3 text-xs leading-6 text-vanilla-400 integration-description">
            {{ getIntegrationDescription(integration.shortcode) }}
          </p>
        </div>

        <div class="mt-auto">
          <z-tag
            :bg-color="integration.installed ? 'juniper' : 'ink-200'"
            :icon-color="integration.installed ? 'ink-50' : ''"
            :icon-left="integration.installed ? 'check' : ''"
            size="x-small"
            spacing="py-1 px-2"
            text-size="xxs"
            ><span
              class="font-semibold"
              :class="[integration.installed ? 'text-ink-50' : 'text-vanilla-400']"
            >
              {{ integration.installed ? 'INSTALLED' : 'NOT INSTALLED' }}
            </span></z-tag
          >
        </div>
      </nuxt-link>
    </div>
  </div>
</template>

<script lang="ts">
import { ZButton, ZIcon, ZTag } from '@deepsourcelabs/zeal'
import { Component, mixins } from 'nuxt-property-decorator'

import integrationsListMixin from '~/mixins/integrationsListMixin'
import ownerDetailMixin from '~/mixins/ownerDetailMixin'

import { TeamPerms } from '~/types/permTypes'
import { IntegrationSettingsLevel } from '~/types/types'

/**
 * All integrations page
 */
@Component({
  components: {
    ZButton,
    ZIcon,
    ZTag
  },
  middleware: ['perm', 'teamOnly'],
  meta: {
    auth: {
      strict: true,
      teamPerms: [TeamPerms.MANAGE_INTEGRATIONS]
    }
  },
  layout: 'dashboard'
})
export default class Integrations extends mixins(integrationsListMixin, ownerDetailMixin) {
  /**
   * The fetch hook
   */
  async fetch() {
    // Fetch all integrations
    await this.fetchIntegrations({
      level: IntegrationSettingsLevel.Owner,
      ownerId: this.owner.id
    })
  }
}
</script>
