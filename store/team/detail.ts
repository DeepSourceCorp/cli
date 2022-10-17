// Internal Types
import {
  GraphqlError,
  GraphqlMutationResponse,
  GraphqlQueryResponse
} from '~/types/apollo-graphql-types'
import { ActionTree, MutationTree, Store, ActionContext } from 'vuex'
import { RootState } from '~/store'
import { resolveNodes } from '~/utils/array'

// Apollo Types
import {
  Team,
  TeamBasePermissionSetDefaultRepositoryPermission,
  TeamMember,
  TeamMemberRoleChoices,
  TransferTeamOwnershipInput,
  UpdateTeamBasePermissionsPayload
} from '~/types/types'

// Queries
import TeamMembersListQuery from '~/apollo/queries/team/list.gql'
import TeamSettings from '~/apollo/queries/team/settings.gql'
import InvitedUsersListQuery from '~/apollo/queries/team/invites.gql'
import TeamInviteUrlQuery from '~/apollo/queries/team/inviteUrl.gql'
// import RecentActivityQuery from '~/apollo/queries/team/recentActivity.gql'

// Mutations
import inviteMembers from '~/apollo/mutations/team/inviteMembers.gql'
import inviteSingle from '~/apollo/mutations/team/inviteSingle.gql'
import removeMember from '~/apollo/mutations/team/removeMember.gql'
import transferOwnership from '~/apollo/mutations/team/transferOwnership.gql'
import resetTeamInviteLink from '~/apollo/mutations/team/resetTeamInviteLink.gql'
import updateRole from '~/apollo/mutations/team/updateRole.gql'

import UpdateAccessControlSettings from '~/apollo/mutations/team/updateAccessControlSettings.gql'
import UpdateTeamBasePermissions from '~/apollo/mutations/team/updateTeamBasePermissions.gql'
import SyncVcsPermissions from '~/apollo/mutations/team/syncVcsPermissions.gql'
import { LogErrorAndToastT } from '~/plugins/helpers/error'

export interface TeamState {
  loading: boolean
  error: Record<string, unknown>
  team: Team
}

export type TeamActionContext = ActionContext<TeamState, RootState>

export const state = (): TeamState => ({
  ...(<TeamState>{
    loading: false,
    error: {},
    team: {}
  })
})

// Mutations ------------------------------------------

export enum TeamMutations {
  SET_LOADING = 'setTeamActionsLoading',
  SET_ERROR = 'setTeamActionsError',
  SET_TEAM = 'setTeam'
}

export interface TeamActionsModuleMutations extends MutationTree<TeamState> {
  [TeamMutations.SET_LOADING]: (state: TeamState, value: boolean) => void
  [TeamMutations.SET_ERROR]: (state: TeamState, error: GraphqlError) => void
  [TeamMutations.SET_TEAM]: (state: TeamState, team: Team) => void
}

export const mutations: TeamActionsModuleMutations = {
  [TeamMutations.SET_LOADING]: (state, value) => {
    state.loading = value
  },
  [TeamMutations.SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  },
  [TeamMutations.SET_TEAM]: (state, team) => {
    state.team = Object.assign({}, state.team, team)
  }
}

// Actions ------------------------------------------
export enum TeamActions {
  FETCH_TEAM_INFO = 'fetchTeamInfo',
  FETCH_TEAM_SETTINGS = 'fetchTeamSettings',
  QUERY_TEAM_MEMBERS = 'queryTeamMembers',

  // Invitation
  FETCH_INVITED_USERS = 'fetchInvitedUsers',
  INVITE_MEMBERS = 'inviteMembers',
  INVITE_SINGLE = 'inviteSingle',
  CANCEL_INVITE = 'cancelInvite',

  // Modify Member
  REMOVE_MEMBER = 'removeMember',
  UPDATE_MEMBER_ROLE = 'updateMemberRole',
  TRANSFER_OWNERSHIP = 'transferOwnership',

  // Invite Links
  FETCH_INVITE_LINK = 'fetchInviteLink',
  RESET_INVITE_LINK = 'resetInviteLink',

  // Activity
  FETCH_RECENT_ACTIVITY = 'fetchRecentActivity',

  // Settings
  UPDATE_ACCESS_CONTROL_SETTINGS = 'updateAccessControlSettings',
  UPDATE_TEAM_BASE_PERMS = 'updateTeamBasePermissions',
  SYNC_VCS_PERMISSIONS = 'syncVcsPermissions'
}

export interface TeamModuleActions extends ActionTree<TeamState, RootState> {
  [TeamActions.FETCH_TEAM_INFO]: (
    this: Store<RootState>,
    injectee: TeamActionContext,
    args: {
      login: string
      provider: string
      limit: number
      currentPage: number
      query: string
      refetch?: boolean
    },
    refetch?: boolean
  ) => Promise<void>
  [TeamActions.FETCH_TEAM_SETTINGS]: (
    this: Store<RootState>,
    injectee: TeamActionContext,
    args: {
      login: string
      provider: string
      refetch?: boolean
    }
  ) => Promise<void>
  [TeamActions.QUERY_TEAM_MEMBERS]: (
    this: Store<RootState>,
    injectee: TeamActionContext,
    args: {
      login: string
      provider: string
      limit: number
      currentPage: number
      query: string
      refetch?: boolean
    },
    refetch?: boolean
  ) => Promise<Array<TeamMember> | undefined>
  [TeamActions.FETCH_INVITED_USERS]: (
    this: Store<RootState>,
    injectee: TeamActionContext,
    args: {
      login: string
      provider: string
      limit: number
      currentPage: number
    }
  ) => Promise<void>
  [TeamActions.UPDATE_MEMBER_ROLE]: (
    this: Store<RootState>,
    injectee: TeamActionContext,
    args: {
      ownerId: string
      email: string
      role: string
    }
  ) => Promise<void>
  [TeamActions.TRANSFER_OWNERSHIP]: (
    this: Store<RootState>,
    injectee: TeamActionContext,
    args: TransferTeamOwnershipInput
  ) => Promise<boolean>
  [TeamActions.REMOVE_MEMBER]: (
    this: Store<RootState>,
    injectee: TeamActionContext,
    args: {
      ownerId: string
      email: string
    }
  ) => Promise<void>
  [TeamActions.INVITE_MEMBERS]: (
    this: Store<RootState>,
    injectee: TeamActionContext,
    args: {
      ownerId: string
      invitees: string

      // params to refetch
      login: string
      provider: string
      limit: number
      currentPage: number
    }
  ) => Promise<void>
  [TeamActions.FETCH_INVITE_LINK]: (
    this: Store<RootState>,
    injectee: TeamActionContext,
    args: {
      login: string
      provider: string
      refetch?: boolean
    }
  ) => Promise<void>
  [TeamActions.RESET_INVITE_LINK]: (
    this: Store<RootState>,
    injectee: TeamActionContext,
    args: {
      ownerId: string
    }
  ) => Promise<void>
  // [TeamActions.FETCH_RECENT_ACTIVITY]: (
  //   this: Store<RootState>,
  //   injectee: TeamActionContext,
  //   args: {
  //     login: string
  //     provider: string
  //     limit: number
  //     currentPage: number
  //   }
  // ) => Promise<void>
  [TeamActions.UPDATE_ACCESS_CONTROL_SETTINGS]: (
    this: Store<RootState>,
    injectee: TeamActionContext,
    args: {
      teamId: string
      syncPermissionsWithVcs: boolean
    }
  ) => Promise<void>
  [TeamActions.UPDATE_TEAM_BASE_PERMS]: (
    this: Store<RootState>,
    injectee: TeamActionContext,
    args: {
      teamId: string
      defaultRepositoryPermission: TeamBasePermissionSetDefaultRepositoryPermission
      canMembersIgnoreIssues: boolean
      canContributorsIgnoreIssues: boolean
      canMembersModifyMetricThresholds: boolean
      canContributorsModifyMetricThresholds: boolean
      canMembersIgnoreFailingMetrics: boolean
      canContributorsIgnoreFailingMetrics: boolean
    }
  ) => Promise<UpdateTeamBasePermissionsPayload>
  [TeamActions.SYNC_VCS_PERMISSIONS]: (
    this: Store<RootState>,
    injectee: TeamActionContext,
    args: {
      teamId: string
    }
  ) => Promise<void>
  [TeamActions.INVITE_SINGLE]: (
    this: Store<RootState>,
    injectee: TeamActionContext,
    args: {
      ownerId: string
      email: string
      role: TeamMemberRoleChoices

      // params to refetch
      login: string
      provider: string
      limit: number
      currentPage: number
    }
  ) => Promise<void>
  [TeamActions.CANCEL_INVITE]: (
    this: Store<RootState>,
    injectee: TeamActionContext,
    args: {
      ownerId: string
      email: string

      // params to refetch
      login: string
      provider: string
      limit: number
      currentPage: number
    }
  ) => Promise<void>
}

export const actions: TeamModuleActions = {
  async [TeamActions.FETCH_TEAM_INFO](
    { commit },
    { login, provider, limit, currentPage, query, refetch }
  ) {
    try {
      commit(TeamMutations.SET_LOADING, true)
      const response: GraphqlQueryResponse = await this.$fetchGraphqlData(
        TeamMembersListQuery,
        {
          provider: this.$providerMetaMap[provider].value,
          after: this.$getGQLAfter(currentPage, limit),
          limit,
          login,
          query
        },
        refetch
      )
      commit(TeamMutations.SET_TEAM, response.data.team)
      commit(TeamMutations.SET_LOADING, false)
    } catch (e) {
      const error = e as GraphqlError
      commit(TeamMutations.SET_ERROR, error)
      commit(TeamMutations.SET_LOADING, false)
    }
  },
  async [TeamActions.FETCH_TEAM_SETTINGS]({ commit }, { login, provider, refetch }) {
    try {
      commit(TeamMutations.SET_LOADING, true)
      const response: GraphqlQueryResponse = await this.$fetchGraphqlData(
        TeamSettings,
        {
          provider: this.$providerMetaMap[provider].value,
          login
        },
        refetch
      )
      commit(TeamMutations.SET_TEAM, response.data.team)
      commit(TeamMutations.SET_LOADING, false)
    } catch (e) {
      const error = e as GraphqlError
      commit(TeamMutations.SET_ERROR, error)
      commit(TeamMutations.SET_LOADING, false)
    }
  },

  async [TeamActions.QUERY_TEAM_MEMBERS](
    _,
    { login, provider, limit, currentPage, query, refetch }
  ) {
    try {
      const response: GraphqlQueryResponse = await this.$fetchGraphqlData(
        TeamMembersListQuery,
        {
          provider: this.$providerMetaMap[provider].value,
          after: this.$getGQLAfter(currentPage, limit),
          limit,
          login,
          query
        },
        refetch
      )
      return resolveNodes(response.data.team?.members) as TeamMember[]
    } catch (e) {
      this.$logErrorAndToast(
        e as Error,
        (e as Error).message.replace('GraphQL error: ', '') as Parameters<LogErrorAndToastT>['1']
      )
    }
  },

  async [TeamActions.FETCH_INVITED_USERS]({ commit }, { login, provider, limit, currentPage }) {
    try {
      commit(TeamMutations.SET_LOADING, true)
      const response: GraphqlQueryResponse = await this.$fetchGraphqlData(InvitedUsersListQuery, {
        provider: this.$providerMetaMap[provider].value,
        after: this.$getGQLAfter(currentPage, limit),
        login,
        limit
      })
      commit(TeamMutations.SET_TEAM, response.data.team)
      commit(TeamMutations.SET_LOADING, false)
    } catch (e) {
      const error = e as GraphqlError
      commit(TeamMutations.SET_ERROR, error)
      commit(TeamMutations.SET_LOADING, false)
    }
  },

  async [TeamActions.UPDATE_MEMBER_ROLE]({ commit }, args) {
    try {
      commit(TeamMutations.SET_LOADING, true)
      await this.$applyGraphqlMutation(updateRole, {
        ownerPk: args.ownerId,
        email: args.email,
        role: args.role
      })
    } catch (e) {
      this.$toast.show({
        type: 'danger',
        message: (e as Error).message.replace('GraphQL error: ', ''),
        timeout: 5
      })
      commit(TeamMutations.SET_ERROR, e)
    } finally {
      commit(TeamMutations.SET_LOADING, false)
    }
  },

  async [TeamActions.REMOVE_MEMBER]({ commit }, args) {
    try {
      commit(TeamMutations.SET_LOADING, true)
      const response = (await this.$applyGraphqlMutation(removeMember, {
        ownerPk: args.ownerId,
        email: args.email
      })) as GraphqlMutationResponse
      if (response.data.removeTeamMember?.ok)
        this.$toast.success('Team member removed successfully.')
    } catch (e) {
      this.$toast.danger((e as Error).message.replace('GraphQL error: ', ''))
      commit(TeamMutations.SET_ERROR, e)
    } finally {
      commit(TeamMutations.SET_LOADING, false)
    }
  },

  async [TeamActions.TRANSFER_OWNERSHIP](_, args) {
    try {
      const response = (await this.$applyGraphqlMutation(transferOwnership, {
        input: args
      })) as GraphqlMutationResponse
      return response.data.transferTeamOwnership?.ok || false
    } catch (e) {
      this.$logErrorAndToast(
        e as Error,
        (e as Error).message.replace('GraphQL error: ', '') as Parameters<LogErrorAndToastT>['1']
      )
      return false
    }
  },

  async [TeamActions.INVITE_MEMBERS]({ commit, dispatch }, { ownerId, invitees, ...refetchArgs }) {
    commit(TeamMutations.SET_LOADING, true)
    const mutationArgs = { ownerId, invitees, action: 'CREATE' }

    const refetchParams = {
      provider: this.$providerMetaMap[refetchArgs.provider].value,
      after: this.$getGQLAfter(refetchArgs.currentPage, refetchArgs.limit),
      limit: refetchArgs.limit,
      login: refetchArgs.login
    }

    await this.$applyGraphqlMutation(inviteMembers, { input: mutationArgs })
    await this.$fetchGraphqlData(InvitedUsersListQuery, refetchParams, true)
    dispatch(TeamActions.FETCH_INVITED_USERS, refetchParams)
  },

  async [TeamActions.FETCH_INVITE_LINK]({ commit }, { login, provider, refetch }) {
    try {
      commit(TeamMutations.SET_LOADING, true)
      const response: GraphqlQueryResponse = await this.$fetchGraphqlData(
        TeamInviteUrlQuery,
        {
          provider: this.$providerMetaMap[provider].value,
          login
        },
        refetch
      )
      commit(TeamMutations.SET_TEAM, response.data.owner?.team)
      commit(TeamMutations.SET_LOADING, false)
    } catch (e) {
      const error = e as GraphqlError
      commit(TeamMutations.SET_ERROR, error)
      commit(TeamMutations.SET_LOADING, false)
    }
  },
  async [TeamActions.RESET_INVITE_LINK]({ commit }, { ownerId }) {
    try {
      commit(TeamMutations.SET_LOADING, true)
      const response = await this.$applyGraphqlMutation(resetTeamInviteLink, {
        input: { ownerId }
      })
      commit(TeamMutations.SET_TEAM, response.data.resetInvitationLink)
      commit(TeamMutations.SET_LOADING, false)
    } catch (e) {
      const error = e as GraphqlError
      commit(TeamMutations.SET_ERROR, error)
      commit(TeamMutations.SET_LOADING, false)
    }
  },

  // async [TeamActions.FETCH_RECENT_ACTIVITY]({ commit }, { login, provider, currentPage, limit }) {
  //   try {
  //     commit(TeamMutations.SET_LOADING, true)
  //     const response: GraphqlQueryResponse = await this.$fetchGraphqlData(RecentActivityQuery, {
  //       provider: this.$providerMetaMap[provider].value,
  //       after: this.$getGQLAfter(currentPage, limit),
  //       limit,
  //       login
  //     })
  //     commit(TeamMutations.SET_TEAM, response.data.team)
  //     commit(TeamMutations.SET_LOADING, false)
  //   } catch (e) {
  //     const error = e as GraphqlError
  //     commit(TeamMutations.SET_ERROR, error)
  //     commit(TeamMutations.SET_LOADING, false)
  //   }
  // },

  async [TeamActions.UPDATE_ACCESS_CONTROL_SETTINGS](
    { commit },
    { teamId, syncPermissionsWithVcs }
  ) {
    try {
      commit(TeamMutations.SET_LOADING, true)
      await this.$applyGraphqlMutation(UpdateAccessControlSettings, {
        teamId,
        syncPermissionsWithVcs
      })
      commit(TeamMutations.SET_LOADING, false)
    } catch (e) {
      const error = e as GraphqlError
      commit(TeamMutations.SET_ERROR, error)
      commit(TeamMutations.SET_LOADING, false)
    }
  },

  async [TeamActions.UPDATE_TEAM_BASE_PERMS](
    { commit },
    {
      teamId,
      defaultRepositoryPermission,
      canMembersIgnoreIssues,
      canContributorsIgnoreIssues,
      canMembersModifyMetricThresholds,
      canContributorsModifyMetricThresholds,
      canMembersIgnoreFailingMetrics,
      canContributorsIgnoreFailingMetrics
    }
  ) {
    try {
      commit(TeamMutations.SET_LOADING, true)
      const response = await this.$applyGraphqlMutation(UpdateTeamBasePermissions, {
        teamId,
        defaultRepositoryPermission,
        canMembersIgnoreIssues,
        canContributorsIgnoreIssues,
        canMembersModifyMetricThresholds,
        canContributorsModifyMetricThresholds,
        canMembersIgnoreFailingMetrics,
        canContributorsIgnoreFailingMetrics
      })
      commit(TeamMutations.SET_LOADING, false)
      return response.data?.updateTeamBasePermissions || {}
    } catch (e) {
      const error = e as GraphqlError
      commit(TeamMutations.SET_ERROR, error)
      commit(TeamMutations.SET_LOADING, false)
    }
  },

  async [TeamActions.SYNC_VCS_PERMISSIONS]({ commit }, { teamId }) {
    try {
      commit(TeamMutations.SET_LOADING, true)
      await this.$applyGraphqlMutation(SyncVcsPermissions, {
        teamId
      })
      commit(TeamMutations.SET_LOADING, false)
    } catch (e) {
      const error = e as GraphqlError
      commit(TeamMutations.SET_ERROR, error)
      commit(TeamMutations.SET_LOADING, false)
    }
  },

  async [TeamActions.INVITE_SINGLE](
    { commit, dispatch },
    { ownerId, role, email, ...refetchArgs }
  ) {
    try {
      commit(TeamMutations.SET_LOADING, true)
      const refetchParams = {
        provider: this.$providerMetaMap[refetchArgs.provider].value,
        after: this.$getGQLAfter(refetchArgs.currentPage, refetchArgs.limit),
        limit: refetchArgs.limit,
        login: refetchArgs.login
      }

      await this.$applyGraphqlMutation(inviteSingle, { ownerId, email, role, action: 'CREATE' })
      await this.$fetchGraphqlData(InvitedUsersListQuery, refetchParams, true)
      await dispatch(TeamActions.FETCH_INVITED_USERS, refetchParams)
    } catch (e) {
      commit(TeamMutations.SET_ERROR, e)
    } finally {
      commit(TeamMutations.SET_LOADING, false)
    }
  },

  async [TeamActions.CANCEL_INVITE]({ commit, dispatch }, { ownerId, email, ...refetchArgs }) {
    try {
      commit(TeamMutations.SET_LOADING, true)
      const role = 'CONTRIBUTOR'
      const action = 'CANCEL'

      const refetchParams = {
        provider: this.$providerMetaMap[refetchArgs.provider].value,
        after: this.$getGQLAfter(refetchArgs.currentPage, refetchArgs.limit),
        limit: refetchArgs.limit,
        login: refetchArgs.login
      }

      await this.$applyGraphqlMutation(inviteSingle, { ownerId, email, role, action })
      await this.$fetchGraphqlData(InvitedUsersListQuery, refetchParams, true)
      await dispatch(TeamActions.FETCH_INVITED_USERS, refetchParams)
    } catch (e) {
      commit(TeamMutations.SET_ERROR, e)
    } finally {
      commit(TeamMutations.SET_LOADING, false)
    }
  }
}
