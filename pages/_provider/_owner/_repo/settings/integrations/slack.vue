<template>
  <div>
    <div class="p-4 pb-32 md:max-w-2xl">
      <div class="flex justify-between">
        <div class="inline-flex items-center space-x-2">
          <!-- Loading state for integration logo -->
          <div v-if="$fetchState.pending">
            <div class="w-6 h-6 bg-opacity-50 rounded-md animate-pulse bg-ink-200"></div>
          </div>

          <div v-else class="p-1 rounded-sm bg-ink-300">
            <img :src="integration.logo" alt="Slack logo" class="flex-shrink-0 w-5 h-5" />
          </div>
          <h2 class="text-base font-medium text-vanilla-100">Slack</h2>
        </div>

        <!-- Loading state for installed on info block -->
        <div v-if="$fetchState.pending">
          <div class="h-8 bg-opacity-50 rounded-md w-60 animate-pulse bg-ink-200"></div>
        </div>
        <notice v-else class="h-8">
          <p class="text-xs">
            Installed on
            <span class="font-medium text-vanilla-100">{{ integration.installedOn }}</span>
          </p>
        </notice>
      </div>

      <div class="flex flex-col mt-6 md:justify-between md:flex-row gap-y-4 md:gap-y-0">
        <label class="text-sm md:place-self-center text-vanilla-100"> Notification channel </label>

        <!-- Loading state for select widget -->
        <div class="w-full h-8 md:w-48">
          <div
            v-if="$fetchState.pending"
            class="h-8 bg-opacity-50 rounded-md animate-pulse bg-ink-200"
          ></div>
          <z-select
            v-else
            v-model="channel"
            :truncate="true"
            spacing="pl-2.5 pr-2 py-2"
            class="text-sm"
          >
            <z-option
              v-for="option in channelList"
              :key="option"
              :label="option"
              :value="option"
              class="pl-4"
            />
          </z-select>
        </div>
      </div>

      <z-divider margin="my-6" />

      <div class="grid grid-cols-1 gap-y-4 md:grid-cols-2 md:gap-y-0">
        <div class="space-y-2 max-w-2xs">
          <h2 class="text-sm text-vanilla-300">Event alerts</h2>
          <p class="text-xs text-vanilla-400">
            Events for which you receive notification in your Slack channel.
          </p>
        </div>

        <ul class="space-y-6">
          <li v-for="(event, key) in slackEvents" :key="key" class="flex space-x-2">
            <span class="inline-flex items-center">
              <z-icon icon="check" color="juniper" />
            </span>
            <span class="text-sm">{{ event }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ZDivider, ZIcon, ZOption, ZSelect } from '@deepsourcelabs/zeal'
import { Component, mixins, Watch } from 'nuxt-property-decorator'

import IntegrationsDetailMixin from '~/mixins/integrationsDetailMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import { IntegrationsDetailActions } from '~/store/integrations/detail'
import { RepositoryDetailActions } from '~/store/repository/detail'
import { RepoPerms } from '~/types/permTypes'
import { IntegrationSettingsLevel } from '~/types/types'

/**
 * Repository level integrations page for Slack
 */
@Component({
  components: {
    ZDivider,
    ZIcon,
    ZOption,
    ZSelect
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

      // Fetch the Slack installation status
      await store.dispatch(
        `integrations/detail/${IntegrationsDetailActions.FETCH_INTEGRATION_INSTALLATION_STATUS}`,
        {
          shortcode: 'slack',
          level: IntegrationSettingsLevel.Repository,
          repositoryId
        }
      )

      // Redirect to the `404 page` if Slack is not installed
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
  layout: 'dashboard'
})
export default class RepoLevelSlackIntegrationPage extends mixins(
  IntegrationsDetailMixin,
  RepoDetailMixin
) {
  channel = ''

  /**
   * Fetch hook
   *
   * @returns {Promise<void>}
   */

  async fetch() {
    await this.fetchIntegrationDetails({
      shortcode: 'slack',
      level: IntegrationSettingsLevel.Repository,
      repositoryId: this.repository.id
    })

    this.channel = this.integration.settings.channel
  }

  get channelList(): string[] {
    return this.integration.options?.channel || []
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

    // Dispatch the Vuex action that invokes the GQL mutation aimed at updating integration settings
    const { ok } = await this.updateIntegrationSettings({
      shortcode: 'slack',
      level: IntegrationSettingsLevel.Repository,
      repositoryId: this.repository.id,
      settings: { channel: newChannel }
    })

    if (ok) {
      this.$toast.success(`Successfully updated the channel to ${newChannel}.`)
    }
  }
}
</script>
