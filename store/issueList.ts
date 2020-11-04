import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { DocumentNode } from 'graphql'
import { RootState } from '~/store'
import RepositoryIssuesListGQLQuery from '~/apollo/queries/repository/repositoryIssue/repositoryIssueList.gql'
import {
  RepositoryIssueConnection,
  Maybe,
  PageInfo,
  RepositoryIssueEdge
} from '~/types/types'
import {
  ACT_FETCH_ISSUE_LIST
} from '~/types/action-types';

const MUT_SET_ISSUE_LIST = 'setIssueList';

export const state = () => ({
  /**
   * Define state here.
   * For eg,
   * stateProp: 'this is a state property' as string
   */
  issueList: {
    pageInfo: {} as PageInfo,
    edges: [] as Array<Maybe<RepositoryIssueEdge>>,
  } as RepositoryIssueConnection
})

export type IssueListModuleState = ReturnType<typeof state>

export const getters: GetterTree<IssueListModuleState, RootState> = {
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
  [MUT_SET_ISSUE_LIST]: (state: any, issueList: RepositoryIssueConnection) => {
    state.issueList = Object.assign({}, state.issueList, issueList)
  }
}

export const actions: ActionTree<IssueListModuleState, RootState> = {
  /**
   * Define actions here,
   * For eg,
   * async fetchThings({ commit }) {
   *  commit('CHANGE_STATE_PROP', 'New state property')
   * }
   */
  async [ACT_FETCH_ISSUE_LIST]({ commit }, args) {
    let response = await fetchGraphqlData(this, RepositoryIssuesListGQLQuery, {
      provider: args.provider,
      owner: args.owner,
      name: args.name,
      after: args.after,
      issueType: args.issueType,
      analyzer: args.analyzer,
      sort: args.sort,
      q: args.q
    })
    commit(MUT_SET_ISSUE_LIST, response?.data.repository.issues)
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