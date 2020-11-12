import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { DocumentNode } from 'graphql'
import { RootState } from '~/store'
import RepositoryRunListGQLQuery from '~/apollo/queries/repository/runs/run/list.gql'
import {
  Maybe,
  PageInfo,
  RunConnection,
  RunEdge
} from '~/types/types'

export const ACT_FETCH_RUN_LIST = 'fetchRunList'

const MUT_SET_RUN_LIST = 'setRunList';

export const state = () => ({
  /**
   * Define state here.
   * For eg,
   * stateProp: 'this is a state property' as string
   */
  runList: {
    pageInfo: {} as PageInfo,
    edges: [] as Array<Maybe<RunEdge>>
  } as RunConnection
})

export type RunListModuleState = ReturnType<typeof state>

export const getters: GetterTree<RunListModuleState, RootState> = {
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
  [MUT_SET_RUN_LIST]: (state: any, runList: RunConnection) => {
    state.runList = Object.assign({}, state.runList, runList)
  }
}

export const actions: ActionTree<RunListModuleState, RootState> = {
  /**
   * Define actions here,
   * For eg,
   * async fetchThings({ commit }) {
   *  commit('CHANGE_STATE_PROP', 'New state property')
   * }
   */
  async [ACT_FETCH_RUN_LIST]({ commit }, args) {
    let response = await fetchGraphqlData(this, RepositoryRunListGQLQuery, {
      provider: args.provider,
      owner: args.owner,
      name: args.name,
      after: args.after,
      limit: args.limit
    })
    commit(MUT_SET_RUN_LIST, response?.data.repository.runs)
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