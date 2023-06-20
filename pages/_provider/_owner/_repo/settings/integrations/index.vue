<template>
  <div class="space-y-4 p-4 md:max-w-2xl">
    <div class="inline-flex gap-x-2">
      <h2 class="text-lg font-medium">Integrations</h2>
    </div>

    <empty-state
      v-if="!$fetchState.pending && !integrations.length"
      title="No integrations installed"
      subtitle="You can install them from organization settings"
      class="rounded-lg border border-dashed border-slate-400"
    >
      <template #action>
        <nuxt-link :to="$generateRoute(['settings', 'integrations'], false)">
          <z-button size="small">
            <div class="inline-flex gap-x-2">
              <span>Go to organization settings</span>
              <z-icon color="current-color" icon="arrow-right" class="place-self-center" />
            </div>
          </z-button>
        </nuxt-link>
      </template>
    </empty-state>

    <template v-else>
      <!-- Loading state -->
      <div v-if="$fetchState.pending" class="3xl:grid-cols-3 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div
          v-for="ii in 3"
          :key="ii"
          class="integration-card-height animate-pulse rounded-md bg-ink-200 bg-opacity-50"
        ></div>
      </div>

      <div v-else class="3xl:grid-cols-3 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div v-for="integration in integrations" :key="integration.shortcode">
          <integration-card v-bind="integration" class="integration-card-height" />
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { ZButton, ZIcon } from '@deepsource/zeal'
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
    ZIcon
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

<style scoped lang="postcss">
@tailwind utilities;

.integration-card-height {
  height: 84px;
}

@media screen(lg) {
  .integration-card-height {
    height: 104px;
  }
}

@media screen(xl) {
  integration-card-height {
    height: 84px;
  }
}
</style>
