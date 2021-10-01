import { ActionContext, ActionTree, GetterTree, MutationTree, Store } from 'vuex'

import { RootState } from '~/store'
import { GraphqlError, GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import {
  AnalyzerConnection,
  PageInfo,
  RepositoryConnection,
  UpdateTechnologyPreferenceInput
} from '~/types/types'

// Queries
import PreferredTechnologiesGQLQuery from '~/apollo/queries/discover/preferredTechnologies.gql'
import WatchedRepositoriesGQLQuery from '~/apollo/queries/discover/watchedRepositories.gql'

// Mutations
import UpdateTechnologyPreferenceGQLMutation from '~/apollo/mutations/discover/updateTechnologyPreference.gql'
import UpdateWatchedRepositoriesGQLMutation from '~/apollo/mutations/discover/updateWatchedRepositories.gql'

export enum DiscoverUserGetters {
  GET_PREFERRED_TECHNOLOGIES = 'getPreferredTechnologies',
  GET_WATCHED_REPOSITORIES = 'getWatchedRepositories'
}

export enum DiscoverUserActions {
  FETCH_PREFERRED_TECHNOLOGIES = 'fetchPreferredTechnologies',
  UPDATE_PREFERRED_TECHNOLOGIES = 'updatePreferredTechnologies',
  FETCH_WATCHED_REPOSITORIES = 'fetchWatchedRepositories',
  UPDATE_WATCHED_REPOSITORIES = 'updateWatchedRepositories'
}

export enum DiscoverUserMutations {
  SET_ERROR = 'setError',
  SET_PREFERRED_TECHNOLOGIES = 'setPreferredTechnologies',
  SET_WATCHED_REPOSITORIES = 'setWatchedRepositories'
}

export const state = () => ({
  error: {} as GraphqlError,
  preferredTechnologies: {
    pageInfo: {} as PageInfo,
    totalCount: 0,
    edges: []
  } as AnalyzerConnection,
  watchedRepositories: {
    pageInfo: {} as PageInfo,
    totalCount: 0,
    edges: []
  } as RepositoryConnection
})

export type DiscoverUserState = ReturnType<typeof state>

export const getters: GetterTree<DiscoverUserState, RootState> = {
  [DiscoverUserGetters.GET_PREFERRED_TECHNOLOGIES]: (state): AnalyzerConnection => {
    return state.preferredTechnologies
  },

  [DiscoverUserGetters.GET_WATCHED_REPOSITORIES]: (state): RepositoryConnection => {
    return state.watchedRepositories
  }
}

export type DiscoverUserActionContext = ActionContext<DiscoverUserState, RootState>

interface DiscoverUserModuleMutations extends MutationTree<DiscoverUserState> {
  [DiscoverUserMutations.SET_ERROR]: (state: DiscoverUserState, error: GraphqlError) => void

  [DiscoverUserMutations.SET_PREFERRED_TECHNOLOGIES]: (
    state: DiscoverUserState,
    preferredTechnologies: AnalyzerConnection
  ) => void

  [DiscoverUserMutations.SET_WATCHED_REPOSITORIES]: (
    state: DiscoverUserState,
    preferredTechnologies: RepositoryConnection
  ) => void
}

export const mutations: DiscoverUserModuleMutations = {
  [DiscoverUserMutations.SET_ERROR]: (state: DiscoverUserState, error) => {
    state.error = Object.assign({}, state.error, error)
  },

  [DiscoverUserMutations.SET_PREFERRED_TECHNOLOGIES]: (
    state: DiscoverUserState,
    preferredTechnologies: AnalyzerConnection
  ) => {
    state.preferredTechnologies = Object.assign(
      {},
      state.preferredTechnologies,
      preferredTechnologies
    )
  },

  [DiscoverUserMutations.SET_WATCHED_REPOSITORIES]: (
    state: DiscoverUserState,
    watchedRepositories: RepositoryConnection
  ) => {
    state.watchedRepositories = Object.assign({}, state.watchedRepositories, watchedRepositories)
  }
}

interface DiscoverUserModuleActions extends ActionTree<DiscoverUserState, RootState> {
  [DiscoverUserActions.FETCH_PREFERRED_TECHNOLOGIES]: (
    this: Store<RootState>,
    injectee: DiscoverUserActionContext,
    args: {
      refetch?: boolean
    }
  ) => Promise<void>

  [DiscoverUserActions.UPDATE_PREFERRED_TECHNOLOGIES]: (
    this: Store<RootState>,
    injectee: DiscoverUserActionContext,
    args: {
      input: UpdateTechnologyPreferenceInput
    }
  ) => Promise<void>

  [DiscoverUserActions.FETCH_WATCHED_REPOSITORIES]: (
    this: Store<RootState>,
    injectee: DiscoverUserActionContext,
    args: {
      refetch?: boolean
    }
  ) => Promise<void>

  [DiscoverUserActions.UPDATE_WATCHED_REPOSITORIES]: (
    this: Store<RootState>,
    injectee: DiscoverUserActionContext,
    args: {
      repoId: string
      action: 'ADD' | 'REMOVE'
    }
  ) => Promise<void>
}

export const actions: DiscoverUserModuleActions = {
  async [DiscoverUserActions.FETCH_PREFERRED_TECHNOLOGIES]({ commit }, args) {
    try {
      const refetch = args ? args.refetch : false
      const response: GraphqlQueryResponse = await this.$fetchGraphqlData(
        PreferredTechnologiesGQLQuery,
        args,
        refetch
      )

      const {
        data: { viewer }
      } = response
      commit(DiscoverUserMutations.SET_PREFERRED_TECHNOLOGIES, viewer?.preferredTechnologies)
    } catch (e) {
      const error = e as GraphqlError
      commit(DiscoverUserMutations.SET_ERROR, error)
    }
  },

  async [DiscoverUserActions.UPDATE_PREFERRED_TECHNOLOGIES]({ commit, dispatch }, { input }) {
    try {
      await this.$applyGraphqlMutation(UpdateTechnologyPreferenceGQLMutation, { input })
      await dispatch(DiscoverUserActions.FETCH_PREFERRED_TECHNOLOGIES, { refetch: true })
    } catch (e) {
      const error = e as GraphqlError
      commit(DiscoverUserMutations.SET_ERROR, error)
    }
  },

  async [DiscoverUserActions.FETCH_WATCHED_REPOSITORIES]({ commit }, args) {
    try {
      const refetch = args ? args.refetch : false
      const response: GraphqlQueryResponse = await this.$fetchGraphqlData(
        WatchedRepositoriesGQLQuery,
        args,
        refetch
      )

      const {
        data: { viewer }
      } = response
      commit(
        DiscoverUserMutations.SET_WATCHED_REPOSITORIES,
        viewer?.preference?.watchedRepositories
      )
    } catch (e) {
      const error = e as GraphqlError
      commit(DiscoverUserMutations.SET_ERROR, error)
    }
  },

  async [DiscoverUserActions.UPDATE_WATCHED_REPOSITORIES](
    { commit, dispatch },
    { repoId, action }
  ) {
    try {
      await this.$applyGraphqlMutation(UpdateWatchedRepositoriesGQLMutation, { repoId, action })
      dispatch(DiscoverUserActions.FETCH_WATCHED_REPOSITORIES, { refetch: true })
    } catch (e) {
      const error = e as GraphqlError
      commit(DiscoverUserMutations.SET_ERROR, error)
    }
  }
}
