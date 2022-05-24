<template>
  <div class="max-w-4xl p-4 space-y-4">
    <h2 class="text-lg font-medium">Integrations</h2>

    <div v-if="$fetchState.pending" class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div class="h-32 bg-opacity-50 rounded-md animate-pulse bg-ink-200"></div>
    </div>

    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div v-for="integration in integrations" :key="integration.shortcode">
        <integration-card v-bind="integration" :show-installation-status="true" />
      </div>
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
