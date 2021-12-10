import { GetterTree, ActionTree, MutationTree, Store, ActionContext } from 'vuex'

import OrgLicenseQuery from '~/apollo/queries/control-panel/license/orgLicenseInfo.gql'

import { GraphqlError, GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { License, TrendType } from '~/types/types'
import { RootState } from '~/store'

export enum OrgLicenseActions {
  FETCH_ORG_LICENSE_DATA = 'fetchOrgLicenseData'
}

export enum OrgLicenseGetters {
  ORG_LICENSE_DATA = 'getOrgLicenseData'
}

export enum OrgLicenseMutations {
  SET_ORG_LICENSE_DATA = 'setOrgLicenseData',
  SET_ERROR = 'setError'
}

export interface OrgLicenseModuleState {
  OrgLicenseData: License
  error: GraphqlError | Record<string, unknown>
}

export const state = (): OrgLicenseModuleState => ({
  ...(<OrgLicenseModuleState>{
    OrgLicenseData: {} as License,
    isViewerSuperadmin: false,
    error: {}
  })
})

export type OrgLicenseActionContext = ActionContext<OrgLicenseModuleState, RootState>

export const getters: GetterTree<OrgLicenseModuleState, RootState> = {
  [OrgLicenseGetters.ORG_LICENSE_DATA]: (state) => {
    return state.OrgLicenseData as License
  }
}
interface OrgLicenseModuleMutations extends MutationTree<OrgLicenseModuleState> {
  [OrgLicenseMutations.SET_ORG_LICENSE_DATA]: (
    state: OrgLicenseModuleState,
    OrgLicenseData: License
  ) => void
  [OrgLicenseMutations.SET_ERROR]: (state: OrgLicenseModuleState, error: GraphqlError) => void
}

export const mutations: OrgLicenseModuleMutations = {
  [OrgLicenseMutations.SET_ORG_LICENSE_DATA]: (state, OrgLicenseData) => {
    state.OrgLicenseData = Object.assign({}, state.OrgLicenseData, OrgLicenseData)
  },
  [OrgLicenseMutations.SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  }
}

interface OrgLicenseModuleActions extends ActionTree<OrgLicenseModuleState, RootState> {
  [OrgLicenseActions.FETCH_ORG_LICENSE_DATA]: (
    this: Store<RootState>,
    injectee: OrgLicenseActionContext,
    args: { lastDays: number; trendType: TrendType }
  ) => Promise<void>
}

export const actions: OrgLicenseModuleActions = {
  async [OrgLicenseActions.FETCH_ORG_LICENSE_DATA]({ commit }, args) {
    await this.$fetchGraphqlData(OrgLicenseQuery, args)
      .then((response: GraphqlQueryResponse) => {
        commit(OrgLicenseMutations.SET_ORG_LICENSE_DATA, response.data.enterprise?.license)
      })
      .catch((e: GraphqlError) => {
        commit(OrgLicenseMutations.SET_ERROR, e)
      })
  }
}
