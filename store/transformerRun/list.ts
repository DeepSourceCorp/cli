import RepositoryTransformerGroupGQLQuery from '~/apollo/queries/repository/runs/transformerRun/group.gql'
import RepositoryTransfromerBranchGQLQuery from '~/apollo/queries/repository/runs/transformerRun/branch.gql'
import { Maybe, PageInfo, TransformerRunConnection, TransformerRunEdge } from '~/types/types'
import { GetterTree, ActionTree, MutationTree, Store, ActionContext } from 'vuex'
import { GraphqlError, GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { RootState } from '~/store'

export enum TransformListActions {
  FETCH_TRANSFORMER_RUN_LIST = 'fetchTransformerRunList',
  FETCH_BRANCH_TRANSFORMER_RUNS_LIST = 'fetchBranchTransformRuns'
}

export enum TransformListMutations {
  SET_TRANSFORMER_RUN_LIST = 'setTransformerRunList',
  SET_BRANCH_TRANSFORM_RUNS_LIST = 'setBranchTransformRuns',
  SET_LOADING = 'setTransformerRunListLoading',
  SET_ERROR = 'setTransformerRunListError'
}

export interface TransformerRunListModuleState {
  loading: boolean
  error: Record<string, any>
  transformerRunList: TransformerRunConnection
  branchTransformRunList: Record<string, TransformerRunConnection>
}

export const state = (): TransformerRunListModuleState => ({
  ...(<TransformerRunListModuleState>{
    loading: false,
    error: {},
    transformerRunList: {
      pageInfo: {} as PageInfo,
      edges: [] as Array<Maybe<TransformerRunEdge>>
    },
    branchTransformRunList: {}
  })
})

export type TransformerRunListActionContext = ActionContext<
  TransformerRunListModuleState,
  RootState
>

export const getters: GetterTree<TransformerRunListModuleState, RootState> = {}

interface TransformerRunListMutations extends MutationTree<TransformerRunListModuleState> {
  [TransformListMutations.SET_LOADING]: (
    state: TransformerRunListModuleState,
    value: boolean
  ) => void
  [TransformListMutations.SET_ERROR]: (
    state: TransformerRunListModuleState,
    error: GraphqlError
  ) => void
  [TransformListMutations.SET_TRANSFORMER_RUN_LIST]: (
    state: TransformerRunListModuleState,
    transformerRun: TransformerRunConnection
  ) => void
  [TransformListMutations.SET_BRANCH_TRANSFORM_RUNS_LIST]: (
    state: TransformerRunListModuleState,
    transformerRunItems: TransformerRunConnection
  ) => void
}

export const mutations: TransformerRunListMutations = {
  [TransformListMutations.SET_LOADING]: (state, value) => {
    state.loading = value
  },
  [TransformListMutations.SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  },
  [TransformListMutations.SET_TRANSFORMER_RUN_LIST]: (state, transformerRunList) => {
    state.transformerRunList = Object.assign({}, state.transformerRunList, transformerRunList)
  },
  [TransformListMutations.SET_BRANCH_TRANSFORM_RUNS_LIST]: (state, transformerRunItems) => {
    state.branchTransformRunList = Object.assign(
      {},
      state.branchTransformRunList,
      transformerRunItems
    )
  }
}

interface TransformerRunListModuleActions
  extends ActionTree<TransformerRunListModuleState, RootState> {
  [TransformListActions.FETCH_TRANSFORMER_RUN_LIST]: (
    this: Store<RootState>,
    injectee: TransformerRunListActionContext,
    args: {
      provider: string
      owner: string
      name: string
      currentPageNumber: number
      limit: number
    }
  ) => Promise<void>
  [TransformListActions.FETCH_BRANCH_TRANSFORMER_RUNS_LIST]: (
    this: Store<RootState>,
    injectee: TransformerRunListActionContext,
    args: {
      provider: string
      owner: string
      name: string
      branchName: string
    }
  ) => Promise<void>
}

export const actions: TransformerRunListModuleActions = {
  async [TransformListActions.FETCH_TRANSFORMER_RUN_LIST]({ commit }, args) {
    commit(TransformListMutations.SET_LOADING, true)
    await this.$fetchGraphqlData(RepositoryTransformerGroupGQLQuery, {
      provider: this.$providerMetaMap[args.provider].value,
      owner: args.owner,
      name: args.name,
      after: this.$getGQLAfter(args.currentPageNumber, args.limit),
      limit: args.limit
    })
      .then((response: GraphqlQueryResponse) => {
        commit(
          TransformListMutations.SET_TRANSFORMER_RUN_LIST,
          response.data.repository?.groupedTransformerRuns
        )
        commit(TransformListMutations.SET_LOADING, false)
      })
      .catch((e: GraphqlError) => {
        commit(TransformListMutations.SET_ERROR, e)
        commit(TransformListMutations.SET_LOADING, false)
      })
  },
  async [TransformListActions.FETCH_BRANCH_TRANSFORMER_RUNS_LIST]({ commit }, args) {
    commit(TransformListMutations.SET_LOADING, true)
    await this.$fetchGraphqlData(RepositoryTransfromerBranchGQLQuery, {
      provider: this.$providerMetaMap[args.provider].value,
      owner: args.owner,
      name: args.name,
      branchName: args.branchName
    })
      .then((response: GraphqlQueryResponse) => {
        const branch = args.branchName
        commit(TransformListMutations.SET_BRANCH_TRANSFORM_RUNS_LIST, {
          [branch]: response.data.repository?.transformerBranchRuns
        })
        commit(TransformListMutations.SET_LOADING, false)
      })
      .catch((e: GraphqlError) => {
        commit(TransformListMutations.SET_ERROR, e)
        commit(TransformListMutations.SET_LOADING, false)
      })
  }
}
