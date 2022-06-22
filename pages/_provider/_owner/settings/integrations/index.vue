<template>
  <div class="max-w-4xl p-4 space-y-4">
    <h2 class="text-lg font-medium">Integrations</h2>

    <div v-if="$fetchState.pending" class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div
        v-for="ii in LOADER_COUNT"
        :key="ii"
        class="bg-opacity-50 rounded-md h-36 animate-pulse bg-ink-200"
      ></div>
    </div>

    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <integration-card
        v-for="integration in integrations"
        :key="integration.shortcode"
        v-bind="integration"
        :show-installation-status="true"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { ZButton, ZIcon, ZTag } from '@deepsourcelabs/zeal'
import { Component, mixins } from 'nuxt-property-decorator'

import IntegrationsListMixin from '~/mixins/integrationsListMixin'
import ownerDetailMixin from '~/mixins/ownerDetailMixin'

import { TeamPerms } from '~/types/permTypes'
import { IntegrationSettingsLevel } from '~/types/types'

const LOADER_COUNT = 2

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
export default class Integrations extends mixins(IntegrationsListMixin, ownerDetailMixin) {
  LOADER_COUNT = LOADER_COUNT

  /**
   * The fetch hook
   */
  async fetch() {
    // Fetch all integrations
    const { owner: login, provider } = this.$route.params

    if (!this.owner.id) {
      await this.fetchOwnerID({ login, provider })
    }

    await this.fetchIntegrations({
      level: IntegrationSettingsLevel.Owner,
      ownerId: this.owner.id
    })
  }
}
</script>
