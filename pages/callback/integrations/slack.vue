<template>
  <integration-callback-wrapper
    integration-logo="integration.logo"
    @triggerInstall="installIntegrationHandler"
    :is-installing="installingIntegration"
    :installing-on="installIntegrationPayload.installingOn"
    :primary-disabled="!channel"
  >
    <notification-channel-section
      v-model="channel"
      :available-channels="availableChannels"
      :update-on-change="false"
      class="px-6"
    />

    <z-divider margin="my-7" />

    <event-alerts-section class="px-6" />
  </integration-callback-wrapper>
</template>

<script lang="ts">
import { ZButton, ZDivider, ZIcon, ZSelect, ZOption } from '@deepsourcelabs/zeal'
import { Component, mixins } from 'nuxt-property-decorator'

import integrationsDetailMixin from '~/mixins/integrationsDetailMixin'
import { IntegrationsDetailActions } from '~/store/integrations/detail'
import { TeamPerms } from '~/types/permTypes'
import { IntegrationInstallationStep, IntegrationSettingsLevel } from '~/types/types'
import { Context } from '@nuxt/types'

/**
 * Intermediary page where the integration installation happens
 */
@Component({
  components: {
    ZButton,
    ZDivider,
    ZIcon,
    ZSelect,
    ZOption
  },
  middleware: [
    'perm',
    async function ({ redirect, route, store, $cookies }) {
      // Grab code and state from query params
      const { code, error, state } = route.query as Record<string, string>

      // Grab provider and owner information from cookies
      const provider = $cookies.get('integration-slack-provider')
      const owner = $cookies.get('integration-slack-owner')
      const ownerId = $cookies.get('integration-slack-owner-id')

      // Redirect to the dashboard if any among provider, owner, or owner-id
      // is not set in cookies
      if (!provider || !owner || !ownerId) {
        return redirect('/dashboard')
      }

      const integrationsPagePath = `/${provider}/${owner}/settings/integrations/slack`

      if (!code || error || !state) {
        // Redirect to the integrations page if there is an error,
        // or if anyone among code or state query params are not available
        return redirect(integrationsPagePath)
      }

      // Trigger the GQL mutation to install the integration
      await store.dispatch(`integrations/detail/${IntegrationsDetailActions.INSTALL_INTEGRATION}`, {
        step: IntegrationInstallationStep.Install,
        shortcode: 'slack',
        ownerId,
        code,
        state
      })

      const { nextStep, options } = store.state.integrations.detail.installIntegrationPayload

      // Redirect to the integrations page for Slack if the user performs a full reload
      // Triggering `installIntegration` GQL mutation `INSTALL` step would fail
      // The code send wouldn’t be valid while exchanging it for an access token
      if (!nextStep || !options) {
        return redirect(integrationsPagePath)
      }

      // Redirect to the integrations page for Slack if the URL has expired
      if (nextStep === IntegrationInstallationStep.Expired) {
        return redirect(integrationsPagePath)
      }

      await store.dispatch(
        `integrations/detail/${IntegrationsDetailActions.FETCH_INTEGRATION_LOGO_URL}`,
        { shortcode: 'slack', level: IntegrationSettingsLevel.Owner, ownerId }
      )
    }
  ],
  meta: {
    auth: {
      strict: true,
      teamPerms: [TeamPerms.MANAGE_INTEGRATIONS],
      metaDataHook: ({ $cookies }: Context) => {
        const provider = $cookies?.get('integration-slack-provider') as string
        const owner = $cookies?.get('integration-slack-owner') as string
        return { owner, provider }
      }
    }
  }
})
export default class SlackIntermediaryInstallation extends mixins(integrationsDetailMixin) {
  installingIntegration = false

  channel = ''

  availableChannels = []

  /**
   * Fetch hook
   *
   * @returns {void}
   */
  fetch(): void {
    const { nextStep, options } = this.installIntegrationPayload

    // Populate the `ZSelect` component options with channel list after `INSTALL` step
    // Supplied as via `availableChannels` prop to `NotificationChannelSection` component
    if (nextStep === IntegrationInstallationStep.ConfigReqd) {
      this.availableChannels = options.channel
    }
  }

  get ownerId(): string {
    return this.$cookies.get('integration-slack-owner-id')
  }

  /**
   * Redirect to the integrations page for Slack after performing `CONFIG_REQD` step of `installIntegration` GQL mutation
   *
   * @returns {Promise<void>}
   */
  async installIntegrationHandler(): Promise<void> {
    if (!this.channel) {
      this.$toast.danger('Please select a channel before proceeding.')
      return
    }

    this.installingIntegration = true

    const { code, state } = this.$route.query as Record<string, string>

    // Trigger the `installIntegration` GQL mutation with `CONFIG_REQD` as the step and the opted channel within `settings`
    await this.installIntegration({
      step: IntegrationInstallationStep.ConfigReqd,
      shortcode: 'slack',
      ownerId: this.ownerId,
      code,
      state,
      settings: { channel: this.channel }
    })

    if (this.installIntegrationPayload.nextStep === IntegrationInstallationStep.Expired) {
      this.$toast.danger('Installation failed, URL expired. Please try again.')
    }

    if (this.installIntegrationPayload.nextStep === IntegrationInstallationStep.Complete) {
      // Refetch integration details on successfully completing the installation
      await this.fetchIntegrationDetails({
        shortcode: 'slack',
        level: IntegrationSettingsLevel.Owner,
        ownerId: this.ownerId,
        refetch: true
      })

      this.$toast.success('Installation succeeded.')
    }

    // Redirect to the integrations page for Slack
    this.redirectToIntegrationsPage()

    this.installingIntegration = false
  }

  /**
   * Redirect to the integrations page for Slack
   *
   * @returns {void}
   */
  redirectToIntegrationsPage(): void {
    // Grab provider and owner information from cookies
    const provider = this.$cookies.get('integration-slack-provider')
    this.$cookies.remove('integration-slack-provider')

    const owner = this.$cookies.get('integration-slack-owner')
    this.$cookies.remove('integration-slack-owner')

    // Redirect to the integrations page
    this.$nuxt.$router.push(`/${provider}/${owner}/settings/integrations/slack`)
  }
}
</script>
