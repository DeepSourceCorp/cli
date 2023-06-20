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
}
