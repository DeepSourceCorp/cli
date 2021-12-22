import { GetterTree, ActionTree, MutationTree, Store, ActionContext } from 'vuex'

import OrgGroupsQuery from '~/apollo/queries/control-panel/user-management/groups.gql'
import OrgGroupInvitesQuery from '~/apollo/queries/control-panel/user-management/invites.gql'
import AdddTeamQuery from '~/apollo/queries/control-panel/user-management/addTeam.gql'
import OrgGroupUserQuery from '~/apollo/queries/control-panel/user-management/groupAndUsers.gql'
import OrgGroupTeamQuery from '~/apollo/queries/control-panel/user-management/groupAndTeams.gql'

import CreateGroupMutation from '~/apollo/mutations/control-panel/user-management/createGroup.gql'
import UpdateGroupMutation from '~/apollo/mutations/control-panel/user-management/updateGroup.gql'
import RemoveTeamFromGroupMutation from '~/apollo/mutations/control-panel/user-management/removeTeamFromGroup.gql'
import DeleteGroupMutation from '~/apollo/mutations/control-panel/user-management/deleteGroup.gql'
import UpdateGroupTeamRoleMutation from '~/apollo/mutations/control-panel/user-management/updateGroupTeamRole.gql'
import AddTeamToGroupMutation from '~/apollo/mutations/control-panel/user-management/addTeamToGroup.gql'
import ResetGroupInviteMutation from '~/apollo/mutations/control-panel/user-management/resetGroupInvite.gql'

import { GraphqlError, GraphqlQueryResponse } from '~/types/apollo-graphql-types'

import { RootState } from '~/store'
import { EnterpriseGroup, TeamMemberRoleChoices } from '~/types/types'
import { resolveNodes } from '~/utils/array'
import { GraphqlMutationResponse } from '~/types/apolloTypes'

export enum OrgGroupsActions {
  FETCH_ORG_GROUPS_DATA = 'fetchOrgGroupsData',
  FETCH_ORG_GROUP_USER_DATA = 'fetchOrgGroupUserData',
  FETCH_ORG_GROUP_TEAM_DATA = 'fetchOrgGroupTeamData',
  REMOVE_TEAM_FROM_GROUP = 'removeTeamFromGroup',
  UPDATE_GROUP_TEAM_ROLE = 'updateGroupTeamRole',
  DELETE_GROUP = 'deleteGroup',
  CREATE_GROUP = 'createGroup',
  UPDATE_GROUP = 'updateGroup',
  FETCH_GROUP_INVITES = 'fetchGroupInvites',
  FETCH_TEAMS_TO_ADD = 'fetchTeamsToAdd',
  ADD_TEAM_TO_GROUP = 'addTeamToGroup',
  RESET_GROUP_INVITE = 'resetGroupInvite'
}

export enum OrgGroupsGetters {
  ORG_GROUPS_DATA = 'getOrgGroupsData',
  ORG_GROUP_INVITES_DATA = 'getOrgGroupInvitesData',
  TEAMS_TO_ADD = 'getTeamsToAdd',
  ORG_GROUP_DATA = 'getOrgUserData',
  ENTERPRISE_SCIM_ENABLED = 'getIsScimEnabled'
}

export enum OrgGroupsMutations {
  SET_ORG_GROUPS_DATA = 'setOrgGroupsData',
  SET_ORG_GROUP_DATA = 'setOrgUserData',
  SET_ORG_GROUP_INVITES_DATA = 'setOrgInvitesData',
  SET_TEAMS_TO_ADD = 'setTeamsToAdd',
  SET_ERROR = 'setError',
  SET_ENTERPRISE_SCIM_ENABLED = 'setEnterpriseScimEnabled'
}

export interface OrgGroupsModuleState {
  OrgGroupsData: EnterpriseGroup[]
  OrgGroupData: EnterpriseGroup
  OrgGroupInvitesData: EnterpriseGroup[]
  EnterpriseScimEnabled: boolean
  teamsToAdd: EnterpriseGroup
  error: GraphqlError | Record<string, unknown>
}

export const state = (): OrgGroupsModuleState => ({
  ...(<OrgGroupsModuleState>{
    OrgGroupsData: [] as EnterpriseGroup[],
    OrgGroupData: {} as EnterpriseGroup,
    OrgGroupInvitesData: [] as EnterpriseGroup[],
    teamsToAdd: {} as EnterpriseGroup,
    EnterpriseScimEnabled: false,
    error: {}
  })
})

export type OrgGroupsActionContext = ActionContext<OrgGroupsModuleState, RootState>

export const getters: GetterTree<OrgGroupsModuleState, RootState> = {
  [OrgGroupsGetters.ORG_GROUPS_DATA]: (state) => {
    return state.OrgGroupsData as EnterpriseGroup[]
  },
  [OrgGroupsGetters.ORG_GROUP_INVITES_DATA]: (state) => {
    return state.OrgGroupInvitesData as EnterpriseGroup[]
  },
  [OrgGroupsGetters.TEAMS_TO_ADD]: (state) => {
    return state.teamsToAdd as EnterpriseGroup
  },
  [OrgGroupsGetters.ORG_GROUP_DATA]: (state) => {
    return state.OrgGroupData as EnterpriseGroup
  },
  [OrgGroupsGetters.ENTERPRISE_SCIM_ENABLED]: (state) => {
    return state.EnterpriseScimEnabled || false
  }
}
interface OrgGroupsModuleMutations extends MutationTree<OrgGroupsModuleState> {
  [OrgGroupsMutations.SET_ORG_GROUPS_DATA]: (
    state: OrgGroupsModuleState,
    OrgGroupsData: EnterpriseGroup[]
  ) => void
  [OrgGroupsMutations.SET_ORG_GROUP_DATA]: (
    state: OrgGroupsModuleState,
    OrgGroupData: EnterpriseGroup
  ) => void
  [OrgGroupsMutations.SET_TEAMS_TO_ADD]: (
    state: OrgGroupsModuleState,
    teamsToAdd: EnterpriseGroup
  ) => void
  [OrgGroupsMutations.SET_ORG_GROUP_INVITES_DATA]: (
    state: OrgGroupsModuleState,
    OrgGroupInvitesData: EnterpriseGroup[]
  ) => void
  [OrgGroupsMutations.SET_ENTERPRISE_SCIM_ENABLED]: (
    state: OrgGroupsModuleState,
    EnterpriseScimEnabled: boolean
  ) => void
  [OrgGroupsMutations.SET_ERROR]: (state: OrgGroupsModuleState, error: GraphqlError) => void
}

export const mutations: OrgGroupsModuleMutations = {
  [OrgGroupsMutations.SET_ORG_GROUPS_DATA]: (state, OrgGroupsData) => {
    state.OrgGroupsData = OrgGroupsData
  },
  [OrgGroupsMutations.SET_TEAMS_TO_ADD]: (state, teamsToAdd) => {
    state.teamsToAdd = teamsToAdd
  },
  [OrgGroupsMutations.SET_ORG_GROUP_DATA]: (state, OrgGroupData) => {
    state.OrgGroupData = Object.assign({}, state.OrgGroupData, OrgGroupData)
  },
  [OrgGroupsMutations.SET_ORG_GROUP_INVITES_DATA]: (state, OrgGroupInvitesData) => {
    state.OrgGroupInvitesData = OrgGroupInvitesData
  },
  [OrgGroupsMutations.SET_ENTERPRISE_SCIM_ENABLED]: (state, EnterpriseScimEnabled) => {
    state.EnterpriseScimEnabled = EnterpriseScimEnabled
  },
  [OrgGroupsMutations.SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  }
}

interface OrgGroupsModuleActions extends ActionTree<OrgGroupsModuleState, RootState> {
  [OrgGroupsActions.FETCH_ORG_GROUPS_DATA]: (
    this: Store<RootState>,
    injectee: OrgGroupsActionContext,
    args?: { q?: string; first?: number; offset?: number; refetch?: boolean }
  ) => Promise<number>
  [OrgGroupsActions.FETCH_GROUP_INVITES]: (
    this: Store<RootState>,
    injectee: OrgGroupsActionContext,
    args?: { refetch?: boolean }
  ) => Promise<void>
  [OrgGroupsActions.FETCH_TEAMS_TO_ADD]: (
    this: Store<RootState>,
    injectee: OrgGroupsActionContext,
    args?: { groupId: string; q?: string; refetch?: boolean }
  ) => Promise<void>
  [OrgGroupsActions.FETCH_ORG_GROUP_USER_DATA]: (
    this: Store<RootState>,
    injectee: OrgGroupsActionContext,
    args: { id: string; q?: string; first?: number; offset?: number; refetch?: boolean }
  ) => Promise<void>
  [OrgGroupsActions.FETCH_ORG_GROUP_TEAM_DATA]: (
    this: Store<RootState>,
    injectee: OrgGroupsActionContext,
    args: { id: string; q?: string; first?: number; offset?: number; refetch?: boolean }
  ) => Promise<void>
  [OrgGroupsActions.REMOVE_TEAM_FROM_GROUP]: (
    this: Store<RootState>,
    injectee: OrgGroupsActionContext,
    args: { groupId: string; teamId: string }
  ) => Promise<boolean>
  [OrgGroupsActions.DELETE_GROUP]: (
    this: Store<RootState>,
    injectee: OrgGroupsActionContext,
    args: { groupId: string }
  ) => Promise<boolean>
  [OrgGroupsActions.UPDATE_GROUP_TEAM_ROLE]: (
    this: Store<RootState>,
    injectee: OrgGroupsActionContext,
    args: { groupId: string; teamId: string; role: TeamMemberRoleChoices }
  ) => Promise<boolean>
  [OrgGroupsActions.CREATE_GROUP]: (
    this: Store<RootState>,
    injectee: OrgGroupsActionContext,
    args: { groupName: string }
  ) => Promise<boolean>
  [OrgGroupsActions.UPDATE_GROUP]: (
    this: Store<RootState>,
    injectee: OrgGroupsActionContext,
    args: { groupId: string; groupName: string }
  ) => Promise<boolean>
  [OrgGroupsActions.ADD_TEAM_TO_GROUP]: (
    this: Store<RootState>,
    injectee: OrgGroupsActionContext,
    args: { groupId: string; teamId: string; role: TeamMemberRoleChoices }
  ) => Promise<boolean>
  [OrgGroupsActions.RESET_GROUP_INVITE]: (
    this: Store<RootState>,
    injectee: OrgGroupsActionContext,
    args: { groupId: string }
  ) => Promise<boolean>
}

export const actions: OrgGroupsModuleActions = {
  async [OrgGroupsActions.FETCH_ORG_GROUPS_DATA]({ commit }, args) {
    try {
      const response = (await this.$fetchGraphqlData(
        OrgGroupsQuery,
        args,
        args?.refetch
      )) as GraphqlQueryResponse
      commit(OrgGroupsMutations.SET_ORG_GROUPS_DATA, resolveNodes(response.data.enterprise?.groups))
      if (response.data.enterprise?.isScimEnabled) {
        commit(
          OrgGroupsMutations.SET_ENTERPRISE_SCIM_ENABLED,
          response.data.enterprise.isScimEnabled
        )
      }
      if (response.data.enterprise?.groups?.totalCount)
        return response.data.enterprise.groups.totalCount
    } catch (e) {
      commit(OrgGroupsMutations.SET_ERROR, e as GraphqlError)
    }
    return 0
  },
  async [OrgGroupsActions.FETCH_TEAMS_TO_ADD]({ commit }, args) {
    try {
      const response = (await this.$fetchGraphqlData(
        AdddTeamQuery,
        args,
        args?.refetch
      )) as GraphqlQueryResponse
      commit(OrgGroupsMutations.SET_TEAMS_TO_ADD, response.data.enterprise?.group)
    } catch (e) {
      commit(OrgGroupsMutations.SET_ERROR, e as GraphqlError)
    }
  },
  async [OrgGroupsActions.FETCH_GROUP_INVITES]({ commit }, args) {
    try {
      const response = (await this.$fetchGraphqlData(
        OrgGroupInvitesQuery,
        {},
        args?.refetch
      )) as GraphqlQueryResponse
      commit(
        OrgGroupsMutations.SET_ORG_GROUP_INVITES_DATA,
        resolveNodes(response.data.enterprise?.groups)
      )
    } catch (e) {
      commit(OrgGroupsMutations.SET_ERROR, e as GraphqlError)
    }
  },
  async [OrgGroupsActions.FETCH_ORG_GROUP_USER_DATA]({ commit }, args) {
    try {
      const response = (await this.$fetchGraphqlData(
        OrgGroupUserQuery,
        args,
        args.refetch
      )) as GraphqlQueryResponse
      commit(OrgGroupsMutations.SET_ORG_GROUP_DATA, response.data.enterprise?.group)
    } catch (e) {
      commit(OrgGroupsMutations.SET_ERROR, e as GraphqlError)
    }
  },
  async [OrgGroupsActions.FETCH_ORG_GROUP_TEAM_DATA]({ commit }, args) {
    try {
      const response = (await this.$fetchGraphqlData(
        OrgGroupTeamQuery,
        args,
        args.refetch
      )) as GraphqlQueryResponse
      commit(OrgGroupsMutations.SET_ORG_GROUP_DATA, response.data.enterprise?.group)
    } catch (e) {
      commit(OrgGroupsMutations.SET_ERROR, e as GraphqlError)
    }
  },
  async [OrgGroupsActions.REMOVE_TEAM_FROM_GROUP]({ commit }, args) {
    try {
      const response = (await this.$applyGraphqlMutation(
        RemoveTeamFromGroupMutation,
        args
      )) as GraphqlMutationResponse
      if (response.data?.removeTeamFromGroup?.ok) {
        return true
      }
    } catch (e) {
      commit(OrgGroupsMutations.SET_ERROR, e as GraphqlError)
    }
    return false
  },
  async [OrgGroupsActions.DELETE_GROUP]({ commit }, args) {
    try {
      const response = (await this.$applyGraphqlMutation(
        DeleteGroupMutation,
        args
      )) as GraphqlMutationResponse
      if (response.data?.deleteGroup?.ok) {
        return true
      }
    } catch (e) {
      commit(OrgGroupsMutations.SET_ERROR, e as GraphqlError)
    }
    return false
  },
  async [OrgGroupsActions.UPDATE_GROUP_TEAM_ROLE]({ commit }, args) {
    try {
      const response = (await this.$applyGraphqlMutation(
        UpdateGroupTeamRoleMutation,
        args
      )) as GraphqlMutationResponse
      if (response.data?.updateGroupTeamRole?.ok) {
        return true
      }
    } catch (e) {
      commit(OrgGroupsMutations.SET_ERROR, e as GraphqlError)
    }
    return false
  },
  async [OrgGroupsActions.CREATE_GROUP]({ commit }, args) {
    try {
      const response = (await this.$applyGraphqlMutation(
        CreateGroupMutation,
        args
      )) as GraphqlMutationResponse
      if (response.data?.createGroup?.group?.id) {
        return true
      }
    } catch (e) {
      commit(OrgGroupsMutations.SET_ERROR, e as GraphqlError)
    }
    return false
  },
  async [OrgGroupsActions.UPDATE_GROUP]({ commit }, args) {
    try {
      const response = (await this.$applyGraphqlMutation(
        UpdateGroupMutation,
        args
      )) as GraphqlMutationResponse
      if (response.data?.updateGroup?.ok) {
        return true
      }
    } catch (e) {
      commit(OrgGroupsMutations.SET_ERROR, e as GraphqlError)
    }
    return false
  },
  async [OrgGroupsActions.ADD_TEAM_TO_GROUP]({ commit }, args) {
    try {
      const response = (await this.$applyGraphqlMutation(
        AddTeamToGroupMutation,
        args
      )) as GraphqlMutationResponse
      if (response.data?.addTeamToGroup?.ok) {
        return true
      }
    } catch (e) {
      commit(OrgGroupsMutations.SET_ERROR, e as GraphqlError)
    }
    return false
  },
  async [OrgGroupsActions.RESET_GROUP_INVITE]({ commit }, args) {
    try {
      const response = (await this.$applyGraphqlMutation(
        ResetGroupInviteMutation,
        args
      )) as GraphqlMutationResponse
      if (response.data?.resetGroupInvitationLink?.invitationUrl) {
        return true
      }
    } catch (e) {
      commit(OrgGroupsMutations.SET_ERROR, e as GraphqlError)
    }
    return false
  }
}
