import RepositoryAutofixRunGQLQuery from '~/apollo/queries/repository/runs/autofixRun/detail.gql'
import { GetterTree, ActionTree, MutationTree, ActionContext, Store } from 'vuex'
import { GraphqlError, GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { AutofixRun } from '~/types/types'
import { RootState } from '~/store'

export const ACT_FETCH_AUTOFIX_RUN = 'fetchAutofixRun'

export const MUT_SET_LOADING = 'setAutofixRunDetailLoading'
export const MUT_SET_ERROR = 'setAutofixRunDetailError'
export const MUT_SET_AUTOFIX_RUN = 'setAutofixRun'

export interface AutofixRunDetailModuleState {
  loading: boolean,
  error: Record<string, any>,
  autofixRun: AutofixRun
}

export const state = (): AutofixRunDetailModuleState => ({
  ...<AutofixRunDetailModuleState>({
    loading: false,
    error: {},
    autofixRun: {}
  })
})

export type AutofixRunDetailActionContext = ActionContext<AutofixRunDetailModuleState, RootState>

export const getters: GetterTree<AutofixRunDetailModuleState, RootState> = {}

interface AutofixRunDetailModuleMutations extends MutationTree<AutofixRunDetailModuleState> {
  [MUT_SET_LOADING]: (state: AutofixRunDetailModuleState, value: boolean) => void;
  [MUT_SET_ERROR]: (state: AutofixRunDetailModuleState, error: GraphqlError) => void;
  [MUT_SET_AUTOFIX_RUN]: (state: AutofixRunDetailModuleState, autofixRun: AutofixRun) => void;
}

export const mutations: AutofixRunDetailModuleMutations = {
  [MUT_SET_LOADING]: (state, value) => {
    state.loading = value
  },
  [MUT_SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  },
  [MUT_SET_AUTOFIX_RUN]: (state, autofixRun) => {
    state.autofixRun = Object.assign({}, state.autofixRun, autofixRun)
  }
}

interface AutofixRunDetailModuleActions extends ActionTree<AutofixRunDetailModuleState, RootState> {
  [ACT_FETCH_AUTOFIX_RUN]: (this: Store<RootState>, injectee: AutofixRunDetailActionContext, args: {
    runId: string
  }) => Promise<void>;
}

export const actions: AutofixRunDetailModuleActions = {
  async [ACT_FETCH_AUTOFIX_RUN]({ commit }, args) {
    commit(MUT_SET_LOADING, true)
    await this.$fetchGraphqlData(RepositoryAutofixRunGQLQuery, {
      runId: args.runId
    }).then((response: GraphqlQueryResponse) => {
      commit(MUT_SET_AUTOFIX_RUN, response.data.autofixRun)
      commit(MUT_SET_LOADING, false)
    }).catch((e: GraphqlError) => {
      commit(MUT_SET_ERROR, e)
      commit(MUT_SET_LOADING, false)
    })
  }
}