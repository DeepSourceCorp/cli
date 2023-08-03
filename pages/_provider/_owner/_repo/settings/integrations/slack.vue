<template>
  <div>
    <breadcrumb-container
      :links="[
        { label: 'Integrations', route: $generateRoute(['settings', 'integrations']) },
        { label: 'Slack' }
      ]"
    />
    <div class="p-4 pb-32 md:max-w-2xl">
      <div class="mb-4 flex flex-col justify-between gap-4 sm:flex-row">
        <integration-title :logo="integration.logo" :pending="$fetchState.pending" name="Slack" />

        <!-- Loading state for installed on info block -->
        <div v-if="$fetchState.pending">
          <div class="h-8 w-60 animate-pulse rounded-md bg-ink-200 bg-opacity-50"></div>
        </div>
        <integration-installed-on v-else :installed-on="integration.installedOn" />
      </div>

      <notification-channel-section v-model="channel" :pending="$fetchState.pending" class="mt-4" />

      <z-divider margin="my-4" />

      <event-alerts-section />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Watch } from 'nuxt-property-decorator'

import IntegrationsDetailMixin, { IntegrationShortcodes } from '~/mixins/integrationsDetailMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'

import { IntegrationsDetailActions } from '~/store/integrations/detail'
import { RepositoryDetailActions } from '~/store/repository/detail'

import { RepoPerms } from '~/types/permTypes'
import { IntegrationSettingsLevel, UpdateIntegrationSettingsInput } from '~/types/types'

/**
 * Repository level integrations page for Slack
 */
@Component({
  middleware: [
    // Restrict access if the integration is not installed
    async function ({ error, route, store }) {
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

      // Fetch the Slack installation status
      await store.dispatch(
        `integrations/detail/${IntegrationsDetailActions.FETCH_INTEGRATION_INSTALLATION_STATUS}`,
        {
          shortcode: IntegrationShortcodes.SLACK,
          level: IntegrationSettingsLevel.Repository,
          repositoryId
        }
      )

      // Redirect to the `404 page` if Slack is not installed
      const isInstalled = integrations.detail.integration.installed

      if (!isInstalled) {
        error({ statusCode: 404 })
        return
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
export default class RepoLevelSlackIntegrationPage extends mixins(
  IntegrationsDetailMixin,
  RepoDetailMixin
) {
  channel = ''

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
      shortcode: IntegrationShortcodes.SLACK,
      level: IntegrationSettingsLevel.Repository,
      repositoryId: this.repository.id
    })

    this.channel = this.integration.settings.channel
  }

  /**
   * Update Slack channel preference based on the selected option
   *
   * @param {string} newChannel - newly selected channel
   * @param {string} oldChannel - old selection
   *
   * @returns {Promise<void>}
   */
  @Watch('channel')
  async updateChannelPreference(newChannel: string, oldChannel: string): Promise<void> {
    // Prevent immediate invocation
    if (oldChannel === '') {
      return
    }

    // Conditionally populate the GQL mutation arguments
    const args = {
      shortcode: IntegrationShortcodes.SLACK,
      level: IntegrationSettingsLevel.Repository,
      repositoryId: this.repository.id,
      settings: { channel: newChannel }
    } as UpdateIntegrationSettingsInput

    // Dispatch the Vuex action that invokes the GQL mutation aimed at updating integration settings
    const { ok } = await this.updateIntegrationSettings(args)

    // Show success toast on successfully updating the channel preference
    if (ok) {
      this.$toast.success(`Successfully updated the channel to ${newChannel}.`)
    }
  }
}
</script>
