import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { DocumentNode } from 'graphql'
import { RootState } from '~/store'
import RepositoryTransformerRunListGQLQuery from '~/apollo/queries/repository/repositoryRuns/transformerRunList.gql'
import {
  Maybe,
  PageInfo,
  TransformerRunConnection,
  TransformerRunEdge
} from '~/types/types'
import {
  ACT_FETCH_TRANSFORMER_RUN_LIST
} from '~/types/action-types';

const MUT_SET_TRANSFORMER_RUN_LIST = 'setTransformerRunList';

export const state = () => ({
  /**
   * Define state here.
   * For eg,
   * stateProp: 'this is a state property' as string
   */
  transformerRunList: {
    pageInfo: {} as PageInfo,
    edges: [] as Array<Maybe<TransformerRunEdge>>
  } as TransformerRunConnection
})

export type TransformerRunListModuleState = ReturnType<typeof state>

export const getters: GetterTree<TransformerRunListModuleState, RootState> = {
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
  [MUT_SET_TRANSFORMER_RUN_LIST]: (state: any, transformerRunList: TransformerRunConnection) => {
    state.transformerRunList = Object.assign({}, state.transformerRunList, transformerRunList)
  }
}

export const actions: ActionTree<TransformerRunListModuleState, RootState> = {
  /**
   * Define actions here,
   * For eg,
   * async fetchThings({ commit }) {
   *  commit('CHANGE_STATE_PROP', 'New state property')
   * }
   */
  async [ACT_FETCH_TRANSFORMER_RUN_LIST]({ commit }, args) {
    let response = await fetchGraphqlData(this, RepositoryTransformerRunListGQLQuery, {
      provider: args.provider,
      owner: args.owner,
      name: args.name,
      after: args.after,
      limit: args.limit
    })
    commit(MUT_SET_TRANSFORMER_RUN_LIST, response?.data.repository.transformerRuns)
  }
}

const fetchGraphqlData = async function (self: any, query: DocumentNode, variables: any) {
  /**
   * Abstracts graphql client code from actions.
   */
  let client = self.app.apolloProvider?.defaultClient
  return client?.query({
    query,
    variables
  });
}