import { Component, Vue, namespace } from 'nuxt-property-decorator'
import { IntegrationsListActions } from '~/store/integrations/list'
import { IntegrationProvider, IntegrationSettingsLevel } from '~/types/types'

const integrationsListStore = namespace('integrations/list')

/**
 * Mixin that has methods for working with all integrations.
 */
@Component
export default class IntegrationsListMixin extends Vue {
  @integrationsListStore.State
  integrations!: Array<IntegrationProvider>

  @integrationsListStore.Action(IntegrationsListActions.FETCH_INTEGRATIONS)
  fetchIntegrations: (args: {
    level?: IntegrationSettingsLevel
    ownerId?: string
    repositoryId?: string
    onlyInstalled?: boolean
    refetch?: boolean
  }) => Promise<void>

  @integrationsListStore.Action(IntegrationsListActions.FETCH_INTEGRATIONS_WITH_DETAILS)
  fetchIntegrationsWithDetails: (args: {
    level?: IntegrationSettingsLevel
    ownerId?: string
    repositoryId?: string
    onlyInstalled?: boolean
    refetch?: boolean
  }) => Promise<void>

  /**
   * Method to fetch description corresponding to the given integration
   *
   * @param {string} shortcode
   * @returns {void}
   */
  getIntegrationDescription(shortcode: string): string {
    const descriptionMap = {
      slack: 'Send event alerts to your channels',
      jira: 'Create issues from DeepSource to Jira'
    } as Record<string, string>

    return descriptionMap[shortcode]
  }
}
