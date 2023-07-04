import RepositoryAutofixRunListGQLQuery from '~/apollo/queries/repository/runs/autofixRun/list.gql'
import { GetterTree, ActionTree, MutationTree, ActionContext, Store } from 'vuex'
import { GraphqlError } from '~/types/apollo-graphql-types'
import {
  Maybe,
  PageInfo,
  AutofixRunConnection,
  AutofixRunEdge,
  Repository,
  AutofixRun,
  AutofixRunPullRequestStatus,
  AutofixRunStatus
} from '~/types/types'
import { RootState } from '~/store'
import { resolveNodes } from '~/utils/array'

export enum AutofixRunListActions {
  FETCH_AUTOFIX_RUN_LIST = 'fetchAutofixRunList',
  FETCH_PENDING_AUTOFIX_RUNS = 'fetchPendingAutofixRunList'
}

export enum AutofixRunListMutations {
  SET_ERROR = 'setAutofixRunListError',
  SET_LOADING = 'setAutofixRunListLoading',
  SET_AUTOFIX_RUN_LIST = 'setAutofixRunList',
  SET_PENDING_AUTOFIX_RUNS = 'setPendingAutofixRunList'
}

export interface AutofixRunListModuleState {
  error: Record<string, any>
  autofixRunList: AutofixRunConnection
  pendingAutofixList: AutofixRun[]
}

export const state = (): AutofixRunListModuleState => ({
  ...(<AutofixRunListModuleState>{
    error: {},
    autofixRunList: {
      pageInfo: {} as PageInfo,
      edges: [] as Array<Maybe<AutofixRunEdge>>
    },
    pendingAutofixList: []
  })
})

export type AutofixRunListActionContext = ActionContext<AutofixRunListModuleState, RootState>

export const getters: GetterTree<AutofixRunListModuleState, RootState> = {}

interface AutofixRunListModuleMutations extends MutationTree<AutofixRunListModuleState> {
  [AutofixRunListMutations.SET_ERROR]: (
    state: AutofixRunListModuleState,
    error: GraphqlError
  ) => void
  [AutofixRunListMutations.SET_AUTOFIX_RUN_LIST]: (
    state: AutofixRunListModuleState,
    autofixRun: AutofixRunConnection
  ) => void
  [AutofixRunListMutations.SET_PENDING_AUTOFIX_RUNS]: (
    state: AutofixRunListModuleState,
    autofixRun: AutofixRunConnection
  ) => void
}

export const mutations: AutofixRunListModuleMutations = {
  [AutofixRunListMutations.SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  },
  [AutofixRunListMutations.SET_AUTOFIX_RUN_LIST]: (state, autofixRunList) => {
    state.autofixRunList = Object.assign({}, state.autofixRunList, autofixRunList)
  },
  [AutofixRunListMutations.SET_PENDING_AUTOFIX_RUNS]: (state, autofixRunList) => {
    state.pendingAutofixList = resolveNodes(autofixRunList)
  }
}

interface AutofixRunListModuleActions extends ActionTree<AutofixRunListModuleState, RootState> {
  [AutofixRunListActions.FETCH_AUTOFIX_RUN_LIST]: (
    this: Store<RootState>,
    injectee: AutofixRunListActionContext,
    args: {
      provider: string
      owner: string
      name: string
      currentPageNumber: number
      limit: number
      statusIn?: string[]
      refetch?: boolean
    }
  ) => Promise<void>
  [AutofixRunListActions.FETCH_PENDING_AUTOFIX_RUNS]: (
    this: Store<RootState>,
    injectee: AutofixRunListActionContext,
    args: {
      provider: string
      owner: string
      name: string
      currentPageNumber: number
      limit: number
      refetch?: boolean
    }
  ) => Promise<void>
}

export const actions: AutofixRunListModuleActions = {
  async [AutofixRunListActions.FETCH_AUTOFIX_RUN_LIST]({ commit }, args) {
    try {
      const response: { data: { repository: Repository } } = await this.$fetchGraphqlData(
        RepositoryAutofixRunListGQLQuery,
        {
          provider: this.$providerMetaMap[args.provider].value,
          owner: args.owner,
          name: args.name,
          statusIn: args.statusIn ? args.statusIn.map((status) => status.toLowerCase()) : [],
          after: this.$getGQLAfter(args.currentPageNumber, args.limit),
          limit: args.limit
        },
        args.refetch
      )
      commit(AutofixRunListMutations.SET_AUTOFIX_RUN_LIST, response.data.repository?.autofixRuns)
    } catch (e) {
      const error = e as GraphqlError
      commit(AutofixRunListMutations.SET_ERROR, error)
    }
  },
  async [AutofixRunListActions.FETCH_PENDING_AUTOFIX_RUNS]({ commit }, args) {
    try {
      const response: { data: { repository: Repository } } = await this.$fetchGraphqlData(
        RepositoryAutofixRunListGQLQuery,
        {
          provider: this.$providerMetaMap[args.provider].value,
          owner: args.owner,
          name: args.name,
          prStatusIn: [
            AutofixRunPullRequestStatus.Pnc.toLowerCase(), // Not created
            AutofixRunPullRequestStatus.Pro.toLowerCase(), // Pull request open
            AutofixRunPullRequestStatus.Prp.toLowerCase() // In Progress
          ],
          statusIn: [
            AutofixRunStatus.Pass.toLowerCase(), // PASSED
            AutofixRunStatus.Pend.toLowerCase() // PENDING
          ],
          after: this.$getGQLAfter(args.currentPageNumber, args.limit),
          limit: args.limit || 10
        },
        args.refetch
      )
      commit(
        AutofixRunListMutations.SET_PENDING_AUTOFIX_RUNS,
        response.data.repository?.autofixRuns
      )
    } catch (e) {
      const error = e as GraphqlError
      commit(AutofixRunListMutations.SET_ERROR, error)
    }
  }
}
