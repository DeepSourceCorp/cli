<template>
  <div>
    <breadcrumb-container
      :links="[
        { label: 'Integrations', route: $generateRoute(['settings', 'integrations']) },
        { label: 'Vanta' }
      ]"
    />
    <div class="space-y-4 p-4 pb-32 md:max-w-2xl">
      <div class="flex flex-col justify-between gap-4 sm:flex-row">
        <integration-title :logo="integration.logo" :pending="$fetchState.pending" name="Vanta" />

        <!-- Loading state for installed on info block -->
        <div v-if="$fetchState.pending">
          <div class="h-8 w-60 animate-pulse rounded-md bg-ink-200 bg-opacity-50"></div>
        </div>
        <integration-installed-on v-else :installed-on="integration.installedOn" />
      </div>

      <z-divider margin="m-0" />

      <integration-info :description="integrationDescription" />
    </div>
  </div>
</template>

<script lang="ts">
import { ZDivider } from '@deepsource/zeal'
import { Component, mixins } from 'nuxt-property-decorator'

import IntegrationsDetailMixin, { IntegrationShortcodes } from '~/mixins/integrationsDetailMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'

import { IntegrationsDetailActions } from '~/store/integrations/detail'
import { RepositoryDetailActions } from '~/store/repository/detail'

import { RepoPerms } from '~/types/permTypes'
import { IntegrationSettingsLevel } from '~/types/types'

/**
 * Repository level integrations page for Vanta
 */
@Component({
  components: {
    ZDivider
  },
  middleware: [
    // Restrict access if the integration is not installed
    async ({ error, route, store }) => {
      const { provider, owner, repo } = route.params

      const {
        state: { integrations, repository }
      } = store

      const repositoryId = repository.detail.repository.id

      // Fetch the repository id alone if not available
      if (!repositoryId) {
        await store.dispatch(`repository/detail/${RepositoryDetailActions.FETCH_REPOSITORY_ID}`, {
          provider,
          owner,
          name: repo
        })
      }

      // Fetch the Vanta installation status
      await store.dispatch(
        `integrations/detail/${IntegrationsDetailActions.FETCH_INTEGRATION_INSTALLATION_STATUS}`,
        {
          shortcode: IntegrationShortcodes.VANTA,
          level: IntegrationSettingsLevel.Repository,
          repositoryId
        }
      )

      // Redirect to the `404 page` if Vanta is not installed
      const isInstalled = integrations.detail.integration.installed

      if (!isInstalled) {
        return error({ statusCode: 404 })
      }
    },
    'perm',
    'teamOnly'
  ],
  meta: {
    strict: true,
    repoPerms: [RepoPerms.CHANGE_INTEGRATION_SETTINGS]
  },
  layout: 'repository'
})
export default class RepoLevelVantaIntegrationPage extends mixins(
  IntegrationsDetailMixin,
  RepoDetailMixin
) {
  integrationDescription = `DeepSource periodically reports security issues found in the default branch of all your
    repositories to Vanta, making it easier for you to keep track of your organization's source
    code compliance.`

  IntegrationSettingsLevel = IntegrationSettingsLevel

  /**
   * Fetch hook
   *
   * @returns {Promise<void>}
   */

  async fetch() {
    if (!this.repository.id) {
      // Fetch repository ID if not available
      const { provider, owner, repo } = this.$route.params
      await this.fetchRepoID({ provider, owner, name: repo })
    }

    await this.fetchIntegrationDetails({
      shortcode: IntegrationShortcodes.VANTA,
      level: IntegrationSettingsLevel.Repository,
      repositoryId: this.repository.id
    })
  }
}
</script>
