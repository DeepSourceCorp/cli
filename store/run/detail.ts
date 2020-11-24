import RunConcreteIssueListGQLQuery from '~/apollo/queries/repository/runs/run/check/concreteIssueList.gql'
import RunAutofixableIssuesGQLQuery from '~/apollo/queries/repository/runs/run/check/autofixableIssues.gql'
import RepositoryRunGQLQuery from '~/apollo/queries/repository/runs/run/check/detail.gql'
import { PageInfo, Maybe, IssueEdge, Check, IssueConnection } from '~/types/types'
import { GetterTree, ActionTree, MutationTree, ActionContext, Store } from 'vuex'
import { GraphqlError, GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { RootState } from '~/store'

export const ACT_FETCH_RUN = 'fetchRun'
export const ACT_FETCH_CONCRETE_ISSUE_LIST = 'fetchConcreteIssueList'
export const ACT_SET_CONCRETE_ISSUE = 'setConcreteIssue'
export const ACT_FETCH_AUTOFIXABLE_ISSUES = 'fetchAutofixableIssues'

export const MUT_SET_ERROR = 'setRunDetailError'
export const MUT_SET_LOADING = 'setRunDetailLoading'
export const MUT_SET_RUN = 'setRun';
export const MUT_SET_CONCRETE_ISSUE_LIST = 'setConcreteIssueList'

export const state = () => ({
  loading: false as boolean,
  error: {},
  run: {} as Check,
  concreteIssueList: {
    pageInfo: {} as PageInfo,
    edges: [] as Array<Maybe<IssueEdge>>
  } as IssueConnection
})

export type RunDetailModuleState = ReturnType<typeof state>
export type RunDetailActionContext = ActionContext<RunDetailModuleState, RootState>

export const getters: GetterTree<RunDetailModuleState, RootState> = {}

interface RunDetailModuleMutations extends MutationTree<RunDetailModuleState> {
  [MUT_SET_LOADING]: (state: RunDetailModuleState, value: boolean) => void;
  [MUT_SET_ERROR]: (state: RunDetailModuleState, error: GraphqlError) => void;
  [MUT_SET_RUN]: (state: RunDetailModuleState, run: Check) => void;
  [MUT_SET_CONCRETE_ISSUE_LIST]: (state: RunDetailModuleState, concreteIssueList: IssueConnection) => void;
}

export const mutations: RunDetailModuleMutations = {
  [MUT_SET_LOADING]: (state, value) => {
    state.loading = value
  },
  [MUT_SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  },
  [MUT_SET_RUN]: (state, run) => {
    state.run = Object.assign({}, state.run, run)
  },
  [MUT_SET_CONCRETE_ISSUE_LIST]: (state, concreteIssueList) => {
    state.concreteIssueList = Object.assign({}, state.concreteIssueList, concreteIssueList)
  }
}

interface RunDetailModuleActions extends ActionTree<RunDetailModuleState, RootState> {
  [ACT_FETCH_RUN]: (this: Store<RootState>, injectee: RunDetailActionContext, args: {
    checkId: string
  }) => Promise<void>;
  [ACT_FETCH_AUTOFIXABLE_ISSUES]: (this: Store<RootState>, injectee: RunDetailActionContext, args: {
    checkId: string
  }) => Promise<void>;
  [ACT_FETCH_CONCRETE_ISSUE_LIST]: (this: Store<RootState>, injectee: RunDetailActionContext, args: {
    checkId: string,
    limit: number,
    currentPageNumber: number,
    sort: string,
    issueType: string
  }) => Promise<void>;
}

export const actions: RunDetailModuleActions = {
  async [ACT_FETCH_RUN]({ commit }, args) {
    commit(MUT_SET_LOADING, true)
    await this.$fetchGraphqlData(RepositoryRunGQLQuery, {
      checkId: args.checkId
    }).then((response: GraphqlQueryResponse) => {
      commit(MUT_SET_RUN, response.data.check)
      commit(MUT_SET_LOADING, false)
    }).catch((e: GraphqlError) => {
      commit(MUT_SET_ERROR, e)
      commit(MUT_SET_LOADING, false)
    })
  },
  async [ACT_FETCH_AUTOFIXABLE_ISSUES]({ commit }, args) {
    commit(MUT_SET_LOADING, true)
    await this.$fetchGraphqlData(RunAutofixableIssuesGQLQuery, {
      checkId: args.checkId
    }).then((response: GraphqlQueryResponse) => {
      commit(MUT_SET_RUN, response.data.check)
      commit(MUT_SET_LOADING, false)
    }).catch((e: GraphqlError) => {
      commit(MUT_SET_ERROR, e)
      commit(MUT_SET_LOADING, false)
    })
  },
  async [ACT_FETCH_CONCRETE_ISSUE_LIST]({ commit }, args) {
    commit(MUT_SET_LOADING, true)
    await this.$fetchGraphqlData(RunConcreteIssueListGQLQuery, {
      checkId: args.checkId,
      limit: args.limit,
      after: this.$getGQLAfter(args.currentPageNumber, args.limit),
      sort: args.sort,
      issueType: args.issueType
    }).then((response: GraphqlQueryResponse) => {
      commit(MUT_SET_CONCRETE_ISSUE_LIST, response.data.check?.concreteIssues)
      commit(MUT_SET_LOADING, false)
    }).catch((e: GraphqlError) => {
      commit(MUT_SET_ERROR, e)
      commit(MUT_SET_LOADING, false)
    })
  }
}