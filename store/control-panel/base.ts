import { GetterTree, ActionTree, MutationTree, Store, ActionContext } from 'vuex'

import BaseOrgDataQuery from '~/apollo/queries/control-panel/baseOrgInfo.gql'
import SuperadminCheckQuery from '~/apollo/queries/control-panel/superadminCheck.gql'

import { GraphqlError, GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { EnterpriseInstallationSetup } from '~/types/types'
import { RootState } from '~/store'

export enum OrgBaseActions {
  FETCH_ORG_BASE_DATA = 'fetchOrgBaseData',
  IS_VIEWER_SUPERADMIN = 'fetchViewerSUPERADMIN'
}

export enum OrgBaseGetters {
  ORG_BASE_DATA = 'getOrgBaseData',
  GET_MANAGEMENT_URL = 'getManagementUrl',
  IS_VIEWER_SUPERADMIN = 'getViewerSuperadminStatus'
}

export enum OrgBaseMutations {
  SET_ORG_BASE_DATA = 'setOrgBaseData',
  SET_VIEWER_SUPERADMIN = 'setViewerSuperadmin',
  SET_ERROR = 'setError',
  SET_MANAGEMENT_URL = 'setManagementUrl'
}

export interface OrgBaseModuleState {
  orgBaseData: EnterpriseInstallationSetup
  orgInstallationManagementUrl: string
  isViewerSuperadmin: boolean
  error: GraphqlError | Record<string, unknown>
}

export const state = (): OrgBaseModuleState => ({
  ...(<OrgBaseModuleState>{
    orgBaseData: {} as EnterpriseInstallationSetup,
    orgInstallationManagementUrl: '',
    isViewerSuperadmin: false,
    error: {}
  })
})

export type OrgBaseActionContext = ActionContext<OrgBaseModuleState, RootState>

export const getters: GetterTree<OrgBaseModuleState, RootState> = {
  [OrgBaseGetters.ORG_BASE_DATA]: (state) => {
    return state.orgBaseData as EnterpriseInstallationSetup
  },
  [OrgBaseGetters.GET_MANAGEMENT_URL]: (state) => {
    return state.orgInstallationManagementUrl as string
  },
  [OrgBaseGetters.IS_VIEWER_SUPERADMIN]: (state) => {
    return state.isViewerSuperadmin
  }
}
interface OrgBaseModuleMutations extends MutationTree<OrgBaseModuleState> {
  [OrgBaseMutations.SET_ORG_BASE_DATA]: (
    state: OrgBaseModuleState,
    orgData: EnterpriseInstallationSetup
  ) => void
  [OrgBaseMutations.SET_VIEWER_SUPERADMIN]: (
    state: OrgBaseModuleState,
    isViewerSuperadmin: boolean
  ) => void
  [OrgBaseMutations.SET_MANAGEMENT_URL]: (
    state: OrgBaseModuleState,
    orgInstallationManagementUrl: string
  ) => void
  [OrgBaseMutations.SET_ERROR]: (state: OrgBaseModuleState, error: GraphqlError) => void
}

export const mutations: OrgBaseModuleMutations = {
  [OrgBaseMutations.SET_ORG_BASE_DATA]: (state, orgData) => {
    state.orgBaseData = Object.assign({}, state.orgBaseData, orgData)
  },
  [OrgBaseMutations.SET_VIEWER_SUPERADMIN]: (state, isViewerSuperadmin) => {
    state.isViewerSuperadmin = isViewerSuperadmin || false
  },
  [OrgBaseMutations.SET_MANAGEMENT_URL]: (state, orgInstallationManagementUrl) => {
    state.orgInstallationManagementUrl = orgInstallationManagementUrl || ''
  },
  [OrgBaseMutations.SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  }
}

interface OrgBaseModuleActions extends ActionTree<OrgBaseModuleState, RootState> {
  [OrgBaseActions.FETCH_ORG_BASE_DATA]: (
    this: Store<RootState>,
    injectee: OrgBaseActionContext,
    args?: { q: string }
  ) => Promise<void>
  [OrgBaseActions.IS_VIEWER_SUPERADMIN]: (
    this: Store<RootState>,
    injectee: OrgBaseActionContext
  ) => Promise<void>
}

export const actions: OrgBaseModuleActions = {
  async [OrgBaseActions.FETCH_ORG_BASE_DATA]({ commit }, args) {
    await this.$fetchGraphqlData(BaseOrgDataQuery, args)
      .then((response: GraphqlQueryResponse) => {
        commit(OrgBaseMutations.SET_ORG_BASE_DATA, response.data.enterprise?.installation)
        commit(OrgBaseMutations.SET_MANAGEMENT_URL, response.data.enterprise?.managementConsoleUrl)
      })
      .catch((e: GraphqlError) => {
        commit(OrgBaseMutations.SET_ERROR, e)
      })
  },
  async [OrgBaseActions.IS_VIEWER_SUPERADMIN]({ commit }) {
    await this.$fetchGraphqlData(SuperadminCheckQuery, {}, true)
      .then((response: GraphqlQueryResponse) => {
        commit(OrgBaseMutations.SET_VIEWER_SUPERADMIN, response.data.isViewerSuperadmin)
      })
      .catch((e: GraphqlError) => {
        commit(OrgBaseMutations.SET_VIEWER_SUPERADMIN, false)
        commit(OrgBaseMutations.SET_ERROR, e)
      })
  }
}
