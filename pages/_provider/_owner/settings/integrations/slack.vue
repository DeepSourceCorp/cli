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
      <div class="flex justify-between" :class="{ 'mb-4': !integration.installed }">
        <div class="inline-flex items-center gap-x-2">
          <div class="p-1 bg-ink-300">
            <img :src="integration.logo" alt="Slack" class="flex-shrink-0 w-5 h-5" />
          </div>
          <h2 class="text-base font-medium text-vanilla-100">Slack</h2>
        </div>

        <notice v-if="integration.installed" class="h-8">
          <p class="text-xs">
            Installed on
            <span class="font-medium text-vanilla-100">{{ integration.installedOn }}</span>
          </p>
        </notice>
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

      <div
        v-if="integration.installed"
        class="flex items-center text-xs gap-x-1 text-vanilla-400 mb-7"
      >
        <span>Enabled by</span>
        <z-avatar
          :image="avatar"
          :user-name="userName"
          size="xs"
          class="flex-shrink-0 leading-none rounded-full"
        />
        <span class="text-xs font-medium leading-none text-vanilla-100">{{ userName }}</span>
        <span>on {{ formatDate(integration.enabledOn) }} </span>
      </div>

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
            Configure personal and event-specific Slack notifications for your DeepSource issues.
            This integration also enables anyone in your team to configure team and event-specific
            notifications to their own Slack channels and receive personal Slack notifications.
          </p>
        </div>
      </z-alert>

      <div
        v-if="integration.installed"
        class="flex flex-col md:justify-between md:flex-row gap-y-4 md:gap-y-0"
      >
        <label class="text-sm md:place-self-center text-vanilla-100"> Notification channel </label>

        <div class="w-full h-8 md:w-48">
          <div
            v-if="$fetchState.pending"
            class="w-48 h-8 rounded-md bg-ink-300 animate-pulse"
          ></div>
          <z-select
            v-else
            v-model="channel"
            :truncate="true"
            spacing="pl-2.5 pr-2 py-2"
            class="w-48 text-sm"
          >
            <z-option
              v-for="option in integration.options.channel"
              :key="option"
              :label="`# ${option}`"
              :value="option"
            />
          </z-select>
        </div>
      </div>

      <z-divider margin="my-4" />

      <div class="grid grid-cols-1 gap-y-4 md:grid-cols-2 md:gap-y-0">
        <div class="space-y-1.5 max-w-2xs">
          <h2 class="text-sm text-vanilla-300">Event alerts</h2>
          <p class="text-xs text-vanilla-400">
            Events for which you receive notification in your Slack channel.
          </p>
        </div>

        <ul class="space-y-6">
          <li v-for="(event, key) in slackEvents" :key="key" class="flex gap-x-2">
            <span class="inline-flex items-center">
              <z-icon icon="check" color="juniper" />
            </span>
            <span class="text-sm">{{ event }}</span>
          </li>
        </ul>
      </div>

      <z-divider v-if="integration.installed" margin="my-4" />

      <div
        v-if="integration.installed"
        class="flex flex-col md:justify-between md:flex-row gap-y-4 md:gap-y-0"
      >
        <div class="max-w-xs space-y-2">
          <h2 class="text-sm text-vanilla-300">Uninstall integration</h2>
          <p class="text-xs text-vanilla-400">
            Uninstalling the Slack integration from your account would stop all alerts to your Slack
            workspace.
          </p>
        </div>

        <div class="h-8 bg-cherry hover:bg-opacity-80">
          <z-button
            :is-loading="uninstallingIntegration"
            icon="x"
            button-type="ghost"
            color="ink-300"
            label="Uninstall Slack"
            loading-label="Uninstalling Slack"
            size="small"
            class="w-full bg-cherry md:place-self-end hover:bg-opacity-0 md:w-40"
            @click="showConfirm = true"
          />
        </div>
      </div>
    </div>

    <portal to="modal">
      <z-confirm
        v-if="showConfirm"
        title="Are you sure you want to uninstall Slack?"
        subtitle="Uninstalling the Slack integration from your account would stop all alerts to your Slack
            workspace."
        @onClose="showConfirm = false"
      >
        <template v-slot:footer="{ close }">
          <div class="flex items-center justify-end mt-6 space-x-4 text-right text-vanilla-100">
            <z-button button-type="ghost" size="small" class="text-vanilla-100" @click="close">
              Cancel
            </z-button>
            <z-button
              :is-loading="uninstallingIntegration"
              button-type="danger"
              icon="x"
              size="small"
              class="modal-primary-action"
              @click="uninstallIntegrationHandler"
              >Yes</z-button
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
  ZButton,
  ZBreadcrumb,
  ZBreadcrumbItem,
  ZConfirm,
  ZDivider,
  ZIcon,
  ZOption,
  ZSelect
} from '@deepsourcelabs/zeal'
import { Component, mixins, Watch } from 'nuxt-property-decorator'

import integrationsDetailMixin from '~/mixins/integrationsDetailMixin'
import integrationsListMixin from '~/mixins/integrationsListMixin'
import ownerDetailMixin from '~/mixins/ownerDetailMixin'

import { TeamPerms } from '~/types/permTypes'
import { IntegrationSettingsLevel } from '~/types/types'
import { formatDate } from '~/utils/date'

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
export default class SlackIntegration extends mixins(
  integrationsDetailMixin,
  integrationsListMixin,
  ownerDetailMixin
) {
  installingIntegration = false
  showAlert = false
  showConfirm = false
  uninstallingIntegration = false

  channel = ''

  /**
   * The fetch hook
   *
   *  @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    // Fetch owner Id from cookies if arriving after integration installation
    const ownerId = this.$cookies.get('integration-slack-owner-id')

    if (!this.owner.id) {
      // Fetch owner ID if not available
      const { provider, owner: login } = this.$route.params
      await this.fetchOwnerDetails({ login, provider })
    }

    // Fetch details specific to Slack
    await this.fetchIntegrationDetails({
      shortcode: 'slack',
      level: IntegrationSettingsLevel.Owner,
      ownerId: this.owner.id || ownerId
    })

    this.$cookies.remove('integration-slack-owner-id')

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
  }

  get avatar(): string | null | undefined {
    return this.integration?.enabledBy?.avatar
  }

  get userName(): string | undefined {
    return this.integration?.enabledBy?.fullName || this.integration?.enabledBy?.email
  }

  /**
   * Fetch the integration installation URL, set provider, owner and owner ID information in cookies,
   * navigate to the installation URL
   *
   * @returns {Promise<void>}
   */
  async installIntegrationHandler(): Promise<void> {
    this.installingIntegration = true

    // Trigger the GQL mutation to fetch integration installation URL
    const { url } = await this.getIntegrationInstallationUrl({ shortcode: 'slack' })

    // Set provider and owner information in cookies
    const { provider, owner } = this.$route.params
    this.$cookies.set('integration-slack-provider', provider)
    this.$cookies.set('integration-slack-owner', owner)
    this.$cookies.set('integration-slack-owner-id', this.owner.id)

    // Navigate to the app authorization page
    if (url) {
      window.location.href = url
    } else {
      // The redirect didn't happen, reset the CTA state
      this.installingIntegration = false
    }
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
    if (oldChannel === '') {
      return
    }

    // Dispatch the Vuex action that invokes the GQL mutation aimed at updating integration settings
    await this.updateIntegrationSettings({
      shortcode: 'slack',
      level: IntegrationSettingsLevel.Owner,
      ownerId: this.owner.id,
      settings: { channel: newChannel }
    })
  }

  /**
   * Trigger the `uninstallIntegration` GQL mutation, and refetch the integrations list
   *
   * @returns {Promise<void>}
   */
  async uninstallIntegrationHandler(): Promise<void> {
    this.uninstallingIntegration = true

    // Trigger the GQL mutation to uninstall integration
    try {
      await this.unInstallIntegration({ shortcode: 'slack', ownerId: this.owner.id })
    } catch (e) {
      this.$logErrorAndToast(
        e as Error,
        'There was an error uninstalling the integration. Please contact support.'
      )
      this.uninstallingIntegration = false
      this.showConfirm = false
      return
    }

    // Refetch integrations list
    await this.fetchIntegrations({
      level: IntegrationSettingsLevel.Owner,
      ownerId: this.owner.id,
      refetch: true
    })

    this.uninstallingIntegration = false
    this.showConfirm = false
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
