<template>
  <div>
    <breadcrumb-container
      :links="[
        { label: 'Integrations', route: $generateRoute(['settings', 'integrations']) },
        { label: 'Slack' }
      ]"
    />

    <div v-if="$fetchState.pending" class="p-4 pb-32 md:max-w-2xl">
      <div class="h-8 mb-4 bg-opacity-50 rounded-md animate-pulse bg-ink-200"></div>
      <div class="mb-8 bg-opacity-50 rounded-md h-28 animate-pulse bg-ink-200"></div>
      <div class="bg-opacity-50 rounded-md h-52 animate-pulse bg-ink-200"></div>
    </div>

    <div v-else class="p-4 pb-32 md:max-w-2xl">
      <div class="flex flex-col justify-between gap-4 mb-4 sm:flex-row">
        <integration-title :logo="integration.logo" name="Slack" />

        <integration-installed-on
          v-if="integration.installed"
          :installed-on="integration.installedOn"
        />

        <z-button
          v-else
          :is-loading="installingIntegration"
          icon="play-circle"
          label="Install integration"
          loading-label="Installing integration"
          size="small"
          class="w-44"
          @click="installIntegrationHandler"
        />
      </div>

      <z-divider v-if="integration.installed" margin="my-4" />

      <integration-installed-by
        v-if="integration.installed"
        :avatar="avatar"
        :user-name="userName"
        :email="email"
        :enabled-on="integration.enabledOn"
      />

      <z-alert
        v-if="showAlert"
        :dismissible="true"
        type="neutral"
        :class="{ 'mb-4': integration.installed }"
        @dismiss="hideAlert"
      >
        <div class="space-y-2">
          <h2 class="text-sm font-medium text-vanilla-100">How does it work?</h2>
          <p class="text-xs leading-relaxed text-vanilla-400">
            Receive event updates, like analysis and Autofix results, in real-time to your Slack
            workspace. Repository administrators can configure a different notification channel in
            their respective repository’s settings.
          </p>
        </div>
      </z-alert>

      <notification-channel-section
        v-if="integration.installed"
        v-model="channel"
        :pending="$fetchState.pending"
      />

      <z-divider margin="my-4" />

      <event-alerts-section />

      <z-divider v-if="integration.installed" margin="my-4" />

      <div
        v-if="integration.installed"
        class="flex flex-col md:justify-between md:flex-row gap-y-4 md:gap-y-0"
      >
        <div class="max-w-sm space-y-2">
          <h2 class="text-sm text-vanilla-300">Uninstall integration</h2>
          <p class="text-xs text-vanilla-400">
            Uninstalling the Slack integration from your account would stop all alerts to your Slack
            workspace.
          </p>
        </div>

        <z-button
          icon="x"
          button-type="danger"
          color="ink-300"
          label="Uninstall Slack"
          size="small"
          @click="showDeleteConfirmation = true"
        />
      </div>
    </div>

    <portal to="modal">
      <z-confirm
        v-if="showDeleteConfirmation"
        title="Are you sure you want to uninstall Slack?"
        subtitle="Uninstalling the Slack integration from your account would stop all alerts to your Slack
            workspace."
        @onClose="showDeleteConfirmation = false"
      >
        <template v-slot:footer="{ close }">
          <div class="flex items-center justify-end mt-6 space-x-4 text-right text-vanilla-100">
            <z-button button-type="ghost" size="small" class="text-vanilla-100" @click="close">
              Cancel
            </z-button>
            <z-button
              :is-loading="removingIntegration"
              button-type="danger"
              icon="x"
              size="small"
              class="modal-primary-action"
              @click="uninstallIntegrationHandler"
              >Yes, uninstall Slack</z-button
            >
          </div>
        </template>
      </z-confirm>
    </portal>
  </div>
</template>

<script lang="ts">
import {
  ZAlert,
  ZAvatar,
  ZBreadcrumb,
  ZBreadcrumbItem,
  ZButton,
  ZConfirm,
  ZDivider,
  ZIcon,
  ZOption,
  ZSelect
} from '@deepsourcelabs/zeal'
import { Component, mixins, Watch } from 'nuxt-property-decorator'

import IntegrationsDetailMixin from '~/mixins/integrationsDetailMixin'

import { TeamPerms } from '~/types/permTypes'
import { IntegrationSettingsLevel, UpdateIntegrationSettingsInput } from '~/types/types'
import { formatDate } from '~/utils/date'

const SHORTCODE = 'slack'

/**
 * Owner-level integrations page specific to an app
 */
@Component({
  components: {
    ZAlert,
    ZAvatar,
    ZButton,
    ZBreadcrumb,
    ZBreadcrumbItem,
    ZConfirm,
    ZDivider,
    ZIcon,
    ZOption,
    ZSelect
  },
  middleware: ['perm', 'teamOnly'],
  meta: {
    auth: {
      strict: true,
      teamPerms: [TeamPerms.MANAGE_INTEGRATIONS]
    }
  },
  layout: 'dashboard',
  methods: {
    formatDate
  }
})
export default class SlackIntegration extends mixins(IntegrationsDetailMixin) {
  showAlert = false
  channel = ''

  /**
   * The fetch hook
   *
   *  @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    await this.fetchIntegrationData(SHORTCODE)

    // Set the channel preference if available
    if (this.integration.installed) {
      this.channel = this.integration.settings.channel
    }
  }

  /**
   * Mounted hook
   *
   *
   * @returns {void}
   */
  mounted(): void {
    const integrationSlackStore = localStorage['integration-slack']
    if (integrationSlackStore) {
      // Check if the `integration-slack` store includes a key by the name `is-alert-visible`
      const isFirstTime = !Object.keys(JSON.parse(integrationSlackStore)).includes(
        'is-alert-visible'
      )

      if (isFirstTime) {
        // Set the value to `true` if for the first time
        this.showAlert = true
        this.$localStore.set('integration-slack', 'is-alert-visible', true)
      } else {
        // Grab the value from local storage
        this.showAlert = this.$localStore.get('integration-slack', 'is-alert-visible') as boolean
      }
    } else {
      // Fall back to `true` if the `integration-slack` is absent
      this.showAlert = true
    }

    this.fetchInstallationUrl(SHORTCODE)
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
      shortcode: 'slack',
      level: IntegrationSettingsLevel.Owner,
      ownerId: this.owner.id,
      settings: { channel: newChannel }
    } as UpdateIntegrationSettingsInput

    // Dispatch the Vuex action that invokes the GQL mutation aimed at updating integration settings
    const { ok } = await this.updateIntegrationSettings(args)

    // Show success toast on successfully updating the channel preference
    if (ok) {
      this.$toast.success(`Successfully updated the channel to ${newChannel}.`)
    }
  }

  /**
   * Fetch the integration installation URL, set provider, owner and owner ID information in cookies,
   * navigate to the installation URL
   *
   * @returns {Promise<void>}
   */
  async installIntegrationHandler(): Promise<void> {
    await this.getInstallationUrlSetCookiesAndRedirect(SHORTCODE)
  }

  /**
   * Trigger the `uninstallIntegration` GQL mutation, and refetch the integrations list
   *
   * @returns {Promise<void>}
   */
  async uninstallIntegrationHandler(): Promise<void> {
    this.uninstallIntegrationWrapper(SHORTCODE)
  }

  /**
   * Set the value of `is-alert-visible` key to `false` within `integration-slack` store (local storage)
   *
   * @returns {void}
   */
  hideAlert(): void {
    this.$localStore.set('integration-slack', 'is-alert-visible', false)
  }
}
</script>
