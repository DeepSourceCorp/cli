<template>
  <div class="p-4 space-y-4 md:max-w-2xl">
    <div class="inline-flex gap-x-2">
      <h2 class="text-lg font-medium">Integrations</h2>

      <div class="inline-flex items-center">
        <z-tag
          bg-color="ink-200"
          text-size="xxs"
          spacing="px-2 py-1"
          class="font-semibold leading-none tracking-wider text-current uppercase text-vanilla-100"
        >
          Beta
        </z-tag>
      </div>
    </div>

    <empty-state
      v-if="!$fetchState.pending && !integrations.length"
      title="No integrations installed"
      subtitle="You can install them from organization settings"
      class="border border-dashed rounded-lg border-ink-200"
    >
      <nuxt-link :to="$generateRoute(['settings', 'integrations'], false)" slot="action">
        <z-button size="small">
          <div class="inline-flex gap-x-2">
            <span>Go to organization settings</span>
            <z-icon color="current-color" icon="arrow-right" class="place-self-center" />
          </div>
        </z-button>
      </nuxt-link>
    </empty-state>

    <template v-else>
      <!-- Loading state -->
      <div v-if="$fetchState.pending" class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="bg-opacity-50 rounded-md h-22 md:h-26 animate-pulse bg-ink-200"></div>
      </div>

      <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div v-for="integration in integrations" :key="integration.shortcode">
          <integration-card v-bind="integration" />
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { ZButton, ZIcon, ZTag } from '@deepsourcelabs/zeal'
import { Component, mixins } from 'nuxt-property-decorator'

import IntegrationsDetailMixin from '~/mixins/integrationsDetailMixin'
import IntegrationsListMixin from '~/mixins/integrationsListMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import { RepoPerms } from '~/types/permTypes'
import { IntegrationSettingsLevel } from '~/types/types'

/**
 * Repository level integrations page for smaller screens
 */
@Component({
  components: {
    ZButton,
    ZIcon,
    ZTag
  },
  middleware: ['perm', 'teamOnly'],
  meta: {
    strict: true,
    repoPerms: [RepoPerms.CHANGE_INTEGRATION_SETTINGS]
  },
  layout: 'dashboard'
})
export default class RepoLevelIntegrationsPage extends mixins(
  IntegrationsDetailMixin,
  IntegrationsListMixin,
  RepoDetailMixin
) {
  /**
   * The fetch hook
   *
   * @returns {Promise<void>}
   */
  async fetch() {
    await this.fetchIntegrations({
      level: IntegrationSettingsLevel.Repository,
      repositoryId: this.repository.id,
      onlyInstalled: true,
      refetch: true
    })
  }
}
</script>
