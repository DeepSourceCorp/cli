import RepositoryIssueDetailGQLQuery from '~/apollo/queries/repository/issue/detail.gql'
import { GetterTree, ActionTree, MutationTree, ActionContext, Store } from 'vuex'
import { GraphqlError, GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { RepositoryIssue } from '~/types/types'
import { RootState } from '~/store'

export const ACT_FETCH_ISSUE = 'fetchIssue'

export const MUT_SET_LOADING = 'setIssueDetailLoading'
export const MUT_SET_ERROR = 'setIssueDetailError'
export const MUT_SET_ISSUE = 'setIssue'

export interface IssueDetailModuleState {
  loading: boolean,
  error: Record<string, any>,
  issue: RepositoryIssue
}

export const state = (): IssueDetailModuleState => ({
  ...<IssueDetailModuleState>({
    loading: false,
    error: {},
    issue: {}
  })
})

export type IssueDetailActionContext = ActionContext<IssueDetailModuleState, RootState>

export const getters: GetterTree<IssueDetailModuleState, RootState> = {}

interface IssueDetailModuleMutations extends MutationTree<IssueDetailModuleState> {
  [MUT_SET_LOADING]: (state: IssueDetailModuleState, value: boolean) => void;
  [MUT_SET_ERROR]: (state: IssueDetailModuleState, error: GraphqlError) => void;
  [MUT_SET_ISSUE]: (state: IssueDetailModuleState, issue: RepositoryIssue) => void;
}

export const mutations: IssueDetailModuleMutations = {
  [MUT_SET_LOADING]: (state, value) => {
    state.loading = value
  },
  [MUT_SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  },
  [MUT_SET_ISSUE]: (state: any, issue: RepositoryIssue) => {
    state.issue = Object.assign({}, state.issue, issue)
  }
}

interface IssueDetailModuleActions extends ActionTree<IssueDetailModuleState, RootState> {
  [ACT_FETCH_ISSUE]: (this: Store<RootState>, injectee: IssueDetailActionContext, args: {
    repositoryId: string,
    shortcode: string
  }) => Promise<void>;
}

export const actions: IssueDetailModuleActions = {
  async [ACT_FETCH_ISSUE]({ commit }, args) {
    commit(MUT_SET_LOADING, true)
    await this.$fetchGraphqlData(RepositoryIssueDetailGQLQuery, {
      repositoryId: args.repositoryId,
      shortcode: args.shortcode
    }).then((response: GraphqlQueryResponse) => {
      commit(MUT_SET_ISSUE, response.data.repository?.issue)
      commit(MUT_SET_LOADING, false)
    }).catch((e: GraphqlError) => {
      commit(MUT_SET_ERROR, e)
      commit(MUT_SET_LOADING, false)
    })
  }
}