import { Context } from '~/types/types'
import { GetterTree, ActionTree, MutationTree, ActionContext, Store } from 'vuex'
import { RootState } from '~/store'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'

import contextQuery from '~/apollo/queries/context/context.gql'

export enum ContextMutationTypes {
  SET_CONTEXT = 'setContext'
}

export enum ContextActionTypes {
  FETCH_CONTEXT = 'fetchContext'
}

export enum ContextGetterTypes {
  TO_ONBOARD = 'toOnboard',
  INSTALLATION_URL = 'installationUrl'
}

export const state = () => ({
  context: <Context>{},
  loading: false,
  error: <Record<string, any>>{}
})

export type ContextModuleState = ReturnType<typeof state>
export type ContextActionContext = ActionContext<ContextModuleState, RootState>

export const getters: GetterTree<ContextModuleState, RootState> = {
  [ContextGetterTypes.TO_ONBOARD]: (state): boolean => {
    return Boolean(state.context.toOnboard)
  },
  [ContextGetterTypes.INSTALLATION_URL]: (state) => (provider: string) => {
    return state.context.installationUrls[provider]
  }
}

interface ContextModuleMutations extends MutationTree<ContextModuleState> {
  [ContextMutationTypes.SET_CONTEXT]: (state: ContextModuleState, context: Context) => void
}

export const mutations: ContextModuleMutations = {
  [ContextMutationTypes.SET_CONTEXT]: (state, context: Context) => {
    state.context = context
  }
}

interface ContextModuleActions extends ActionTree<ContextModuleState, RootState> {
  [ContextActionTypes.FETCH_CONTEXT]: (
    this: Store<RootState>,
    injectee: ContextActionContext
  ) => Promise<void>
}

export const actions: ContextModuleActions = {
  async [ContextActionTypes.FETCH_CONTEXT]({ commit }) {
    const response: GraphqlQueryResponse = await this.$fetchGraphqlData(contextQuery, {})
    commit(ContextMutationTypes.SET_CONTEXT, response.data.context)
  }
}
