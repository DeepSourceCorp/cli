import { ActionContext, ActionTree, MutationTree, Store } from 'vuex'

import ListIntegrationsGQLQuery from '~/apollo/queries/integrations/listIntegrations.gql'

import { RootState } from '~/store'
import { IntegrationProvider, IntegrationSettingsLevel } from '~/types/types'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'

export enum IntegrationsListActions {
  FETCH_INTEGRATIONS = 'fetchIntegrations'
}

export enum IntegrationsListMutations {
  SET_INTEGRATIONS = 'setIntegrations'
}

export interface IntegrationsListModuleState {
  integrations: Array<IntegrationProvider>
}

/**
 * Integrations List state
 *
 * @return {IntegrationsListModuleState}
 */
export const state = (): IntegrationsListModuleState => ({
  ...(<IntegrationsListModuleState>{
    integrations: []
  })
})

export type IntegrationsListActionContext = ActionContext<IntegrationsListModuleState, RootState>

interface IssuePriorityListModuleMutations extends MutationTree<IntegrationsListModuleState> {
  [IntegrationsListMutations.SET_INTEGRATIONS]: (
    state: IntegrationsListModuleState,
    integrations: Array<IntegrationProvider>
  ) => void
}

export const mutations: IssuePriorityListModuleMutations = {
  [IntegrationsListMutations.SET_INTEGRATIONS]: (state, integrations) => {
    state.integrations = integrations
  }
}

interface IssuePriorityListModuleActions
  extends ActionTree<IntegrationsListModuleState, RootState> {
  [IntegrationsListActions.FETCH_INTEGRATIONS]: (
    this: Store<RootState>,
    injectee: IntegrationsListActionContext,
    args: {
      level?: IntegrationSettingsLevel
      ownerId?: string
      repositoryId?: string
      onlyInstalled?: boolean
      refetch?: boolean
    }
  ) => Promise<void>
}

export const actions: IssuePriorityListModuleActions = {
  // Used to fetch the list of integrations (both owner and repository level)
  async [IntegrationsListActions.FETCH_INTEGRATIONS]({ commit }, args) {
    try {
      const response: GraphqlQueryResponse = await this.$fetchGraphqlData(
        ListIntegrationsGQLQuery,
        args,
        args.refetch
      )
      commit(IntegrationsListMutations.SET_INTEGRATIONS, response?.data?.integrations)
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'There was an error fetching integrations.')
    }
  }
}
