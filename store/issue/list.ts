import { RepositoryIssueConnection, Maybe, PageInfo, RepositoryIssueEdge } from '~/types/types'
import RepositoryIssuesListGQLQuery from '~/apollo/queries/repository/issue/list.gql'
import { GetterTree, ActionTree, MutationTree, Store, ActionContext } from 'vuex'
import { GraphqlError, GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { RootState } from '~/store'

export const ACT_FETCH_ISSUE_LIST = 'fetchIssueList'

export const MUT_SET_LOADING = 'setIssueListLoading'
export const MUT_SET_ERROR = 'setIssueListError'
export const MUT_SET_ISSUE_LIST = 'setIssueList'

export interface IssueListModuleState {
  loading: boolean,
  error: Record<string, any>,
  issueList: RepositoryIssueConnection
}

export const state = (): IssueListModuleState => ({
  ...<IssueListModuleState>({
    loading: false,
    error: {},
    issueList: {
      pageInfo: {} as PageInfo,
      edges: [] as Array<Maybe<RepositoryIssueEdge>>,
    }
  })
})

export type IssueListActionContext = ActionContext<IssueListModuleState, RootState>

export const getters: GetterTree<IssueListModuleState, RootState> = {}

interface IssueListModuleMutations extends MutationTree<IssueListModuleState> {
  [MUT_SET_LOADING]: (state: IssueListModuleState, value: boolean) => void;
  [MUT_SET_ERROR]: (state: IssueListModuleState, error: GraphqlError) => void;
  [MUT_SET_ISSUE_LIST]: (state: IssueListModuleState, issueList: RepositoryIssueConnection) => void;
}

export const mutations: IssueListModuleMutations = {
  [MUT_SET_LOADING]: (state, value) => {
    state.loading = value
  },
  [MUT_SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  },
  [MUT_SET_ISSUE_LIST]: (state, issueList) => {
    state.issueList = Object.assign({}, state.issueList, issueList)
  }
}

interface IssueListModuleActions extends ActionTree<IssueListModuleState, RootState> {
  [ACT_FETCH_ISSUE_LIST]: (this: Store<RootState>, injectee: IssueListActionContext, args: {
    provider: string,
    owner: string,
    name: string,
    currentPageNumber: number,
    limit: number,
    issueType: string,
    analyzer: string,
    sort: string,
    q: string
  }) => Promise<void>;
}

export const actions: IssueListModuleActions = {
  async [ACT_FETCH_ISSUE_LIST]({ commit }, args) {
    commit(MUT_SET_LOADING, true)
    await this.$fetchGraphqlData(RepositoryIssuesListGQLQuery, {
      provider: args.provider,
      owner: args.owner,
      name: args.name,
      after: this.$getGQLAfter(args.currentPageNumber, args.limit),
      issueType: args.issueType,
      analyzer: args.analyzer,
      sort: args.sort,
      q: args.q
    }).then((response: GraphqlQueryResponse) => {
      commit(MUT_SET_ISSUE_LIST, response.data.repository?.issues)
      commit(MUT_SET_LOADING, false)
    }).catch((e: GraphqlError) => {
      commit(MUT_SET_ERROR, e)
      commit(MUT_SET_LOADING, false)
    })
  }
}
