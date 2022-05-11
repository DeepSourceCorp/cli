import { ActionContext, ActionTree, MutationTree, Store } from 'vuex'

import GetIntegrationInstallationUrlGQLMutation from '~/apollo/mutations/integrations/getIntegrationInstallationUrl.gql'
import InstallIntegrationGQLMutation from '~/apollo/mutations/integrations/installIntegration.gql'
import IntegrationDetailGQLQuery from '~/apollo/queries/integrations/integrationDetail.gql'
import IntegrationLogoUrlGQLQuery from '~/apollo/queries/integrations/integrationLogoUrl.gql'

import UpdateIntegrationSettingsGQLMutation from '~/apollo/mutations/integrations/updateIntegrationSettings.gql'
import UninstallIntegrationGQLMutation from '~/apollo/mutations/integrations/uninstallIntegration.gql'

import { RootState } from '~/store'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
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

export enum IntegrationsDetailActions {
  FETCH_INTEGRATION_DETAILS = 'fetchIntegrationDetails',
  FETCH_INTEGRATION_LOGO_URL = 'fetchIntegrationLogoUrl',
  GET_INTEGRATION_INSTALLATION_URL = 'getIntegrationInstallationUrl',
  INSTALL_INTEGRATION = 'installIntegration',
  UPDATE_INTEGRATION_SETTINGS = 'updateIntegrationSettings',
  UNINSTALL_INTEGRATION = 'uninstallIntegration'
}

export enum IntegrationsDetailMutations {
  SET_INTEGRATION_DETAILS = 'setIntegrationDetails',
  SET_INSTALL_INTEGRATION_PAYLOAD = 'setInstallIntegrationPayload'
}

export interface IntegrationsDetailModuleState {
  integration: IntegrationProvider
  installIntegrationPayload: InstallIntegrationPayload
}

/**
 * Integrations List state
 *
 * @return {IntegrationsDetailModuleState}
 */
export const state = (): IntegrationsDetailModuleState => ({
  ...(<IntegrationsDetailModuleState>{
    integration: {},
    installIntegrationPayload: {}
  })
})

export type IntegrationsDetailActionContext = ActionContext<
  IntegrationsDetailModuleState,
  RootState
>

interface IntegrationsDetailModuleMutations extends MutationTree<IntegrationsDetailModuleState> {
  [IntegrationsDetailMutations.SET_INTEGRATION_DETAILS]: (
    state: IntegrationsDetailModuleState,
    integrations: IntegrationProvider
  ) => void

  [IntegrationsDetailMutations.SET_INSTALL_INTEGRATION_PAYLOAD]: (
    state: IntegrationsDetailModuleState,
    installIntegrationPayload: InstallIntegrationPayload
  ) => void
}

export const mutations: IntegrationsDetailModuleMutations = {
  [IntegrationsDetailMutations.SET_INTEGRATION_DETAILS]: (state, integration) => {
    state.integration = Object.assign({}, state.integration, integration)
  },

  [IntegrationsDetailMutations.SET_INSTALL_INTEGRATION_PAYLOAD]: (
    state,
    installIntegrationPayload
  ) => {
    state.installIntegrationPayload = Object.assign(
      {},
      state.installIntegrationPayload,
      installIntegrationPayload
    )
  }
}

interface IntegrationsDetailModuleActions
  extends ActionTree<IntegrationsDetailModuleState, RootState> {
  [IntegrationsDetailActions.FETCH_INTEGRATION_DETAILS]: (
    this: Store<RootState>,
    injectee: IntegrationsDetailActionContext,
    args: {
      shortcode: string
      level?: IntegrationSettingsLevel
      ownerId?: string
      repositoryId?: string
      refetch?: boolean
    }
  ) => Promise<void>

  [IntegrationsDetailActions.FETCH_INTEGRATION_LOGO_URL]: (
    this: Store<RootState>,
    injectee: IntegrationsDetailActionContext,
    args: {
      shortcode: string
      level?: IntegrationSettingsLevel
      ownerId?: string
      repositoryId?: string
      refetch?: boolean
    }
  ) => Promise<void>

  [IntegrationsDetailActions.GET_INTEGRATION_INSTALLATION_URL]: (
    this: Store<RootState>,
    injectee: IntegrationsDetailActionContext,
    args: GetIntegrationInstallationUrlInput
  ) => Promise<GetIntegrationInstallationUrlPayload>

  [IntegrationsDetailActions.INSTALL_INTEGRATION]: (
    this: Store<RootState>,
    injectee: IntegrationsDetailActionContext,
    args: InstallIntegrationInput
  ) => Promise<void>

  [IntegrationsDetailActions.UPDATE_INTEGRATION_SETTINGS]: (
    this: Store<RootState>,
    injectee: IntegrationsDetailActionContext,
    args: UpdateIntegrationSettingsInput
  ) => Promise<UpdateIntegrationSettingsPayload>

  [IntegrationsDetailActions.UNINSTALL_INTEGRATION]: (
    this: Store<RootState>,
    injectee: IntegrationsDetailActionContext,
    args: UninstallIntegrationInput
  ) => Promise<UninstallIntegrationPayload>
}

export const actions: IntegrationsDetailModuleActions = {
  async [IntegrationsDetailActions.FETCH_INTEGRATION_DETAILS]({ commit }, args) {
    try {
      const response: GraphqlQueryResponse = await this.$fetchGraphqlData(
        IntegrationDetailGQLQuery,
        args,
        args.refetch
      )
      commit(IntegrationsDetailMutations.SET_INTEGRATION_DETAILS, response?.data?.integration)
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'There was an error fetching integration details.')
    }
  },

  // Used to fetch integration logo url on the intermediary installation page
  async [IntegrationsDetailActions.FETCH_INTEGRATION_LOGO_URL]({ commit }, args) {
    try {
      const response: GraphqlQueryResponse = await this.$fetchGraphqlData(
        IntegrationLogoUrlGQLQuery,
        args,
        args.refetch
      )
      commit(IntegrationsDetailMutations.SET_INTEGRATION_DETAILS, response?.data?.integration)
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'There was an error fetching integration logo URL.')
    }
  },

  async [IntegrationsDetailActions.GET_INTEGRATION_INSTALLATION_URL](_, args) {
    try {
      const response = await this.$applyGraphqlMutation(GetIntegrationInstallationUrlGQLMutation, {
        input: args
      })
      return response?.data?.getIntegrationInstallationUrl
    } catch (e) {
      this.$logErrorAndToast(
        e as Error,
        'There was an error fetching integration installation URL.'
      )
    }
  },

  async [IntegrationsDetailActions.INSTALL_INTEGRATION]({ commit }, args) {
    try {
      const response = await this.$applyGraphqlMutation(InstallIntegrationGQLMutation, {
        input: args
      })
      commit(
        IntegrationsDetailMutations.SET_INSTALL_INTEGRATION_PAYLOAD,
        response?.data?.installIntegration
      )
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'There was an error installing the integration.')
    }
  },

  async [IntegrationsDetailActions.UPDATE_INTEGRATION_SETTINGS]({ dispatch }, args) {
    try {
      const response = await this.$applyGraphqlMutation(UpdateIntegrationSettingsGQLMutation, {
        input: args
      })

      // Refetch integration details
      const { shortcode, level, ownerId } = args
      await dispatch(IntegrationsDetailActions.FETCH_INTEGRATION_DETAILS, {
        shortcode,
        level,
        ownerId,
        refetch: true
      })

      return response?.data?.updateIntegrationSettings
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'There was an error updating the integration settings.')
    }
  },

  async [IntegrationsDetailActions.UNINSTALL_INTEGRATION]({ dispatch }, args) {
    try {
      const response = await this.$applyGraphqlMutation(UninstallIntegrationGQLMutation, {
        input: args
      })

      // Refetch integration details
      const { shortcode, ownerId } = args
      await dispatch(IntegrationsDetailActions.FETCH_INTEGRATION_DETAILS, {
        shortcode,
        level: IntegrationSettingsLevel.Owner,
        ownerId,
        refetch: true
      })

      return response?.data?.uninstallIntegration
    } catch (e) {
      throw e
    }
  }
}
