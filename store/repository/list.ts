import { GetterTree, ActionTree, MutationTree, ActionContext, Store } from 'vuex'
import { RootState } from '~/store'
import { RepositoryConnection, PageInfo, Maybe, Scalars, Owner, Repository } from '~/types/types'
import RepositoryListGQLQuery from '~/apollo/queries/repository/list.gql'
import RecentlyActiveRepoList from '~/apollo/queries/repository/recentlyActiveRepoList.gql'
import recentlyActiveRepoListWithAnalyzer from '~/apollo/queries/repository/recentlyActiveRepoListWithAnalyzer.gql'
import RepositoryAdHocPending from '~/apollo/queries/repository/listAdHocPending.gql'
import { GraphqlError } from '~/types/apollo-graphql-types'
import { resolveNodes } from '~/utils/array'

export interface RepoInterface {
  id: string
  language: string
  isPrivate: boolean
  name: string
  supportedAnalyzers: Array<string>
}

export enum RepoListActions {
  FETCH_REPOSITORY_LIST = 'fetchRepositoryList',
  FETCH_PENDING_ADHOC_REPOSITORY_LIST = 'fetchRepositoryListWithPendingAdhocRun',
  FETCH_NEW_REPOSITORY_LIST = 'fetchNewRepoList',
  FETCH_ACTIVE_REPOSITORY_LIST = 'fetchActiveAnalysisRepositoryList',
  FETCH_ACTIVE_REPOSITORY_LIST_WITH_ANALYZERS = 'fetchActiveAnalysisRepositoryListWithAnalyzers'
}
export enum RepoListMutations {
  SET_ERROR = 'setRepositoryListError',
  SET_LOADING = 'setRepositoryListLoading',
  SET_REPOSITORY_LIST = 'setRepositoryList',
  SET_NEW_REPOSITORY_LIST = 'setNewRepoList',
  SET_ACTIVE_REPOSITORY_LIST = 'setActiveAnalysisRepositoryList',
  SET_ACTIVE_REPOSITORY_LIST_WITH_ANALYZERS = 'setActiveAnalysisRepositoryListWithAnalyzers',
  SET_ADHOC_RUN_REPOS = 'setRepoWithPendingAdhocRuns'
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
  repoWithActiveAnalysis: [] as Repository[],
  repoWithActiveAnalysisWithAnalyzers: [] as Repository[],
  repoWithPendingAdhocRuns: [] as Repository[]
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
  [RepoListMutations.SET_ACTIVE_REPOSITORY_LIST]: (
    state: RepositoryListModuleState,
    repositoryList: RepositoryConnection
  ) => void
  [RepoListMutations.SET_ACTIVE_REPOSITORY_LIST]: (
    state: RepositoryListModuleState,
    repositoryList: RepositoryConnection
  ) => void
  [RepoListMutations.SET_ACTIVE_REPOSITORY_LIST_WITH_ANALYZERS]: (
    state: RepositoryListModuleState,
    repositoryList: RepositoryConnection
  ) => void
  [RepoListMutations.SET_ADHOC_RUN_REPOS]: (
    state: RepositoryListModuleState,
    repoConnect: RepositoryConnection
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
  [RepoListMutations.SET_ACTIVE_REPOSITORY_LIST]: (state, repositoryList) => {
    state.repoWithActiveAnalysis = resolveNodes(repositoryList) as Repository[]
  },
  [RepoListMutations.SET_ACTIVE_REPOSITORY_LIST_WITH_ANALYZERS]: (state, repositoryList) => {
    state.repoWithActiveAnalysisWithAnalyzers = resolveNodes(repositoryList) as Repository[]
  },
  [RepoListMutations.SET_ADHOC_RUN_REPOS]: (state, repoConnect) => {
    state.repoWithPendingAdhocRuns = resolveNodes(repoConnect) as Repository[]
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
  [RepoListActions.FETCH_PENDING_ADHOC_REPOSITORY_LIST]: (
    this: Store<RootState>,
    injectee: RepositoryListActionContext,
    variables: {
      login: string
      provider: string
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
  [RepoListActions.FETCH_ACTIVE_REPOSITORY_LIST]: (
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
  async [RepoListActions.FETCH_PENDING_ADHOC_REPOSITORY_LIST](
    { commit },
    { login, provider, refetch }
  ) {
    try {
      const response = await this.$fetchGraphqlData(
        RepositoryAdHocPending,
        {
          login: login,
          provider: this.$providerMetaMap[provider].value
        },
        refetch
      )
      commit(RepoListMutations.SET_ADHOC_RUN_REPOS, response.data.owner.repositories)
    } catch (e) {
      const error = e as GraphqlError
      commit(RepoListMutations.SET_ERROR, error)
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
  async [RepoListActions.FETCH_ACTIVE_REPOSITORY_LIST]({ commit }, variables) {
    commit(RepoListMutations.SET_LOADING, true)
    try {
      const response: { data: { owner: Owner } } = await this.$fetchGraphqlData(
        RecentlyActiveRepoList,
        {
          login: variables.login,
          provider: this.$providerMetaMap[variables.provider].value,
          limit: variables.limit
        },
        variables.refetch
      )

      commit(RepoListMutations.SET_ACTIVE_REPOSITORY_LIST, response.data.owner.repositories)
      commit(RepoListMutations.SET_LOADING, false)
    } catch (e) {
      const error = e as GraphqlError
      commit(RepoListMutations.SET_ERROR, error)
      commit(RepoListMutations.SET_LOADING, false)
    }
  },
  async [RepoListActions.FETCH_ACTIVE_REPOSITORY_LIST_WITH_ANALYZERS]({ commit }, variables) {
    try {
      const response: { data: { owner: Owner } } = await this.$fetchGraphqlData(
        recentlyActiveRepoListWithAnalyzer,
        {
          login: variables.login,
          provider: this.$providerMetaMap[variables.provider].value,
          limit: variables.limit
        },
        variables.refetch
      )

      commit(
        RepoListMutations.SET_ACTIVE_REPOSITORY_LIST_WITH_ANALYZERS,
        response.data.owner.repositories
      )
    } catch (e) {
      const error = e as GraphqlError
      commit(RepoListMutations.SET_ERROR, error)
    }
  },
  async [RepoListActions.FETCH_ACTIVE_REPOSITORY_LIST_WITH_ANALYZERS]({ commit }, variables) {
    try {
      const response: { data: { owner: Owner } } = await this.$fetchGraphqlData(
        recentlyActiveRepoListWithAnalyzer,
        {
          login: variables.login,
          provider: this.$providerMetaMap[variables.provider].value,
          limit: variables.limit
        },
        variables.refetch
      )

      commit(
        RepoListMutations.SET_ACTIVE_REPOSITORY_LIST_WITH_ANALYZERS,
        response.data.owner.repositories
      )
    } catch (e) {
      const error = e as GraphqlError
      commit(RepoListMutations.SET_ERROR, error)
    }
  }
}
