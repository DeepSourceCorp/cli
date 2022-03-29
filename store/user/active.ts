import { GetterTree, ActionTree, MutationTree, Store, ActionContext } from 'vuex'

import UpdateDefaultContextMutation from '~/apollo/mutations/user/updateDefaultContext.gql'
import UpdateStarredRepos from '~/apollo/mutations/user/updateStarredRepo.gql'

import ActiveUserDetailGQLQuery from '~/apollo/queries/user/active/detail.gql'
import ActiveUserGitlabAccounts from '~/apollo/queries/user/active/userGitlabAccounts.gql'
import ActiveUserGSRProjects from '~/apollo/queries/user/active/userGSRProjects.gql'
import ActiveUserStarredRepos from '~/apollo/queries/user/active/starredRepos.gql'
import ActiveUserRecommendedIssues from '~/apollo/queries/user/active/recommendedIssues.gql'

import { User } from '~/types/types'
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
  [ActiveUserGetterTypes.GET_HOME_URL]: (state) => {
    // try returning the default context
    if (state.viewer.dashboardContext?.length) {
      const contextArray = state.viewer.dashboardContext.filter(
        (context: Record<string, string>) => {
          return context.is_default
        }
      )

      if (contextArray.length > 0) {
        return `/${contextArray[0].vcs_provider.toLowerCase()}/${contextArray[0].login}`
      }
    }

    // if not present, check for primary owner
    if (state.viewer.primaryOwner) {
      const vcsProvider: string = state.viewer.primaryOwner.vcsProvider.toLowerCase()
      return `/${vcsProvider}/${state.viewer.primaryOwner.login}`
    }

    // if there's no primary owner, send the first context
    if (state.viewer.dashboardContext?.length) {
      const ctx = state.viewer.dashboardContext[0]
      return `/${ctx.vcs_provider.toLowerCase()}/${ctx.login}`
    }

    // if all fails, that means there's no owner associated to the user,
    // send them to installation page
    return `/installation/providers`
  },
  [ActiveUserGetterTypes.GET_VIEWER]: (state) => {
    return state.viewer
  }
}

// Mutations ------------------------------------------

export enum ActiveUserMutations {
  SET_VIEWER = 'setViewer'
}

interface ActiveUserModuleMutations extends MutationTree<ActiveUserState> {
  [ActiveUserMutations.SET_VIEWER]: (state: ActiveUserState, viewer: User) => void
}

export const mutations: ActiveUserModuleMutations = {
  [ActiveUserMutations.SET_VIEWER]: (state, viewer) => {
    state.viewer = Object.assign({}, state.viewer, viewer)
  }
}

// Actions ------------------------------------------
export enum ActiveUserActions {
  FETCH_VIEWER_INFO = 'fetchViewerInfo',
  FETCH_STARRED_REPOS = 'fetchStarredRepos',
  FETCH_GITLAB_ACCOUNTS = 'fetchGitlabAccounts',
  FETCH_GSR_PROJECTS = 'fetchGSRProjects',
  FETCH_RECOMMENDED_ISSUES = 'fetchRecommendedIssues',
  UPDATE_STARRED_REPO = 'udpateStarredRepo',
  UPDATE_DEFAULT_CONTEXT = 'updateDefaultContext'
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
}

export const actions: ActiveUserModuleActions = {
  async [ActiveUserActions.FETCH_VIEWER_INFO]({ commit }, args) {
    const refetch = args ? args.refetch : false
    try {
      const response = await this.$fetchGraphqlData(ActiveUserDetailGQLQuery, {}, refetch)
      commit(ActiveUserMutations.SET_VIEWER, response.data.viewer)
    } catch (e) {}
  },
  async [ActiveUserActions.UPDATE_DEFAULT_CONTEXT](_, args) {
    try {
      const response = await this.$applyGraphqlMutation(UpdateDefaultContextMutation, {
        contextOwnerId: args.contextOwnerId
      })
      return response
    } catch (e) {}
  },
  async [ActiveUserActions.FETCH_STARRED_REPOS]({ commit }, args) {
    try {
      const response = await this.$fetchGraphqlData(ActiveUserStarredRepos, {}, args?.refetch)
      commit(ActiveUserMutations.SET_VIEWER, response.data.viewer)
    } catch (e) {}
  },
  async [ActiveUserActions.FETCH_GITLAB_ACCOUNTS]({ commit }) {
    try {
      const response = await this.$fetchGraphqlData(ActiveUserGitlabAccounts, {}, true)
      commit(ActiveUserMutations.SET_VIEWER, response.data.viewer)
    } catch (e) {}
  },
  async [ActiveUserActions.FETCH_GSR_PROJECTS]({ commit }) {
    const response = await this.$fetchGraphqlData(ActiveUserGSRProjects, {}, true)
    commit(ActiveUserMutations.SET_VIEWER, response.data.viewer)
  },
  async [ActiveUserActions.UPDATE_STARRED_REPO]({ dispatch }, { repoId, action }) {
    try {
      const res = await this.$applyGraphqlMutation(UpdateStarredRepos, { repoId, action })
      await dispatch(ActiveUserActions.FETCH_STARRED_REPOS, { refetch: true })
      return res.data.updateStarredRepository
    } catch (e) {}
  },
  async [ActiveUserActions.FETCH_RECOMMENDED_ISSUES]({ commit }) {
    try {
      const response = await this.$fetchGraphqlData(ActiveUserRecommendedIssues, {})
      commit(ActiveUserMutations.SET_VIEWER, response.data.viewer)
    } catch (e) {}
  }
}
