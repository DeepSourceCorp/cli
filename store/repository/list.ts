import { GetterTree, ActionTree, MutationTree, ActionContext, Store } from 'vuex'
import { RootState } from '~/store'
import { RepositoryConnection, PageInfo, Maybe, Scalars, Owner } from '~/types/types'
import RepositoryListGQLQuery from '~/apollo/queries/repository/list.gql';
import { GraphqlError } from '~/types/apollo-graphql-types';

export const ACT_FETCH_REPOSITORY_LIST = 'fetchRepositoryList'

export const MUT_SET_ERROR = 'setRepositoryListError'
export const MUT_SET_LOADING = 'setRepositoryListLoading'
export const MUT_SET_REPOSITORY_LIST = 'setRepositoryList';

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
  [MUT_SET_LOADING]: (state: RepositoryListModuleState, value: boolean) => void;
  [MUT_SET_ERROR]: (state: RepositoryListModuleState, error: GraphqlError) => void;
  [MUT_SET_REPOSITORY_LIST]: (state: RepositoryListModuleState, repositoryList: RepositoryConnection) => void;
}

export const mutations: RepositoryListModuleMutations = {
  /**
   * Define mutation here.
   * For eg,
   * CHANGE_STATE_PROP: (state, newStateProp: string) => (state.stateProp = newStateProp)
   */
  [MUT_SET_LOADING]: (state, value) => {
    state.loading = value
  },
  [MUT_SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  },
  [MUT_SET_REPOSITORY_LIST]: (state, repositoryList) => {
    state.repositoryList = Object.assign({}, state.repositoryList, repositoryList)
  }
}

interface RepositoryListModuleActions extends ActionTree<RepositoryListModuleState, RootState> {
  [ACT_FETCH_REPOSITORY_LIST]: (this: Store<RootState>, injectee: RepositoryListActionContext, variables: {
    login: string,
    provider: string,
    isActivated: boolean,
    limit: number,
    currentPageNumber: number,
    query: string
  }) => Promise<void>;
}

export const actions: RepositoryListModuleActions = {
  /**
   * Define actions here,
   * For eg,
   * async fetchThings({ commit }) {
   *  commit('CHANGE_STATE_PROP', 'New state property')
   * }
   */
  async [ACT_FETCH_REPOSITORY_LIST]({ commit }, variables) {
    commit(MUT_SET_LOADING, true)
    await this.$fetchGraphqlData(RepositoryListGQLQuery, {
      login: variables.login,
      provider: this.$providerMetaMap[variables.provider].value,
      isActivated: variables.isActivated,
      limit: variables.limit,
      after: this.$getGQLAfter(variables.currentPageNumber, variables.limit),
      query: variables.query
    }).then((response: { data: { owner: Owner } }) => {
      // TODO: Toast("Successfully fetched repository list")
      commit(MUT_SET_REPOSITORY_LIST, response.data.owner.repositories)
      commit(MUT_SET_LOADING, false)
    }).catch((e: GraphqlError) => {
      commit(MUT_SET_ERROR, e)
      commit(MUT_SET_LOADING, false)
      // TODO: Toast("Failure in fetching repository list", e)
    })
  }
}