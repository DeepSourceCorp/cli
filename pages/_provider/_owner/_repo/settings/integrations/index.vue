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
      <z-button
        :to="$generateRoute(['settings', 'integrations'], false)"
        slot="action"
        size="small"
      >
        <div class="inline-flex gap-x-2">
          <span>Go to organization settings</span>
          <z-icon color="current-color" icon="arrow-right" class="place-self-center" />
        </div>
      </z-button>
    </empty-state>

    <template v-else>
      <!-- Loading state -->
      <div v-if="$fetchState.pending" class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="bg-opacity-50 rounded-md h-22 md:h-26 animate-pulse bg-ink-200"></div>
      </div>

      <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <nuxt-link
          v-for="integration in integrations"
          :key="integration.shortcode"
          :to="$generateRoute(['settings', 'integrations', integration.shortcode])"
          class="flex flex-col p-4 text-left bg-ink-300 hover:bg-ink-200"
        >
          <div class="space-y-2">
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
        </nuxt-link>
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
