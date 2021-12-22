import { GetterTree, ActionTree, MutationTree, Store, ActionContext } from 'vuex'

import OrgUsersQuery from '~/apollo/queries/control-panel/user-management/users.gql'
import OrgUserGroupQuery from '~/apollo/queries/control-panel/user-management/userAndGroups.gql'
import OrgUserTeamQuery from '~/apollo/queries/control-panel/user-management/userAndTeams.gql'

import RemoveUserFromGroupMutation from '~/apollo/mutations/control-panel/user-management/removeUserFromGroup.gql'
import DeleteUserMutation from '~/apollo/mutations/control-panel/user-management/deleteUser.gql'
import ToggleUserActiveMutation from '~/apollo/mutations/control-panel/user-management/toggleUserActive.gql'

import { GraphqlError, GraphqlQueryResponse } from '~/types/apollo-graphql-types'

import { RootState } from '~/store'
import { EnterpriseUser } from '~/types/types'
import { resolveNodes } from '~/utils/array'
import { GraphqlMutationResponse } from '~/types/apolloTypes'

export enum OrgUsersActions {
  FETCH_ORG_USERS_DATA = 'fetchOrgUsersData',
  FETCH_ORG_USER_GROUP_DATA = 'fetchOrgUserGroupData',
  FETCH_ORG_USER_TEAM_DATA = 'fetchOrgUserTeamData',
  REMOVE_USER_FROM_GROUP = 'removeUserFromGroup',
  DELETE_USER = 'deleteUser',
  TOGGLE_USER_ACTIVE = 'toggleUserActive'
}

export enum OrgUsersGetters {
  ORG_USERS_DATA = 'getOrgUsersData',
  ORG_USER_DATA = 'getOrgUserData'
}

export enum OrgUsersMutations {
  SET_ORG_USERS_DATA = 'setOrgUsersData',
  SET_ORG_USER_DATA = 'setOrgUserData',
  SET_ERROR = 'setError'
}

export interface OrgUsersModuleState {
  OrgUsersData: EnterpriseUser[]
  OrgUserData: EnterpriseUser
  error: GraphqlError | Record<string, unknown>
}

export const state = (): OrgUsersModuleState => ({
  ...(<OrgUsersModuleState>{
    OrgUsersData: [] as EnterpriseUser[],
    OrgUserData: {} as EnterpriseUser,
    isViewerSuperadmin: false,
    error: {}
  })
})

export type OrgUsersActionContext = ActionContext<OrgUsersModuleState, RootState>

export const getters: GetterTree<OrgUsersModuleState, RootState> = {
  [OrgUsersGetters.ORG_USERS_DATA]: (state) => {
    return state.OrgUsersData as EnterpriseUser[]
  },
  [OrgUsersGetters.ORG_USER_DATA]: (state) => {
    return state.OrgUserData as EnterpriseUser
  }
}
interface OrgUsersModuleMutations extends MutationTree<OrgUsersModuleState> {
  [OrgUsersMutations.SET_ORG_USERS_DATA]: (
    state: OrgUsersModuleState,
    OrgUsersData: EnterpriseUser[]
  ) => void
  [OrgUsersMutations.SET_ORG_USER_DATA]: (
    state: OrgUsersModuleState,
    OrgUserData: EnterpriseUser
  ) => void
  [OrgUsersMutations.SET_ERROR]: (state: OrgUsersModuleState, error: GraphqlError) => void
}

export const mutations: OrgUsersModuleMutations = {
  [OrgUsersMutations.SET_ORG_USERS_DATA]: (state, OrgUsersData) => {
    state.OrgUsersData = OrgUsersData
  },
  [OrgUsersMutations.SET_ORG_USER_DATA]: (state, OrgUserData) => {
    state.OrgUserData = Object.assign({}, state.OrgUserData, OrgUserData)
  },
  [OrgUsersMutations.SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  }
}

interface OrgUsersModuleActions extends ActionTree<OrgUsersModuleState, RootState> {
  [OrgUsersActions.FETCH_ORG_USERS_DATA]: (
    this: Store<RootState>,
    injectee: OrgUsersActionContext,
    args?: { q?: string; first?: number; offset?: number }
  ) => Promise<number>
  [OrgUsersActions.FETCH_ORG_USER_GROUP_DATA]: (
    this: Store<RootState>,
    injectee: OrgUsersActionContext,
    args: { id: string; q?: string; first?: number; offset?: number; refetch?: boolean }
  ) => Promise<void>
  [OrgUsersActions.FETCH_ORG_USER_TEAM_DATA]: (
    this: Store<RootState>,
    injectee: OrgUsersActionContext,
    args: { id: string; q?: string; first?: number; offset?: number; refetch?: boolean }
  ) => Promise<void>
  [OrgUsersActions.REMOVE_USER_FROM_GROUP]: (
    this: Store<RootState>,
    injectee: OrgUsersActionContext,
    args: { groupId: string; userId: string }
  ) => Promise<boolean>
  [OrgUsersActions.DELETE_USER]: (
    this: Store<RootState>,
    injectee: OrgUsersActionContext,
    args: { userId: string }
  ) => Promise<boolean>
  [OrgUsersActions.TOGGLE_USER_ACTIVE]: (
    this: Store<RootState>,
    injectee: OrgUsersActionContext,
    args: { userId: string; isActive: boolean }
  ) => Promise<boolean>
}

export const actions: OrgUsersModuleActions = {
  async [OrgUsersActions.FETCH_ORG_USERS_DATA]({ commit }, args) {
    try {
      const response = (await this.$fetchGraphqlData(OrgUsersQuery, args)) as GraphqlQueryResponse
      commit(OrgUsersMutations.SET_ORG_USERS_DATA, resolveNodes(response.data.enterprise?.users))
      if (response.data.enterprise?.users?.totalCount)
        return response.data.enterprise.users.totalCount
    } catch (e) {
      commit(OrgUsersMutations.SET_ERROR, e as GraphqlError)
    }
    return 0
  },
  async [OrgUsersActions.FETCH_ORG_USER_GROUP_DATA]({ commit }, args) {
    try {
      const response = (await this.$fetchGraphqlData(
        OrgUserGroupQuery,
        args,
        args.refetch
      )) as GraphqlQueryResponse
      commit(OrgUsersMutations.SET_ORG_USER_DATA, response.data.enterprise?.user)
    } catch (e) {
      commit(OrgUsersMutations.SET_ERROR, e as GraphqlError)
    }
  },
  async [OrgUsersActions.FETCH_ORG_USER_TEAM_DATA]({ commit }, args) {
    try {
      const response = (await this.$fetchGraphqlData(
        OrgUserTeamQuery,
        args,
        args.refetch
      )) as GraphqlQueryResponse
      commit(OrgUsersMutations.SET_ORG_USER_DATA, response.data.enterprise?.user)
    } catch (e) {
      commit(OrgUsersMutations.SET_ERROR, e as GraphqlError)
    }
  },
  async [OrgUsersActions.REMOVE_USER_FROM_GROUP]({ commit }, args) {
    try {
      const response = (await this.$applyGraphqlMutation(
        RemoveUserFromGroupMutation,
        args
      )) as GraphqlMutationResponse
      if (response.data?.removeUserFromGroup?.ok) {
        return true
      }
    } catch (e) {
      commit(OrgUsersMutations.SET_ERROR, e as GraphqlError)
    }
    return false
  },
  async [OrgUsersActions.DELETE_USER]({ commit }, args) {
    try {
      const response = (await this.$applyGraphqlMutation(
        DeleteUserMutation,
        args
      )) as GraphqlMutationResponse
      if (response.data?.deleteUser?.ok) {
        return true
      }
    } catch (e) {
      commit(OrgUsersMutations.SET_ERROR, e as GraphqlError)
    }
    return false
  },
  async [OrgUsersActions.TOGGLE_USER_ACTIVE]({ commit }, args) {
    try {
      const response = (await this.$applyGraphqlMutation(
        ToggleUserActiveMutation,
        args
      )) as GraphqlMutationResponse
      if (response.data?.toggleUserActive?.ok) {
        return true
      }
    } catch (e) {
      commit(OrgUsersMutations.SET_ERROR, e as GraphqlError)
    }
    return false
  }
}
