import { GetterTree, ActionTree, MutationTree, ActionContext, Store } from 'vuex'
import { RootState } from '~/store'
import RepositoryTransformerRunGQLQuery from '~/apollo/queries/repository/runs/transformerRun/detail.gql'
import { TransformerRun } from '~/types/types'
import { GraphqlError, GraphqlQueryResponse } from '~/types/apollo-graphql-types'

export enum TransformerRunActions {
  FETCH_TRANSFORMER_RUN = 'fetchTransformerRun'
}

export enum TransformerRunMutations {
  SET_LOADING = 'setTransformerRunDetailLoading',
  SET_ERROR = 'setTransformerRunDetailError',
  SET_TRANSFORMER_RUN = 'setAutofixRun'
}

export interface TransformerRunDetailModuleState {
  loading: boolean
  error: Record<string, any>
  transformerRun: TransformerRun
}

export const state = (): TransformerRunDetailModuleState => ({
  ...(<TransformerRunDetailModuleState>{
    loading: false,
    error: {},
    transformerRun: {}
  })
})

export type TransformerRunDetailActionContext = ActionContext<
  TransformerRunDetailModuleState,
  RootState
>

export const getters: GetterTree<TransformerRunDetailModuleState, RootState> = {}

interface TransformerRunDetailMutations extends MutationTree<TransformerRunDetailModuleState> {
  [TransformerRunMutations.SET_LOADING]: (
    state: TransformerRunDetailModuleState,
    value: boolean
  ) => void
  [TransformerRunMutations.SET_ERROR]: (
    state: TransformerRunDetailModuleState,
    error: GraphqlError
  ) => void
  [TransformerRunMutations.SET_TRANSFORMER_RUN]: (
    state: TransformerRunDetailModuleState,
    transformerRun: TransformerRun
  ) => void
}

export const mutations: TransformerRunDetailMutations = {
  [TransformerRunMutations.SET_LOADING]: (state, value) => {
    state.loading = value
  },
  [TransformerRunMutations.SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  },
  [TransformerRunMutations.SET_TRANSFORMER_RUN]: (state, transformerRun: TransformerRun) => {
    state.transformerRun = Object.assign({}, state.transformerRun, transformerRun)
  }
}

interface TransformerRunDetailModuleActions
  extends ActionTree<TransformerRunDetailModuleState, RootState> {
  [TransformerRunActions.FETCH_TRANSFORMER_RUN]: (
    this: Store<RootState>,
    injectee: TransformerRunDetailActionContext,
    args: {
      runId: string
    }
  ) => Promise<void>
}

export const actions: TransformerRunDetailModuleActions = {
  async [TransformerRunActions.FETCH_TRANSFORMER_RUN]({ commit }, args) {
    commit(TransformerRunMutations.SET_LOADING, true)
    await this.$fetchGraphqlData(RepositoryTransformerRunGQLQuery, {
      runId: args.runId
    })
      .then((response: GraphqlQueryResponse) => {
        commit(TransformerRunMutations.SET_TRANSFORMER_RUN, response.data.transformerRun)
        commit(TransformerRunMutations.SET_LOADING, false)
      })
      .catch((e: GraphqlError) => {
        commit(TransformerRunMutations.SET_ERROR, e)
        commit(TransformerRunMutations.SET_LOADING, false)
      })
  }
}
