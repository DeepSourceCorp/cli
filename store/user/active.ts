import { GetterTree, ActionTree, MutationTree, Store, ActionContext } from 'vuex'

import UpdateDefaultContextMutation from '~/apollo/mutations/user/updateDefaultContext.gql'
import UpdateStarredRepos from '~/apollo/mutations/user/updateStarredRepo.gql'
import UpdateUserDetails from '~/apollo/mutations/user/updateUserDetails.gql'
import DeleteUser from '~/apollo/mutations/user/deleteUser.gql'
import ActiveUserDetailGQLQuery from '~/apollo/queries/user/active/detail.gql'
import ActiveUserGitlabAccounts from '~/apollo/queries/user/active/userGitlabAccounts.gql'
import ActiveUserGSRProjects from '~/apollo/queries/user/active/userGSRProjects.gql'
import ActiveUserADSOrganizations from '~/apollo/queries/user/active/userADSOrganizations.gql'
import ActiveUserStarredRepos from '~/apollo/queries/user/active/starredRepos.gql'
import ActiveUserRecommendedIssues from '~/apollo/queries/user/active/recommendedIssues.gql'
import ActiveUserAccountInfo from '~/apollo/queries/user/active/accountInfo.gql'
import ActiveUserWorkspaces from '~/apollo/queries/user/active/workspaces.gql'

import { DeleteRequestingUserInput, UpdateUserDetailsInput, User } from '~/types/types'
import { RootState } from '~/store'

export interface ActiveUserState {
  viewer: User
}

export type ActiveUserActionContext = ActionContext<ActiveUserState, RootState>

export const state = (): ActiveUserState => ({
  ...(<ActiveUserState>{
    viewer: {}
  })
})

// Getters ------------------------------------------

export enum ActiveUserGetterTypes {
  GET_HOME_URL = 'getHomeUrl',
  GET_VIEWER = 'getViewer'
}

export const getters: GetterTree<ActiveUserState, RootState> = {
  [ActiveUserGetterTypes.GET_HOME_URL]: (activeUserState) => {
    // try returning the default context
    if (activeUserState.viewer.dashboardContext?.length) {
      const contextArray = activeUserState.viewer.dashboardContext.filter(
        (context: Record<string, string>) => {
          return context.is_default
        }
      )

      if (contextArray.length > 0) {
        return `/${contextArray[0].vcs_provider.toLowerCase()}/${contextArray[0].login}`
      }
    }

    // if not present, check for primary owner
    if (activeUserState.viewer.primaryOwner) {
      const vcsProvider: string = activeUserState.viewer.primaryOwner.vcsProvider.toLowerCase()
      return `/${vcsProvider}/${activeUserState.viewer.primaryOwner.login}`
    }

    // if there's no primary owner, send the first context
    if (activeUserState.viewer.dashboardContext?.length) {
      const ctx = activeUserState.viewer.dashboardContext[0]
      return `/${ctx.vcs_provider.toLowerCase()}/${ctx.login}`
    }

    // if all fails, that means there's no owner associated to the user,
    // send them to installation page
    return `/installation/providers`
  },
  [ActiveUserGetterTypes.GET_VIEWER]: (activeUserState) => {
    return activeUserState.viewer
  }
}

// Mutations ------------------------------------------

export enum ActiveUserMutations {
  SET_VIEWER = 'setViewer'
}

interface ActiveUserModuleMutations extends MutationTree<ActiveUserState> {
  [ActiveUserMutations.SET_VIEWER]: (activeUserState: ActiveUserState, viewer: User) => void
}

export const mutations: ActiveUserModuleMutations = {
  [ActiveUserMutations.SET_VIEWER]: (activeUserState, viewer) => {
    activeUserState.viewer = Object.assign({}, activeUserState.viewer, viewer)
  }
}

// Actions ------------------------------------------
export enum ActiveUserActions {
  FETCH_VIEWER_INFO = 'fetchViewerInfo',
  FETCH_STARRED_REPOS = 'fetchStarredRepos',
  FETCH_GITLAB_ACCOUNTS = 'fetchGitlabAccounts',
  FETCH_GSR_PROJECTS = 'fetchGSRProjects',
  FETCH_ADS_ORGANIZATIONS = 'fetchAdsOrganizations',
  FETCH_RECOMMENDED_ISSUES = 'fetchRecommendedIssues',
  UPDATE_STARRED_REPO = 'udpateStarredRepo',
  UPDATE_DEFAULT_CONTEXT = 'updateDefaultContext',
  FETCH_ACCOUNT_INFO = 'fetchAccountInfo',
  FETCH_WORKSPACES = 'fetchWorkspaces',
  UPDATE_USER_DETAILS = 'updateUserDetails',
  DELETE_USER = 'deleteUser'
}

interface ActiveUserModuleActions extends ActionTree<ActiveUserState, RootState> {
  [ActiveUserActions.FETCH_VIEWER_INFO]: (
    this: Store<RootState>,
    injectee: ActiveUserActionContext,
    args: {
      refetch?: boolean
    }
  ) => Promise<void>
  [ActiveUserActions.UPDATE_DEFAULT_CONTEXT]: (
    this: Store<RootState>,
    injectee: ActiveUserActionContext,
    args: {
      contextOwnerId: number
    }
  ) => Promise<void>
  [ActiveUserActions.FETCH_STARRED_REPOS]: (
    this: Store<RootState>,
    injectee: ActiveUserActionContext,
    args: {
      refetch?: boolean
    }
  ) => Promise<void>
  [ActiveUserActions.FETCH_GITLAB_ACCOUNTS]: (
    this: Store<RootState>,
    injectee: ActiveUserActionContext
  ) => Promise<void>
  [ActiveUserActions.FETCH_GSR_PROJECTS]: (
    this: Store<RootState>,
    injectee: ActiveUserActionContext
  ) => Promise<void>
  [ActiveUserActions.FETCH_ADS_ORGANIZATIONS]: (
    this: Store<RootState>,
    injectee: ActiveUserActionContext
  ) => Promise<void>
  [ActiveUserActions.UPDATE_STARRED_REPO]: (
    this: Store<RootState>,
    injectee: ActiveUserActionContext,
    args: {
      repoId: string
      action: 'ADD' | 'REMOVE'
    }
  ) => Promise<void>
  [ActiveUserActions.FETCH_RECOMMENDED_ISSUES]: (
    this: Store<RootState>,
    injectee: ActiveUserActionContext
  ) => Promise<void>
  [ActiveUserActions.FETCH_ACCOUNT_INFO]: (
    this: Store<RootState>,
    injectee: ActiveUserActionContext,
    args: {
      login: string
      isViewerPrimaryUser: boolean
      refetch?: boolean
    }
  ) => Promise<void>
  [ActiveUserActions.FETCH_WORKSPACES]: (
    this: Store<RootState>,
    injectee: ActiveUserActionContext,
    args: {
      login: string
      refetch?: boolean
    }
  ) => Promise<void>
  [ActiveUserActions.UPDATE_USER_DETAILS]: (
    this: Store<RootState>,
    injectee: ActiveUserActionContext,
    args: {
      input: UpdateUserDetailsInput
    }
  ) => Promise<User | undefined>
  [ActiveUserActions.DELETE_USER]: (
    this: Store<RootState>,
    injectee: ActiveUserActionContext,
    args: {
      input: DeleteRequestingUserInput
    }
  ) => Promise<boolean>
}

export const actions: ActiveUserModuleActions = {
  async [ActiveUserActions.FETCH_VIEWER_INFO]({ commit }, args) {
    try {
      const refetch = args ? args.refetch : false
      const response = await this.$fetchGraphqlData(ActiveUserDetailGQLQuery, {}, refetch)
      commit(ActiveUserMutations.SET_VIEWER, response.data.viewer)
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'Unable to fetch user, please contact support.')
    }
  },
  async [ActiveUserActions.UPDATE_DEFAULT_CONTEXT](_, args) {
    try {
      const response = await this.$applyGraphqlMutation(UpdateDefaultContextMutation, {
        contextOwnerId: args.contextOwnerId
      })
      return response
    } catch (e) {
      this.$logErrorAndToast(
        e as Error,
        'Unable to update default organization, please contact support.'
      )
    }
  },
  async [ActiveUserActions.FETCH_STARRED_REPOS]({ commit }, args) {
    const response = await this.$fetchGraphqlData(ActiveUserStarredRepos, {}, args?.refetch)
    commit(ActiveUserMutations.SET_VIEWER, response.data.viewer)
  },
  async [ActiveUserActions.FETCH_GITLAB_ACCOUNTS]({ commit }) {
    const response = await this.$fetchGraphqlData(ActiveUserGitlabAccounts, {}, true)
    commit(ActiveUserMutations.SET_VIEWER, response.data.viewer)
  },
  async [ActiveUserActions.FETCH_GSR_PROJECTS]({ commit }) {
    const response = await this.$fetchGraphqlData(ActiveUserGSRProjects, {}, true)
    commit(ActiveUserMutations.SET_VIEWER, response.data.viewer)
  },
  async [ActiveUserActions.FETCH_ADS_ORGANIZATIONS]({ commit }) {
    const response = await this.$fetchGraphqlData(ActiveUserADSOrganizations, {}, true)
    commit(ActiveUserMutations.SET_VIEWER, response.data.viewer)
  },
  async [ActiveUserActions.UPDATE_STARRED_REPO]({ dispatch }, { repoId, action }) {
    const res = await this.$applyGraphqlMutation(UpdateStarredRepos, { repoId, action })
    await dispatch(ActiveUserActions.FETCH_STARRED_REPOS, { refetch: true })
    return res.data.updateStarredRepository
  },
  async [ActiveUserActions.FETCH_RECOMMENDED_ISSUES]({ commit }) {
    const response = await this.$fetchGraphqlData(ActiveUserRecommendedIssues, {})
    commit(ActiveUserMutations.SET_VIEWER, response.data.viewer)
  },
  async [ActiveUserActions.FETCH_ACCOUNT_INFO]({ commit }, args) {
    const { login, isViewerPrimaryUser, refetch } = args

    const response = await this.$fetchGraphqlData(
      ActiveUserAccountInfo,
      { login, isViewerPrimaryUser },
      Boolean(refetch)
    )
    commit(ActiveUserMutations.SET_VIEWER, response.data.viewer)
  },
  async [ActiveUserActions.FETCH_WORKSPACES]({ commit }, args) {
    const { login, refetch } = args

    const response = await this.$fetchGraphqlData(ActiveUserWorkspaces, { login }, Boolean(refetch))
    commit(ActiveUserMutations.SET_VIEWER, response.data.viewer)
  },
  async [ActiveUserActions.UPDATE_USER_DETAILS]({ commit }, input) {
    try {
      const response = await this.$applyGraphqlMutation(UpdateUserDetails, { input })
      if (response?.data) {
        const { updateUserDetails } = response.data
        if (updateUserDetails.viewer && Object.keys(updateUserDetails.viewer).length) {
          commit(ActiveUserMutations.SET_VIEWER, updateUserDetails.viewer)
          return updateUserDetails.viewer
        }
      }
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'Unable to update user details, please contact support.')
    }
    return undefined
  },
  async [ActiveUserActions.DELETE_USER](_, input) {
    try {
      const response = await this.$applyGraphqlMutation(DeleteUser, { input })
      return Boolean(response?.data?.deleteRequestingUser?.ok)
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'Unable to delete user, please contact support.')
    }
    return false
  }
}
