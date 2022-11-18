import { Component, namespace, mixins } from 'nuxt-property-decorator'
import { IntegrationsDetailActions } from '~/store/integrations/detail'
import {
  CreateIssueOnIntegrationInput,
  CreateIssueOnIntegrationPayload,
  GetIntegrationInstallationUrlInput,
  GetIntegrationInstallationUrlPayload,
  InstallIntegrationInput,
  InstallIntegrationPayload,
  IntegrationProvider,
  IntegrationSettingsLevel,
  Maybe,
  UninstallIntegrationInput,
  UninstallIntegrationPayload,
  UpdateIntegrationSettingsInput,
  UpdateIntegrationSettingsPayload
} from '~/types/types'

import OwnerDetailMixin from './ownerDetailMixin'
import IntegrationsListMixin from './integrationsListMixin'

const integrationsDetailStore = namespace('integrations/detail')

export enum JiraCookieKeys {
  PROVIDER = 'integration-jira-provider',
  OWNER = 'integration-jira-owner',
  OWNER_ID = 'integration-jira-owner-id'
}

export enum SlackCookieKeys {
  PROVIDER = 'integration-slack-provider',
  OWNER = 'integration-slack-owner',
  OWNER_ID = 'integration-slack-owner-id'
}

/**
 * Mixin that has methods for working with details specific to an integration.
 */
@Component
export default class IntegrationsDetailMixin extends mixins(
  OwnerDetailMixin,
  IntegrationsListMixin
) {
  slackEvents = [
    'New issues introduced in default branch',
    'Issues resolved in default branch',
    'Autofix successful',
    'Repository activation status changed'
  ]

  installingIntegration = false
  removingIntegration = false
  installationUrl = ''
  showDeleteConfirmation = false

  get avatar(): string | null | undefined {
    return this.integration?.enabledBy?.avatar
  }

  get email(): string | undefined {
    return this.integration?.enabledBy?.email
  }

  get userName(): string | undefined {
    return this.integration?.enabledBy?.fullName || this.email
  }

  /**
   * Fetch integration Data
   *
   * @param {string} shortcode
   *
   * @return {Promise<void>}
   */
  async fetchIntegrationData(shortcode: string): Promise<void> {
    // Fetch owner Id from cookies if arriving after integration installation
    let ownerId = ''

    if (shortcode === 'jira') {
      ownerId = this.$cookies.get(JiraCookieKeys.OWNER_ID)
    } else if (shortcode === 'slack') {
      ownerId = this.$cookies.get(SlackCookieKeys.OWNER_ID)
    } else {
      ownerId = this.$cookies.get(`integration-${shortcode}-owner-id`)
    }

    if (!this.owner.id) {
      // Fetch owner ID if not available
      const { provider, owner: login } = this.$route.params
      await this.fetchOwnerID({ login, provider })
    }

    // Fetch details specific to the integration
    await this.fetchIntegrationDetails({
      shortcode: shortcode,
      level: IntegrationSettingsLevel.Owner,
      ownerId: this.owner.id || ownerId
    })

    if (shortcode === 'jira') {
      this.$cookies.remove(JiraCookieKeys.OWNER_ID)
    } else if (shortcode === 'slack') {
      this.$cookies.remove(SlackCookieKeys.OWNER_ID)
    } else {
      this.$cookies.remove(`integration-${shortcode}-owner-id`)
    }
  }

  /**
   * Wrapper for fetchInstallationUrl
   *
   * @param {string} shortcode
   *
   * @return {Promise<string>}
   */
  async fetchInstallationUrl(shortcode: string): Promise<string> {
    const { url } = await this.getIntegrationInstallationUrl({ shortcode })
    this.installationUrl = url ?? ''
    return this.installationUrl
  }

  /**
   * Get URL and redirect to trigger installation
   *
   * @param {string} shortcode
   *
   * @return {Promise<void>}
   */
  async getInstallationUrlSetCookiesAndRedirect(shortcode: string): Promise<void> {
    this.installingIntegration = true

    if (!this.installationUrl) {
      await this.fetchInstallationUrl(shortcode)
    }

    // Set provider and owner information in cookies
    const { provider, owner } = this.$route.params

    if (shortcode === 'jira') {
      this.$cookies.set(JiraCookieKeys.PROVIDER, provider)
      this.$cookies.set(JiraCookieKeys.OWNER, owner)
      this.$cookies.set(JiraCookieKeys.OWNER_ID, this.owner.id)
    } else if (shortcode === 'slack') {
      this.$cookies.set(SlackCookieKeys.PROVIDER, provider)
      this.$cookies.set(SlackCookieKeys.OWNER, owner)
      this.$cookies.set(SlackCookieKeys.OWNER_ID, this.owner.id)
    } else {
      this.$cookies.set(`integration-${shortcode}-provider`, provider)
      this.$cookies.set(`integration-${shortcode}-owner`, owner)
      this.$cookies.set(`integration-${shortcode}-owner-id`, this.owner.id)
    }

    // Navigate to the app authorization page
    if (this.installationUrl) {
      window.location.href = this.installationUrl
    } else {
      // The redirect didn't happen, reset the CTA state
      this.installingIntegration = false
    }
  }

  /**
   * Wrapper for uninstall integration mutation
   *
   * @param {string} shortcode - integration shortcode
   *
   * @return {Promise<void>}
   */
  async uninstallIntegrationWrapper(shortcode: string): Promise<void> {
    this.removingIntegration = true
    // Trigger the GQL mutation to uninstall integration
    try {
      await this.unInstallIntegration({ shortcode, ownerId: this.owner.id })
    } catch (e) {
      this.$logErrorAndToast(
        e as Error,
        'There was an error uninstalling the integration. Please contact support.'
      )
      this.removingIntegration = false
      this.showDeleteConfirmation = false
      return
    }

    // Refetch integrations list
    await this.fetchIntegrations({
      level: IntegrationSettingsLevel.Owner,
      ownerId: this.owner.id,
      refetch: true
    })

    this.removingIntegration = false
    this.showDeleteConfirmation = false
  }
  @integrationsDetailStore.State
  integration!: IntegrationProvider

  @integrationsDetailStore.State
  installIntegrationPayload!: InstallIntegrationPayload

  @integrationsDetailStore.Action(IntegrationsDetailActions.FETCH_INTEGRATION_DETAILS)
  fetchIntegrationDetails: (args: {
    shortcode: string
    level?: IntegrationSettingsLevel
    ownerId?: string
    repositoryId?: string
    refetch?: boolean
  }) => Promise<void>

  @integrationsDetailStore.Action(IntegrationsDetailActions.FETCH_INTEGRATION_LOGO_URL)
  fetchIntegrationLogoUrl: (args: {
    shortcode: string
    level?: IntegrationSettingsLevel
    ownerId?: string
    repositoryId?: string
    refetch?: boolean
  }) => Promise<void>

  @integrationsDetailStore.Action(IntegrationsDetailActions.GET_INTEGRATION_INSTALLATION_URL)
  getIntegrationInstallationUrl: (
    args: GetIntegrationInstallationUrlInput
  ) => Promise<GetIntegrationInstallationUrlPayload>

  @integrationsDetailStore.Action(IntegrationsDetailActions.INSTALL_INTEGRATION)
  installIntegration: (args: InstallIntegrationInput) => Promise<Maybe<InstallIntegrationPayload>>

  @integrationsDetailStore.Action(IntegrationsDetailActions.UPDATE_INTEGRATION_SETTINGS)
  updateIntegrationSettings: (
    args: UpdateIntegrationSettingsInput
  ) => Promise<UpdateIntegrationSettingsPayload>

  @integrationsDetailStore.Action(IntegrationsDetailActions.UNINSTALL_INTEGRATION)
  unInstallIntegration: (args: UninstallIntegrationInput) => Promise<UninstallIntegrationPayload>

  @integrationsDetailStore.Action(IntegrationsDetailActions.CREATE_ISSUE_ON_INTEGRATION)
  createIssueOnIntegration: (
    args: CreateIssueOnIntegrationInput
  ) => Promise<CreateIssueOnIntegrationPayload>
}
