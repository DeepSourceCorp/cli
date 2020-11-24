import { GetterTree, ActionTree, MutationTree, ActionContext, Store } from 'vuex'
import { RootState } from '~/store'
import RepositoryTransformerRunGQLQuery from '~/apollo/queries/repository/runs/transformerRun/detail.gql'
import { TransformerRun } from '~/types/types'
import { GraphqlError, GraphqlQueryResponse } from '~/types/apollo-graphql-types'

export const ACT_FETCH_TRANSFORMER_RUN = 'fetchTransformerRun'

export const MUT_SET_LOADING = 'setTransformerRunDetailLoading'
export const MUT_SET_ERROR = 'setTransformerRunDetailError'
export const MUT_SET_TRANSFORMER_RUN = 'setAutofixRun';

export interface TransformerRunDetailModuleState {
  loading: boolean,
  error: Record<string, any>,
  transformerRun: TransformerRun
}

export const state = (): TransformerRunDetailModuleState => ({
  ...<TransformerRunDetailModuleState>({
    loading: false,
    error: {},
    transformerRun: {}
  })
})

export type TransformerRunDetailActionContext = ActionContext<TransformerRunDetailModuleState, RootState>

export const getters: GetterTree<TransformerRunDetailModuleState, RootState> = {}

interface TransformerRunDetailMutations extends MutationTree<TransformerRunDetailModuleState> {
  [MUT_SET_LOADING]: (state: TransformerRunDetailModuleState, value: boolean) => void;
  [MUT_SET_ERROR]: (state: TransformerRunDetailModuleState, error: GraphqlError) => void;
  [MUT_SET_TRANSFORMER_RUN]: (state: TransformerRunDetailModuleState, transformerRun: TransformerRun) => void;
}

export const mutations: TransformerRunDetailMutations = {
  [MUT_SET_LOADING]: (state, value) => {
    state.loading = value
  },
  [MUT_SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  },
  [MUT_SET_TRANSFORMER_RUN]: (state: any, transformerRun: TransformerRun) => {
    state.transformerRun = Object.assign({}, state.transformerRun, transformerRun)
  }
}

interface TransformerRunDetailModuleActions extends ActionTree<TransformerRunDetailModuleState, RootState> {
  [ACT_FETCH_TRANSFORMER_RUN]: (this: Store<RootState>, injectee: TransformerRunDetailActionContext, args: {
    runId: string
  }) => Promise<void>;
}

export const actions: TransformerRunDetailModuleActions = {
  async [ACT_FETCH_TRANSFORMER_RUN]({ commit }, args) {
    commit(MUT_SET_LOADING, true)
    await this.$fetchGraphqlData(RepositoryTransformerRunGQLQuery, {
      runId: args.runId
    }).then((response: GraphqlQueryResponse) => {
      commit(MUT_SET_TRANSFORMER_RUN, response.data.transformerRun)
      commit(MUT_SET_LOADING, false)
    }).catch((e: GraphqlError) => {
      commit(MUT_SET_ERROR, e)
      commit(MUT_SET_LOADING, false)
    })
  }
}