import { Changelog, Context } from '~/types/types'
import { GetterTree, ActionTree, MutationTree, ActionContext, Store } from 'vuex'
import { RootState } from '~/store'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'

import contextQuery from '~/apollo/queries/context/context.gql'
import changelogQuery from '~/apollo/queries/context/changelog.gql'

export enum ContextMutationTypes {
  SET_CONTEXT = 'setContext',
  SET_CHANGELOG = 'setChangelog'
}

export enum ContextActionTypes {
  FETCH_CONTEXT = 'fetchContext',
  FETCH_CHANGELOG = 'fetchChangelog'
}

export enum ContextGetterTypes {
  TO_ONBOARD = 'toOnboard',
  INSTALLATION_URL = 'installationUrl'
}

export const state = () => ({
  context: <Context>{},
  changelog: <Changelog>{},
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
  [ContextMutationTypes.SET_CHANGELOG]: (state: ContextModuleState, changelog: Changelog) => void
}

export const mutations: ContextModuleMutations = {
  [ContextMutationTypes.SET_CONTEXT]: (state, context: Context) => {
    state.context = context
  },
  [ContextMutationTypes.SET_CHANGELOG]: (state, changelog: Changelog) => {
    state.changelog = changelog
  }
}

interface ContextModuleActions extends ActionTree<ContextModuleState, RootState> {
  [ContextActionTypes.FETCH_CONTEXT]: (
    this: Store<RootState>,
    injectee: ContextActionContext,
    args?: {
      refetch?: boolean
    }
  ) => Promise<void>
  [ContextActionTypes.FETCH_CHANGELOG]: (
    this: Store<RootState>,
    injectee: ContextActionContext
  ) => Promise<void>
}

export const actions: ContextModuleActions = {
  async [ContextActionTypes.FETCH_CONTEXT]({ commit }, args) {
    const response: GraphqlQueryResponse = await this.$fetchGraphqlData(
      contextQuery,
      {},
      args?.refetch
    )
    commit(ContextMutationTypes.SET_CONTEXT, response.data.context)
  },
  async [ContextActionTypes.FETCH_CHANGELOG]({ commit }) {
    const response: GraphqlQueryResponse = await this.$fetchGraphqlData(changelogQuery, {})
    commit(ContextMutationTypes.SET_CHANGELOG, response.data.changelog)
  }
}
