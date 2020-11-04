import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { DocumentNode } from 'graphql'
import { RootState } from '~/store'
import RepositoryIssueDetailGQLQuery from '~/apollo/queries/repository/repositoryIssue/repositoryIssueDetail.gql'
import {
  RepositoryIssue
} from '~/types/types'
import {
  ACT_FETCH_ISSUE
} from '~/types/action-types';

const MUT_SET_ISSUE = 'setIssue';

export const state = () => ({
  /**
   * Define state here.
   * For eg,
   * stateProp: 'this is a state property' as string
   */
  issue: {} as RepositoryIssue
})

export type IssueModuleState = ReturnType<typeof state>

export const getters: GetterTree<IssueModuleState, RootState> = {
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
  [MUT_SET_ISSUE]: (state: any, issue: RepositoryIssue) => {
    state.issue = Object.assign({}, state.issue, issue)
  }
}

export const actions: ActionTree<IssueModuleState, RootState> = {
  /**
   * Define actions here,
   * For eg,
   * async fetchThings({ commit }) {
   *  commit('CHANGE_STATE_PROP', 'New state property')
   * }
   */
  async [ACT_FETCH_ISSUE]({ commit }, args) {
    let response = await fetchGraphqlData(this, RepositoryIssueDetailGQLQuery, {
      repositoryId: args.repositoryId,
      shortcode: args.shortcode
    })
    console.log(response)
    commit(MUT_SET_ISSUE, response?.data.repository.issue)
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