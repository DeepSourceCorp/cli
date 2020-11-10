import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { DocumentNode } from 'graphql'
import { RootState } from '~/store'
import RepositoryTransformerRunGQLQuery from '~/apollo/queries/transformerRunDetail.gql'
import {
  TransformerRun
} from '~/types/types'
import {
  ACT_FETCH_TRANSFORMER_RUN
} from '~/types/action-types';

const MUT_SET_TRANSFORMER_RUN = 'setAutofixRun';

export const state = () => ({
  /**
   * Define state here.
   * For eg,
   * stateProp: 'this is a state property' as string
   */
  transformerRun: {} as TransformerRun
})

export type TransformerRunModuleState = ReturnType<typeof state>

export const getters: GetterTree<TransformerRunModuleState, RootState> = {
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
  [MUT_SET_TRANSFORMER_RUN]: (state: any, transformerRun: TransformerRun) => {
    state.transformerRun = Object.assign({}, state.transformerRun, transformerRun)
  }
}

export const actions: ActionTree<TransformerRunModuleState, RootState> = {
  /**
   * Define actions here,
   * For eg,
   * async fetchThings({ commit }) {
   *  commit('CHANGE_STATE_PROP', 'New state property')
   * }
   */
  async [ACT_FETCH_TRANSFORMER_RUN]({ commit }, args) {
    let response = await fetchGraphqlData(this, RepositoryTransformerRunGQLQuery, {
      runId: args.runId
    })
    commit(MUT_SET_TRANSFORMER_RUN, response?.data.transformerRun)
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