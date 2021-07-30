import { GetterTree, ActionTree, MutationTree, ActionContext, Store } from 'vuex'
import { RootState } from '~/store'
import { RepositoryConnection, PageInfo, Maybe, Scalars, Owner } from '~/types/types'
import RepositoryListGQLQuery from '~/apollo/queries/repository/list.gql'
import { GraphqlError } from '~/types/apollo-graphql-types'

export interface RepoInterface {
  id: string
  language: string
  isPrivate: boolean
  name: string
  supportedAnalyzers: Array<string>
}

export enum RepoListActions {
  FETCH_REPOSITORY_LIST = 'fetchRepositoryList',
  FETCH_NEW_REPOSITORY_LIST = 'fetchNewRepoList',
  FETCH_ACTIVE_ANALYSIS_REPOSITORY_LIST = 'fetchActiveAnalysisRepositoryList'
}
export enum RepoListMutations {
  SET_ERROR = 'setRepositoryListError',
  SET_LOADING = 'setRepositoryListLoading',
  SET_REPOSITORY_LIST = 'setRepositoryList',
  SET_NEW_REPOSITORY_LIST = 'setNewRepoList',
  SET_ACTIVE_ANALYSIS_REPOSITORY_LIST = 'setActiveAnalysisRepositoryList'
}

export const state = () => ({
  /**
   * Define state here.
   * For eg,
   * stateProp: 'this is a state property' as string
   */
  loading: false as boolean,
  error: {},
  repositoryList: {
    pageInfo: {} as PageInfo,
    totalCount: 0 as Maybe<Scalars['Int']>,
    edges: []
  } as RepositoryConnection,
  newRepos: {
    pageInfo: {} as PageInfo,
    totalCount: 0 as Maybe<Scalars['Int']>,
    edges: []
  } as RepositoryConnection,
  repoWithActiveAnalysis: {
    pageInfo: {} as PageInfo,
    totalCount: 0 as Maybe<Scalars['Int']>,
    edges: []
  } as RepositoryConnection
})

export type RepositoryListModuleState = ReturnType<typeof state>
export type RepositoryListActionContext = ActionContext<RepositoryListModuleState, RootState>

export const getters: GetterTree<RepositoryListModuleState, RootState> = {
  /**
   * Define a getter here.
   * For eg,
   * statePropGetter: string => state.stateProp.toUpperCase()
   */
}

interface RepositoryListModuleMutations extends MutationTree<RepositoryListModuleState> {
  [RepoListMutations.SET_LOADING]: (state: RepositoryListModuleState, value: boolean) => void
  [RepoListMutations.SET_ERROR]: (state: RepositoryListModuleState, error: GraphqlError) => void
  [RepoListMutations.SET_REPOSITORY_LIST]: (
    state: RepositoryListModuleState,
    repositoryList: RepositoryConnection
  ) => void
  [RepoListMutations.SET_NEW_REPOSITORY_LIST]: (
    state: RepositoryListModuleState,
    repositoryList: RepositoryConnection
  ) => void
  [RepoListMutations.SET_ACTIVE_ANALYSIS_REPOSITORY_LIST]: (
    state: RepositoryListModuleState,
    repositoryList: RepositoryConnection
  ) => void
}

export const mutations: RepositoryListModuleMutations = {
  /**
   * Define mutation here.
   * For eg,
   * CHANGE_STATE_PROP: (state, newStateProp: string) => (state.stateProp = newStateProp)
   */
  [RepoListMutations.SET_LOADING]: (state, value) => {
    state.loading = value
  },
  [RepoListMutations.SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  },
  [RepoListMutations.SET_REPOSITORY_LIST]: (state, repositoryList) => {
    state.repositoryList = Object.assign({}, state.repositoryList, repositoryList)
  },
  [RepoListMutations.SET_NEW_REPOSITORY_LIST]: (state, repositoryList) => {
    state.newRepos = Object.assign({}, state.repositoryList, repositoryList)
  },
  [RepoListMutations.SET_ACTIVE_ANALYSIS_REPOSITORY_LIST]: (state, repositoryList) => {
    state.repoWithActiveAnalysis = Object.assign({}, state.repositoryList, repositoryList)
  }
}

interface RepositoryListModuleActions extends ActionTree<RepositoryListModuleState, RootState> {
  [RepoListActions.FETCH_REPOSITORY_LIST]: (
    this: Store<RootState>,
    injectee: RepositoryListActionContext,
    variables: {
      login: string
      provider: string
      limit: number
      currentPageNumber: number
      query: string
      refetch?: boolean
    }
  ) => Promise<void>
  [RepoListActions.FETCH_NEW_REPOSITORY_LIST]: (
    this: Store<RootState>,
    injectee: RepositoryListActionContext,
    variables: {
      login: string
      provider: string
      limit: number
      currentPageNumber: number
      query: string
    }
  ) => Promise<void>
  [RepoListActions.FETCH_ACTIVE_ANALYSIS_REPOSITORY_LIST]: (
    this: Store<RootState>,
    injectee: RepositoryListActionContext,
    variables: {
      login: string
      provider: string
      limit: number
      refetch?: boolean
    }
  ) => Promise<void>
}

export const actions: RepositoryListModuleActions = {
  /**
   * Define actions here,
   * For eg,
   * async fetchThings({ commit }) {
   *  commit('CHANGE_STATE_PROP', 'New state property')
   * }
   */
  async [RepoListActions.FETCH_REPOSITORY_LIST](
    { commit },
    { login, provider, limit, currentPageNumber, query, refetch }
  ) {
    commit(RepoListMutations.SET_LOADING, true)
    try {
      const response: { data: { owner: Owner } } = await this.$fetchGraphqlData(
        RepositoryListGQLQuery,
        {
          login: login,
          provider: this.$providerMetaMap[provider].value,
          isActivated: true,
          limit: limit,
          after: this.$getGQLAfter(currentPageNumber, limit),
          query: query
        },
        refetch
      )

      commit(RepoListMutations.SET_REPOSITORY_LIST, response.data.owner.repositories)
      commit(RepoListMutations.SET_LOADING, false)
    } catch (e) {
      const error = e as GraphqlError
      commit(RepoListMutations.SET_ERROR, error)
      commit(RepoListMutations.SET_LOADING, false)
    }
  },
  async [RepoListActions.FETCH_NEW_REPOSITORY_LIST]({ commit }, variables) {
    commit(RepoListMutations.SET_LOADING, true)
    try {
      const response: { data: { owner: Owner } } = await this.$fetchGraphqlData(
        RepositoryListGQLQuery,
        {
          login: variables.login,
          provider: this.$providerMetaMap[variables.provider].value,
          isActivated: false,
          limit: variables.limit,
          after: this.$getGQLAfter(variables.currentPageNumber, variables.limit),
          query: variables.query
        }
      )

      commit(RepoListMutations.SET_NEW_REPOSITORY_LIST, response.data.owner.repositories)
      commit(RepoListMutations.SET_LOADING, false)
    } catch (e) {
      const error = e as GraphqlError
      commit(RepoListMutations.SET_ERROR, error)
      commit(RepoListMutations.SET_LOADING, false)
    }
  },
  async [RepoListActions.FETCH_ACTIVE_ANALYSIS_REPOSITORY_LIST]({ commit }, variables) {
    commit(RepoListMutations.SET_LOADING, true)
    try {
      const response: { data: { owner: Owner } } = await this.$fetchGraphqlData(
        RepositoryListGQLQuery,
        {
          login: variables.login,
          provider: this.$providerMetaMap[variables.provider].value,
          isActivated: true,
          limit: variables.limit
        },
        variables.refetch
      )

      commit(
        RepoListMutations.SET_ACTIVE_ANALYSIS_REPOSITORY_LIST,
        response.data.owner.repositories
      )
      commit(RepoListMutations.SET_LOADING, false)
    } catch (e) {
      const error = e as GraphqlError
      commit(RepoListMutations.SET_ERROR, error)
      commit(RepoListMutations.SET_LOADING, false)
    }
  }
}
