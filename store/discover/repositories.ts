import { ActionContext, ActionTree, GetterTree, MutationTree, Store } from 'vuex'

import { RootState } from '~/store'
import { GraphqlError, GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import {
  Maybe,
  PageInfo,
  Repository,
  RepositoryConnection,
  RepositoryEdge,
  Scalars
} from '~/types/types'
import DiscoverRepositoriesGQLQuery from '~/apollo/queries/discover/discoverRepositories.gql'
import TrendingRepositoriesGQLQuery from '~/apollo/queries/discover/trendingRepositories.gql'
import EditorsPickRepositoryGQLQuery from '~/apollo/queries/discover/editorsPickRepository.gql'

export enum DiscoverRepoGetters {
  GET_DISCOVER_REPOSITORIES = 'getDiscoverRepositories',
  GET_TRENDING_REPOSITORIES = 'getTrendingRepositories',
  GET_EDITORS_PICK_REPOSITORY = 'getEditorsPickRepository'
}

export enum DiscoverRepoActions {
  FETCH_DISCOVER_REPOSITORIES = 'fetchDiscoverRepositories',
  FETCH_TRENDING_REPOSITORIES = 'fetchTrendingRepositories',
  FETCH_EDITORS_PICK_REPOSITORY = 'fetchEditorsPickRepository',
  SET_WATCHING_STATE = 'setWatchingState'
}

export enum DiscoverRepoMutations {
  SET_ERROR = 'setError',
  SET_DISCOVER_REPOSITORIES = 'setDiscoverRepositories',
  SET_TRENDING_REPOSITORIES = 'setTrendingRepositories',
  SET_EDITORS_PICK_REPOSITORY = 'setEditorsPickRepository'
}

export const state = () => ({
  error: {} as GraphqlError,
  discoverRepositories: {
    pageInfo: {} as PageInfo,
    totalCount: 0,
    edges: []
  } as Maybe<RepositoryConnection>,
  trendingRepositories: {
    pageInfo: {} as PageInfo,
    totalCount: 0,
    edges: []
  } as Maybe<RepositoryConnection>,
  editorsPickRepository: {
    name: '',
    recommendedIssueCount: 0,
    fullName: '',
    primaryAnalyzer: {}
  } as Maybe<Repository>
})

export type DiscoverRepoState = ReturnType<typeof state>

export const getters: GetterTree<DiscoverRepoState, RootState> = {
  [DiscoverRepoGetters.GET_DISCOVER_REPOSITORIES]: (state): Maybe<RepositoryConnection> => {
    return state.discoverRepositories
  },

  [DiscoverRepoGetters.GET_TRENDING_REPOSITORIES]: (state): Maybe<RepositoryConnection> => {
    return state.trendingRepositories
  },

  [DiscoverRepoGetters.GET_EDITORS_PICK_REPOSITORY]: (state): Maybe<Repository> => {
    return state.editorsPickRepository
  }
}

export type DiscoverRepoActionContext = ActionContext<DiscoverRepoState, RootState>

interface DiscoverRepoModuleMutations extends MutationTree<DiscoverRepoState> {
  [DiscoverRepoMutations.SET_ERROR]: (state: DiscoverRepoState, error: GraphqlError) => void

  [DiscoverRepoMutations.SET_DISCOVER_REPOSITORIES]: (
    state: DiscoverRepoState,
    discoverRepositories: Maybe<RepositoryConnection>
  ) => void

  [DiscoverRepoMutations.SET_TRENDING_REPOSITORIES]: (
    state: DiscoverRepoState,
    trendingRepositories: Maybe<RepositoryConnection>
  ) => void

  [DiscoverRepoMutations.SET_EDITORS_PICK_REPOSITORY]: (
    state: DiscoverRepoState,
    editorsPickRepository: Maybe<Repository>
  ) => void
}

export const mutations: DiscoverRepoModuleMutations = {
  [DiscoverRepoMutations.SET_ERROR]: (state: DiscoverRepoState, error) => {
    state.error = Object.assign({}, state.error, error)
  },

  [DiscoverRepoMutations.SET_DISCOVER_REPOSITORIES]: (
    state: DiscoverRepoState,
    discoverRepositories: Maybe<RepositoryConnection>
  ) => {
    state.discoverRepositories = Object.assign({}, state.discoverRepositories, discoverRepositories)
  },

  [DiscoverRepoMutations.SET_TRENDING_REPOSITORIES]: (
    state: DiscoverRepoState,
    trendingRepositories: Maybe<RepositoryConnection>
  ) => {
    state.trendingRepositories = Object.assign({}, state.trendingRepositories, trendingRepositories)
  },

  [DiscoverRepoMutations.SET_EDITORS_PICK_REPOSITORY]: (
    state: DiscoverRepoState,
    editorsPickRepository: Maybe<Repository>
  ) => {
    state.editorsPickRepository = Object.assign(
      {},
      state.editorsPickRepository,
      editorsPickRepository
    )
  }
}

interface DiscoverRepoModuleActions extends ActionTree<DiscoverRepoState, RootState> {
  [DiscoverRepoActions.FETCH_DISCOVER_REPOSITORIES]: (
    this: Store<RootState>,
    injectee: DiscoverRepoActionContext,
    args: {
      name_Icontains?: string
      preferredTechnologies?: Array<Scalars['ID']>
      limit?: number
      refetch?: boolean
    }
  ) => Promise<void>

  [DiscoverRepoActions.FETCH_TRENDING_REPOSITORIES]: (
    this: Store<RootState>,
    injectee: DiscoverRepoActionContext,
    args: {
      refetch?: boolean
    }
  ) => Promise<void>

  [DiscoverRepoActions.FETCH_EDITORS_PICK_REPOSITORY]: (
    this: Store<RootState>,
    injectee: DiscoverRepoActionContext,
    args: {
      refetch?: boolean
    }
  ) => Promise<void>

  [DiscoverRepoActions.SET_WATCHING_STATE]: (
    this: Store<RootState>,
    injectee: DiscoverRepoActionContext,
    args: {
      repoId: string
      isWatched: boolean
    }
  ) => void
}

export const actions: DiscoverRepoModuleActions = {
  async [DiscoverRepoActions.FETCH_DISCOVER_REPOSITORIES]({ commit }, args) {
    try {
      const response: GraphqlQueryResponse = await this.$fetchGraphqlData(
        DiscoverRepositoriesGQLQuery,
        {
          ...args,
          after: this.$getGQLAfter(1, args.limit ?? 100),
          first: args.limit ?? 100
        },
        args.refetch
      )
      commit(DiscoverRepoMutations.SET_DISCOVER_REPOSITORIES, response.data.discoverRepositories)
    } catch (e) {
      const error = e as GraphqlError
      commit(DiscoverRepoMutations.SET_ERROR, error)
    }
  },

  async [DiscoverRepoActions.FETCH_TRENDING_REPOSITORIES]({ commit }, args) {
    try {
      const refetch = args ? args.refetch : false
      const response: GraphqlQueryResponse = await this.$fetchGraphqlData(
        TrendingRepositoriesGQLQuery,
        args,
        refetch
      )
      commit(DiscoverRepoMutations.SET_TRENDING_REPOSITORIES, response.data.trendingRepositories)
    } catch (e) {
      const error = e as GraphqlError
      commit(DiscoverRepoMutations.SET_ERROR, error)
    }
  },

  async [DiscoverRepoActions.FETCH_EDITORS_PICK_REPOSITORY]({ commit }, args) {
    try {
      const refetch = args ? args.refetch : false
      const response: GraphqlQueryResponse = await this.$fetchGraphqlData(
        EditorsPickRepositoryGQLQuery,
        args,
        refetch
      )
      commit(DiscoverRepoMutations.SET_EDITORS_PICK_REPOSITORY, response.data.editorsPickRepository)
    } catch (e) {
      const error = e as GraphqlError
      commit(DiscoverRepoMutations.SET_ERROR, error)
    }
  },

  [DiscoverRepoActions.SET_WATCHING_STATE]({ commit, state }, args) {
    const updateFn = (edge: Maybe<RepositoryEdge>) => {
      if (edge?.node && edge.node.id === args.repoId) {
        edge.node.isWatched = args.isWatched
      }
      return edge
    }

    commit(
      DiscoverRepoMutations.SET_DISCOVER_REPOSITORIES,
      Object.assign({}, state.discoverRepositories, {
        edges: state.discoverRepositories?.edges.map(updateFn)
      })
    )

    commit(
      DiscoverRepoMutations.SET_TRENDING_REPOSITORIES,
      Object.assign({}, state.trendingRepositories, {
        edges: state.trendingRepositories?.edges.map(updateFn)
      })
    )

    if (state.editorsPickRepository?.id === args.repoId) {
      commit(
        DiscoverRepoMutations.SET_EDITORS_PICK_REPOSITORY,
        Object.assign({}, state.editorsPickRepository, {
          ...state.editorsPickRepository,
          isWatched: args.isWatched
        })
      )
    }
  }
}
