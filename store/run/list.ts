import RepositoryRunListGQLQuery from '~/apollo/queries/repository/runs/run/list.gql'
import RepositoryRunGroupGQLQuery from '~/apollo/queries/repository/runs/run/group.gql'
import RepositoryPRListGQLQuery from '~/apollo/queries/repository/runs/pr/list.gql'
import RepositoryBranchRunGQLQuery from '~/apollo/queries/repository/runs/run/branch.gql'
import { GetterTree, ActionTree, MutationTree, Store, ActionContext } from 'vuex'
import { GraphqlError, GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import {
  Maybe,
  PageInfo,
  PrConnection,
  PrStateChoices,
  Repository,
  RunConnection,
  RunEdge,
  RunStatusChoice
} from '~/types/types'
import { RootState } from '~/store'

export type RepoStatsT = Pick<Repository, 'id' | 'openPrCount' | 'closedPrCount'>

export enum RunListActions {
  FETCH_RUN_LIST = 'fetchRunList',
  FETCH_GROUPED_RUN_LIST = 'fetchGroupedRunList',
  FETCH_BRANCH_RUNS_LIST = 'fetchBranchRuns',
  FETCH_PR_LIST = 'fetchPRList'
}

export enum RunListMutations {
  SET_ERROR = 'setRunListError',
  SET_LOADING = 'setRunListLoading',
  SET_RUN_LIST = 'setRunList',
  SET_GROUPED_RUN_LIST = 'setGroupedRunList',
  SET_BRANCH_RUNS_LIST = 'setBranchRuns',
  SET_PR_LIST = 'setPrList',
  SET_REPO_PR_STATS = 'setRepoPrStats'
}

export interface RunListModuleState {
  loading: boolean
  error: Record<string, any>
  runList: RunConnection
  groupedRunList: RunConnection
  branchRunList: Record<string, RunConnection>
  prList: PrConnection
  repoPrStats: RepoStatsT
}

export const state = (): RunListModuleState => ({
  ...(<RunListModuleState>{
    loading: false,
    error: {},
    runList: {
      pageInfo: {} as PageInfo,
      edges: [] as Array<Maybe<RunEdge>>
    } as RunConnection,
    groupedRunList: {
      pageInfo: {} as PageInfo,
      edges: [] as Array<Maybe<RunEdge>>
    },
    branchRunList: {},
    prList: {},
    repoPrStats: {}
  })
})

export type RunListActionContext = ActionContext<RunListModuleState, RootState>

export const getters: GetterTree<RunListModuleState, RootState> = {}

interface RunListModuleMutations extends MutationTree<RunListModuleState> {
  [RunListMutations.SET_LOADING]: (state: RunListModuleState, value: boolean) => void
  [RunListMutations.SET_ERROR]: (state: RunListModuleState, error: GraphqlError) => void
  [RunListMutations.SET_RUN_LIST]: (state: RunListModuleState, runList: RunConnection) => void
  [RunListMutations.SET_GROUPED_RUN_LIST]: (
    state: RunListModuleState,
    groupedRunList: RunConnection
  ) => void
  [RunListMutations.SET_BRANCH_RUNS_LIST]: (
    state: RunListModuleState,
    runItems: Record<string, RunConnection>
  ) => void
  [RunListMutations.SET_PR_LIST]: (state: RunListModuleState, prList: PrConnection) => void
  [RunListMutations.SET_REPO_PR_STATS]: (state: RunListModuleState, repoPrStats: RepoStatsT) => void
}

export const mutations: RunListModuleMutations = {
  [RunListMutations.SET_LOADING]: (state, value) => {
    state.loading = value
  },
  [RunListMutations.SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  },
  [RunListMutations.SET_RUN_LIST]: (state, runList) => {
    state.runList = Object.assign({}, state.runList, runList)
  },
  [RunListMutations.SET_GROUPED_RUN_LIST]: (state, groupedRunList) => {
    state.groupedRunList = Object.assign({}, state.runList, groupedRunList)
  },
  [RunListMutations.SET_BRANCH_RUNS_LIST]: (state, runItems) => {
    state.branchRunList = Object.assign({}, state.branchRunList, runItems)
  },
  [RunListMutations.SET_PR_LIST]: (state, prList) => {
    state.prList = Object.assign({}, prList)
  },
  [RunListMutations.SET_REPO_PR_STATS]: (state, repoPrStats) => {
    state.repoPrStats = Object.assign({}, repoPrStats)
  }
}

interface RunListModuleActions extends ActionTree<RunListModuleState, RootState> {
  [RunListActions.FETCH_RUN_LIST]: (
    this: Store<RootState>,
    injectee: RunListActionContext,
    args: {
      provider: string
      owner: string
      name: string
      currentPageNumber: number
      limit: number
      refetch?: boolean
    }
  ) => Promise<void>
  [RunListActions.FETCH_GROUPED_RUN_LIST]: (
    this: Store<RootState>,
    injectee: RunListActionContext,
    args: {
      provider: string
      owner: string
      name: string
      currentPageNumber: number
      limit: number
      refetch: boolean
    }
  ) => Promise<void>
  [RunListActions.FETCH_BRANCH_RUNS_LIST]: (
    this: Store<RootState>,
    injectee: RunListActionContext,
    args: {
      provider: string
      owner: string
      name: string
      branchName: string
      limit?: number
      refetch?: boolean
    }
  ) => Promise<void>
  [RunListActions.FETCH_PR_LIST]: (
    this: Store<RootState>,
    injectee: RunListActionContext,
    args: {
      provider: string
      owner: string
      name: string
      prStatus: PrStateChoices
      runStatus?: RunStatusChoice
      q?: string
      limit: number
      currentPageNumber: number
      refetch?: boolean
    }
  ) => Promise<void>
}

export const actions: RunListModuleActions = {
  async [RunListActions.FETCH_RUN_LIST]({ commit }, args) {
    commit(RunListMutations.SET_LOADING, true)
    try {
      const response = await this.$fetchGraphqlData(
        RepositoryRunListGQLQuery,
        {
          provider: this.$providerMetaMap[args.provider].value,
          owner: args.owner,
          name: args.name,
          after: this.$getGQLAfter(args.currentPageNumber, args.limit),
          limit: args.limit
        },
        args.refetch
      )
      commit(RunListMutations.SET_RUN_LIST, response.data.repository?.runs)
      commit(RunListMutations.SET_LOADING, false)
    } catch (e) {
      const error = e as GraphqlError
      commit(RunListMutations.SET_ERROR, error)
      commit(RunListMutations.SET_LOADING, false)
    }
  },
  async [RunListActions.FETCH_GROUPED_RUN_LIST]({ commit }, args) {
    commit(RunListMutations.SET_LOADING, true)
    await this.$fetchGraphqlData(
      RepositoryRunGroupGQLQuery,
      {
        provider: this.$providerMetaMap[args.provider].value,
        owner: args.owner,
        name: args.name,
        after: this.$getGQLAfter(args.currentPageNumber, args.limit),
        limit: args.limit
      },
      args.refetch
    )
      .then((response: GraphqlQueryResponse) => {
        commit(RunListMutations.SET_GROUPED_RUN_LIST, response.data.repository?.groupedRuns)
        commit(RunListMutations.SET_LOADING, false)
      })
      .catch((e: GraphqlError) => {
        commit(RunListMutations.SET_ERROR, e)
        commit(RunListMutations.SET_LOADING, false)
      })
  },
  async [RunListActions.FETCH_BRANCH_RUNS_LIST]({ commit }, args) {
    commit(RunListMutations.SET_LOADING, true)
    await this.$fetchGraphqlData(
      RepositoryBranchRunGQLQuery,
      {
        provider: this.$providerMetaMap[args.provider].value,
        owner: args.owner,
        name: args.name,
        branchName: args.branchName,
        limit: args.limit || 30
      },
      args.refetch
    )
      .then((response: GraphqlQueryResponse) => {
        const branch = args.branchName
        commit(RunListMutations.SET_BRANCH_RUNS_LIST, {
          [branch]: response.data.repository?.branchRuns
        })
        commit(RunListMutations.SET_LOADING, false)
      })
      .catch((e: GraphqlError) => {
        commit(RunListMutations.SET_ERROR, e)
        commit(RunListMutations.SET_LOADING, false)
      })
  },
  async [RunListActions.FETCH_PR_LIST](
    { commit },
    { name, owner, limit, prStatus, runStatus, provider, currentPageNumber, q, refetch }
  ) {
    commit(RunListMutations.SET_LOADING, true)
    try {
      const response = (await this.$fetchGraphqlData(
        RepositoryPRListGQLQuery,
        {
          name,
          owner,
          provider,
          prStatus,
          runStatus,
          q,
          limit,
          after: this.$getGQLAfter(currentPageNumber, limit)
        },
        refetch
      )) as GraphqlQueryResponse
      commit(RunListMutations.SET_PR_LIST, response.data.repository?.prs)
      commit(RunListMutations.SET_REPO_PR_STATS, response.data.repository)
    } catch (e) {
      commit(RunListMutations.SET_ERROR, e)
    } finally {
      commit(RunListMutations.SET_LOADING, false)
    }
  }
}
