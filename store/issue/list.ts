import { RepositoryIssueConnection, Maybe, PageInfo, RepositoryIssueEdge } from '~/types/types'
import RepositoryIssuesListGQLQuery from '~/apollo/queries/repository/issue/list.gql'
import { GetterTree, ActionTree, MutationTree, Store, ActionContext } from 'vuex'
import { GraphqlError, GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { RootState } from '~/store'

export interface IssueListModuleState {
  loading: boolean
  error: Record<string, any>
  issueList: RepositoryIssueConnection
}

export enum IssueListActions {
  FETCH_ISSUE_LIST = 'fetchIssueList'
}

export enum IssueListMutations {
  SET_LOADING = 'setIssueListLoading',
  SET_ERROR = 'setIssueListError',
  SET_ISSUE_LIST = 'setIssueList'
}

export const state = (): IssueListModuleState => ({
  ...(<IssueListModuleState>{
    loading: false,
    error: {},
    issueList: {
      pageInfo: {} as PageInfo,
      edges: [] as Array<Maybe<RepositoryIssueEdge>>
    }
  })
})

export type IssueListActionContext = ActionContext<IssueListModuleState, RootState>

export const getters: GetterTree<IssueListModuleState, RootState> = {}

interface IssueListModuleMutations extends MutationTree<IssueListModuleState> {
  [IssueListMutations.SET_LOADING]: (state: IssueListModuleState, value: boolean) => void
  [IssueListMutations.SET_ERROR]: (state: IssueListModuleState, error: GraphqlError) => void
  [IssueListMutations.SET_ISSUE_LIST]: (
    state: IssueListModuleState,
    issueList: RepositoryIssueConnection
  ) => void
}

export const mutations: IssueListModuleMutations = {
  [IssueListMutations.SET_LOADING]: (state, value) => {
    state.loading = value
  },
  [IssueListMutations.SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  },
  [IssueListMutations.SET_ISSUE_LIST]: (state, issueList) => {
    state.issueList = Object.assign({}, state.issueList, issueList)
  }
}

interface IssueListModuleActions extends ActionTree<IssueListModuleState, RootState> {
  [IssueListActions.FETCH_ISSUE_LIST]: (
    this: Store<RootState>,
    injectee: IssueListActionContext,
    args: {
      provider: string
      owner: string
      name: string
      currentPageNumber?: number
      limit: number
      issueType?: string
      analyzer?: string
      sort?: string
      q?: string
      autofixAvailable?: boolean
      all?: boolean
    }
  ) => Promise<void>
}

export const actions: IssueListModuleActions = {
  async [IssueListActions.FETCH_ISSUE_LIST]({ commit }, args) {
    commit(IssueListMutations.SET_LOADING, true)

    await this.$fetchGraphqlData(RepositoryIssuesListGQLQuery, {
      provider: this.$providerMetaMap[args.provider].value,
      owner: args.owner,
      name: args.name,
      after: this.$getGQLAfter(args.currentPageNumber || 1, args.limit),
      limit: args.limit,
      issueType: args.issueType,
      analyzer: args.analyzer,
      sort: args.sort,
      q: args.q,
      autofixAvailable: args.autofixAvailable,
      all: args.all
    })
      .then((response: GraphqlQueryResponse) => {
        commit(IssueListMutations.SET_ISSUE_LIST, response.data.repository?.issues)
        commit(IssueListMutations.SET_LOADING, false)
      })
      .catch((e: GraphqlError) => {
        commit(IssueListMutations.SET_ERROR, e)
        commit(IssueListMutations.SET_LOADING, false)
      })
  }
}
