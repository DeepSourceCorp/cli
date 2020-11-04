import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { RootState } from '~/store'
import { RepositoryConnection, PageInfo, Maybe, Scalars, VcsProviderChoices } from '~/types/types'
import RepositoryListGQLQuery from '~/apollo/queries/repositoryList/repositoryList.gql';
import { ACT_FETCH_REPOSITORY_LIST } from '~/types/action-types';

const MUT_SET_REPOSITORY_LIST = 'setRepositoryList';

export const state = () => ({
  /**
   * Define state here.
   * For eg,
   * stateProp: 'this is a state property' as string
   */
  repositoryList: {
    pageInfo: {} as PageInfo,
    totalCount: 0 as Maybe<Scalars['Int']>,
    edges: []
  } as RepositoryConnection
})

export type RepositoryListModuleState = ReturnType<typeof state>

export const getters: GetterTree<RepositoryListModuleState, RootState> = {
  /**
   * Define a getter here.
   * For eg,
   * statePropGetter: string => state.stateProp.toUpperCase()
   */
}

export const mutations: MutationTree<RootState> = {
  /**
   * Define mutation here.
   * For eg,
   * CHANGE_STATE_PROP: (state, newStateProp: string) => (state.stateProp = newStateProp)
   */
  [MUT_SET_REPOSITORY_LIST]: (state: any, repositoryList: RepositoryConnection) => {
    state.repositoryList = repositoryList
  }
}

export const actions: ActionTree<RepositoryListModuleState, RootState> = {
  /**
   * Define actions here,
   * For eg,
   * async fetchThings({ commit }) {
   *  commit('CHANGE_STATE_PROP', 'New state property')
   * }
   */
  async [ACT_FETCH_REPOSITORY_LIST]({ commit }, variables) {
    let client = this.app.apolloProvider?.defaultClient
    let response = await client?.query({
      query: RepositoryListGQLQuery,
      variables: {
        login: variables.login,
        provider: variables.provider,
        isActivated: variables.isActivated,
        limit: variables.limit,
        after: variables.after,
        query: variables.query
      }
    });
    commit(MUT_SET_REPOSITORY_LIST, response?.data.owner.repositories)
  }
}