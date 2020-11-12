import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { DocumentNode } from 'graphql'
import { RootState } from '~/store'
import RepositoryAutofixRunGQLQuery from '~/apollo/queries/repository/runs/autofixRun/detail.gql'
import {
  AutofixRun
} from '~/types/types'

export const ACT_FETCH_AUTOFIX_RUN = 'fetchAutofixRun'

const MUT_SET_AUTOFIX_RUN = 'setAutofixRun';

export const state = () => ({
  /**
   * Define state here.
   * For eg,
   * stateProp: 'this is a state property' as string
   */
  autofixRun: {} as AutofixRun
})

export type AutofixRunModuleState = ReturnType<typeof state>

export const getters: GetterTree<AutofixRunModuleState, RootState> = {
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
  [MUT_SET_AUTOFIX_RUN]: (state: any, autofixRun: AutofixRun) => {
    state.autofixRun = Object.assign({}, state.autofixRun, autofixRun)
  }
}

export const actions: ActionTree<AutofixRunModuleState, RootState> = {
  /**
   * Define actions here,
   * For eg,
   * async fetchThings({ commit }) {
   *  commit('CHANGE_STATE_PROP', 'New state property')
   * }
   */
  async [ACT_FETCH_AUTOFIX_RUN]({ commit }, args) {
    let response = await fetchGraphqlData(this, RepositoryAutofixRunGQLQuery, {
      runId: args.runId
    })
    commit(MUT_SET_AUTOFIX_RUN, response?.data.autofixRun)
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