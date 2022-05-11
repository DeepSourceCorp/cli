import { Component, Vue, namespace } from 'nuxt-property-decorator'
import { IntegrationsDetailActions } from '~/store/integrations/detail'
import {
  GetIntegrationInstallationUrlInput,
  GetIntegrationInstallationUrlPayload,
  InstallIntegrationInput,
  InstallIntegrationPayload,
  IntegrationProvider,
  IntegrationSettingsLevel,
  UninstallIntegrationInput,
  UninstallIntegrationPayload,
  UpdateIntegrationSettingsInput,
  UpdateIntegrationSettingsPayload
} from '~/types/types'

const integrationsDetailStore = namespace('integrations/detail')

/**
 * Mixin that has methods for working with details specific to an integration.
 */
@Component
export default class IntegrationsDetailMixin extends Vue {
  slackEvents = [
    'New issues introduced in default branch',
    'Issues resolved in default branch',
    'Autofix successful',
    'Repository activation status changed'
  ]

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
  installIntegration: (args: InstallIntegrationInput) => Promise<void>

  @integrationsDetailStore.Action(IntegrationsDetailActions.UPDATE_INTEGRATION_SETTINGS)
  updateIntegrationSettings: (
    args: UpdateIntegrationSettingsInput
  ) => Promise<UpdateIntegrationSettingsPayload>

  @integrationsDetailStore.Action(IntegrationsDetailActions.UNINSTALL_INTEGRATION)
  unInstallIntegration: (args: UninstallIntegrationInput) => Promise<UninstallIntegrationPayload>
}
