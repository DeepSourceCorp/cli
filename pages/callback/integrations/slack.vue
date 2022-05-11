<template>
  <div class="flex justify-center pt-26 animate-glow-bg">
    <div class="pt-6 pb-4 border rounded-md bg-ink-400 border-ink-200">
      <div class="flex items-center justify-center gap-x-2">
        <div class="p-1.5 pl-3 bg-ink-300">
          <img src="~/assets/images/logomark.svg" alt="DeepSource" class="flex-shrink-0 w-8 h-8" />
        </div>

        <z-icon icon="arrow-left-right" />

        <div class="p-1.5 bg-ink-300">
          <img :src="integration.logo" alt="Slack logo" class="flex-shrink-0 w-8 h-8" />
        </div>
      </div>

      <div class="flex justify-center mt-6 mb-7">
        <notice class="h-8 gap-x-3">
          <template #indicator>
            <span class="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-honey"></span>
          </template>
          <p class="text-xs">
            Installing on
            <span class="font-medium text-vanilla-100">{{
              installIntegrationPayload.installingOn
            }}</span>
          </p>
        </notice>
      </div>

      <div class="flex flex-col px-6 gap-y-4 md:flex-row md:justify-between md:gap-y-0">
        <label class="text-sm place-self-center text-vanilla-100"> Notification channel </label>

        <div class="h-8 md:w-48">
          <z-select
            v-model="channel"
            :truncate="true"
            spacing="pl-2.5 pr-2 py-2"
            class="text-sm md:w-48"
          >
            <z-option
              v-for="option in channelOptions"
              :key="option"
              :label="`# ${option}`"
              :value="option"
              class="px-4"
            />
          </z-select>
        </div>
      </div>

      <z-divider margin="my-7" />

      <div class="flex flex-col px-6 gap-x-0 gap-y-4 md:flex-row md:gap-y-0 md:gap-x-4">
        <div class="space-y-1.5 max-w-2xs">
          <h2 class="text-sm text-vanilla-300">Event alerts</h2>
          <p class="text-xs text-vanilla-400 md:w-52">
            Events for which you receive notification in your Slack channel.
          </p>
        </div>

        <ul class="space-y-6">
          <li v-for="event in events" :key="event" class="flex gap-x-2">
            <span class="inline-flex items-center">
              <z-icon icon="check" color="juniper" />
            </span>
            <span class="text-sm">{{ event }}</span>
          </li>
        </ul>
      </div>

      <z-divider margin="my-7" />

      <div class="grid px-6 pb-px">
        <z-button
          :is-loading="installingIntegration"
          label="Install integration"
          loading-label="Installing integration"
          icon="play-circle"
          size="small"
          class="mb-2.5 place-self-end w-44"
          @click="installIntegrationHandler"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ZButton, ZDivider, ZIcon, ZSelect, ZOption } from '@deepsourcelabs/zeal'
import { Component, mixins } from 'nuxt-property-decorator'

import integrationsDetailMixin from '~/mixins/integrationsDetailMixin'
import { IntegrationsDetailActions } from '~/store/integrations/detail'
import { TeamPerms } from '~/types/permTypes'
import { IntegrationInstallationStep, IntegrationSettingsLevel } from '~/types/types'
import { Route } from 'vue-router'
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

  channelOptions = []
  events = [
    'New issues introduced in default branch',
    'Issues resolved in default branch',
    'Autofix successful',
    'Repository activation status changed'
  ]

  /**
   * Fetch hook
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    const { nextStep, options } = this.installIntegrationPayload

    // Populate the ZSelect component options with channel list after `INSTALL` step
    if (nextStep === IntegrationInstallationStep.ConfigReqd) {
      this.channelOptions = options.channel
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
