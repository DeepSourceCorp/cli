import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { DocumentNode } from 'graphql'
import { RootState } from '~/store'
import RepositoryRunGQLQuery from '~/apollo/queries/repository/runs/run/check/detail.gql'
import RunConcreteIssueListGQLQuery from '~/apollo/queries/repository/runs/run/check/concreteIssueList.gql'
import RunAutofixableIssuesGQLQuery from '~/apollo/queries/repository/runs/run/check/autofixableIssues.gql'
import {
  PageInfo,
  Maybe,
  IssueEdge,
  Check, IssueConnection, Issue
} from '~/types/types'

export const ACT_FETCH_RUN = 'fetchRun'
export const ACT_FETCH_CONCRETE_ISSUE_LIST = 'fetchConcreteIssueList'
export const ACT_SET_CONCRETE_ISSUE = 'setConcreteIssue'
export const ACT_FETCH_AUTOFIXABLE_ISSUES = 'fetchAutofixableIssues'

const MUT_SET_RUN = 'setRun';
const MUT_SET_CONCRETE_ISSUE_LIST = 'setConcreteIssueList';
const MUT_SET_CONCRETE_ISSUE = 'setConcreteIssue';

export const state = () => ({
  /**
   * Define state here.
   * For eg,
   * stateProp: 'this is a state property' as string
   */
  run: {} as Check,
  concreteIssueList: {
    pageInfo: {} as PageInfo,
    edges: [] as Array<Maybe<IssueEdge>>
  } as IssueConnection,
  concreteIssue: {} as Issue
})

export type RunModuleState = ReturnType<typeof state>

export const getters: GetterTree<RunModuleState, RootState> = {
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
  [MUT_SET_RUN]: (state: any, run: Check) => {
    state.run = Object.assign({}, state.run, run)
  },
  [MUT_SET_CONCRETE_ISSUE_LIST]: (state: any, concreteIssueList: IssueConnection) => {
    state.concreteIssueList = Object.assign({}, state.concreteIssueList, concreteIssueList)
  }
}

export const actions: ActionTree<RunModuleState, RootState> = {
  /**
   * Define actions here,
   * For eg,
   * async fetchThings({ commit }) {
   *  commit('CHANGE_STATE_PROP', 'New state property')
   * }
   */
  async [ACT_FETCH_RUN]({ commit }, args) {
    let response = await fetchGraphqlData(this, RepositoryRunGQLQuery, {
      checkId: args.checkId
    })
    commit(MUT_SET_RUN, response?.data.check)
  },
  async [ACT_FETCH_AUTOFIXABLE_ISSUES]({ commit }, args) {
    let response = await fetchGraphqlData(this, RunAutofixableIssuesGQLQuery, {
      checkId: args.checkId
    })
    commit(MUT_SET_RUN, response?.data.check)
  },
  async [ACT_FETCH_CONCRETE_ISSUE_LIST]({ commit }, args) {
    let response = await fetchGraphqlData(this, RunConcreteIssueListGQLQuery, {
      checkId: args.checkId
    })
    commit(MUT_SET_CONCRETE_ISSUE_LIST, response?.data.check.concreteIssues)
  },
  async [ACT_SET_CONCRETE_ISSUE]({ commit }, args) {
    commit(MUT_SET_CONCRETE_ISSUE, args)
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