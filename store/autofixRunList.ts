import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { DocumentNode } from 'graphql'
import { RootState } from '~/store'
import RepositoryAutofixRunListGQLQuery from '~/apollo/queries/repository/repositoryRuns/autofixRunList.gql'
import {
  Maybe,
  PageInfo,
  AutofixRunConnection,
  AutofixRunEdge
} from '~/types/types'
import {
  ACT_FETCH_AUTOFIX_RUN_LIST
} from '~/types/action-types';

const MUT_SET_AUTOFIX_RUN_LIST = 'setAutofixRunList';

export const state = () => ({
  /**
   * Define state here.
   * For eg,
   * stateProp: 'this is a state property' as string
   */
  autofixRunList: {
    pageInfo: {} as PageInfo,
    edges: [] as Array<Maybe<AutofixRunEdge>>
  } as AutofixRunConnection
})

export type AutofixRunListModuleState = ReturnType<typeof state>

export const getters: GetterTree<AutofixRunListModuleState, RootState> = {
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
  [MUT_SET_AUTOFIX_RUN_LIST]: (state: any, autofixRunList: AutofixRunConnection) => {
    state.autofixRunList = Object.assign({}, state.autofixRunList, autofixRunList)
  }
}

export const actions: ActionTree<AutofixRunListModuleState, RootState> = {
  /**
   * Define actions here,
   * For eg,
   * async fetchThings({ commit }) {
   *  commit('CHANGE_STATE_PROP', 'New state property')
   * }
   */
  async [ACT_FETCH_AUTOFIX_RUN_LIST]({ commit }, args) {
    let response = await fetchGraphqlData(this, RepositoryAutofixRunListGQLQuery, {
      provider: args.provider,
      owner: args.owner,
      name: args.name,
      after: args.after,
      limit: args.limit
    })
    commit(MUT_SET_AUTOFIX_RUN_LIST, response?.data.repository.autofixRuns)
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