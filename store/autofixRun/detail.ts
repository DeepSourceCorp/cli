import RepositoryAutofixRunGQLQuery from '~/apollo/queries/repository/runs/autofixRun/detail.gql'
import RepositoryAutofixSingleRunGQLQuery from '~/apollo/queries/repository/runs/autofixRun/single.gql'
import { GetterTree, ActionTree, MutationTree, ActionContext, Store } from 'vuex'
import { GraphqlError } from '~/types/apollo-graphql-types'
import { AutofixRun } from '~/types/types'
import { RootState } from '~/store'

export enum AutofixRunDetailActions {
  FETCH_AUTOFIX_RUN = 'fetchAutofixRun',
  FETCH_AUTOFIX_SINGLE_RUN = 'fetchAutofixSingleRun'
}

export enum AutofixRunDetailMutations {
  SET_ERROR = 'setAutofixRunDetailError',
  SET_LOADING = 'setAutofixRunDetailLoading',
  SET_AUTOFIX_RUN = 'setAutofixRun'
}

export interface AutofixRunDetailModuleState {
  loading: boolean
  error: Record<string, any>
  autofixRun: AutofixRun
}

export const state = (): AutofixRunDetailModuleState => ({
  ...(<AutofixRunDetailModuleState>{
    loading: false,
    error: {},
    autofixRun: {}
  })
})

export type AutofixRunDetailActionContext = ActionContext<AutofixRunDetailModuleState, RootState>

export const getters: GetterTree<AutofixRunDetailModuleState, RootState> = {}

interface AutofixRunDetailModuleMutations extends MutationTree<AutofixRunDetailModuleState> {
  [AutofixRunDetailMutations.SET_LOADING]: (
    state: AutofixRunDetailModuleState,
    value: boolean
  ) => void
  [AutofixRunDetailMutations.SET_ERROR]: (
    state: AutofixRunDetailModuleState,
    error: GraphqlError
  ) => void
  [AutofixRunDetailMutations.SET_AUTOFIX_RUN]: (
    state: AutofixRunDetailModuleState,
    autofixRun: AutofixRun
  ) => void
}

export const mutations: AutofixRunDetailModuleMutations = {
  [AutofixRunDetailMutations.SET_LOADING]: (state, value) => {
    state.loading = value
  },
  [AutofixRunDetailMutations.SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  },
  [AutofixRunDetailMutations.SET_AUTOFIX_RUN]: (state, autofixRun) => {
    state.autofixRun = Object.assign({}, state.autofixRun, autofixRun)
  }
}

interface AutofixRunDetailModuleActions extends ActionTree<AutofixRunDetailModuleState, RootState> {
  [AutofixRunDetailActions.FETCH_AUTOFIX_RUN]: (
    this: Store<RootState>,
    injectee: AutofixRunDetailActionContext,
    args: {
      runId: string
      refetch?: boolean
    }
  ) => Promise<void>
  [AutofixRunDetailActions.FETCH_AUTOFIX_SINGLE_RUN]: (
    this: Store<RootState>,
    injectee: AutofixRunDetailActionContext,
    args: {
      runId: string
    }
  ) => Promise<void>
}

export const actions: AutofixRunDetailModuleActions = {
  async [AutofixRunDetailActions.FETCH_AUTOFIX_RUN]({ commit }, args) {
    commit(AutofixRunDetailMutations.SET_LOADING, true)
    try {
      const response = await this.$fetchGraphqlData(
        RepositoryAutofixRunGQLQuery,
        {
          runId: args.runId
        },
        args.refetch
      )
      commit(AutofixRunDetailMutations.SET_AUTOFIX_RUN, response.data.autofixRun)
      commit(AutofixRunDetailMutations.SET_LOADING, false)
    } catch (e) {
      const error = e as GraphqlError
      commit(AutofixRunDetailMutations.SET_ERROR, error)
      commit(AutofixRunDetailMutations.SET_LOADING, false)
    }
  },
  async [AutofixRunDetailActions.FETCH_AUTOFIX_SINGLE_RUN]({ commit }, args) {
    commit(AutofixRunDetailMutations.SET_LOADING, true)
    try {
      const response = await this.$fetchGraphqlData(RepositoryAutofixSingleRunGQLQuery, {
        runId: args.runId
      })
      commit(AutofixRunDetailMutations.SET_AUTOFIX_RUN, response.data.autofixRun)
      commit(AutofixRunDetailMutations.SET_LOADING, false)
    } catch (e) {
      const error = e as GraphqlError
      commit(AutofixRunDetailMutations.SET_ERROR, error)
      commit(AutofixRunDetailMutations.SET_LOADING, false)
    }
  }
}
