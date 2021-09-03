import { GetterTree, ActionTree, MutationTree, ActionContext, Store } from 'vuex'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import socialAuthUrlQuery from '@/apollo/queries/auth/socialAuthUrls.gql'
import socialAuthMutation from '@/apollo/mutations/auth/socialAuth.gql'
import logoutMutation from '@/apollo/mutations/auth/logout.gql'
import refreshTokenMutation from '@/apollo/mutations/auth/refreshToken.gql'

import { RootState } from '~/store'
import { SocialAuthUrl } from '~/types/types'

export enum AuthMutationTypes {
  SET_LOGGED_IN = 'setLoggedIn',
  SET_LOGGED_OUT = 'setLoggedOut',
  SET_AUTH_URLS = 'setAuthUrls',
  SET_ERROR = 'setError'
}

export enum AuthActionTypes {
  FETCH_AUTH_URLS = 'fetchAuthUrls',
  LOG_IN = 'login',
  REFRESH = 'refresh',
  LOG_OUT = 'logout'
}

export enum AuthGetterTypes {
  GET_AUTH_URL = 'getAuthUrls',
  GET_LOGGED_IN = 'isLoggedIn',
  EXPIRY = 'getJWTExpiry'
}

export interface AuthModuleState {
  tokenExpiresIn: number
  loggedIn: boolean
  authUrls: Record<string, string>
  error: Record<string, unknown>
}

export const state = (): AuthModuleState => ({
  tokenExpiresIn: 0,
  loggedIn: false,
  authUrls: {},
  error: {}
})

export type AuthActionContext = ActionContext<AuthModuleState, RootState>

export const getters: GetterTree<AuthModuleState, RootState> = {
  [AuthGetterTypes.GET_AUTH_URL]: (state) => {
    return (provider: string) => {
      return provider in state.authUrls ? state.authUrls[provider] : ''
    }
  },
  [AuthGetterTypes.GET_LOGGED_IN]: (state): boolean => {
    return state.loggedIn
  },
  [AuthGetterTypes.EXPIRY]: (state): number => {
    return state.tokenExpiresIn
  }
}

interface AuthModuleMutations extends MutationTree<AuthModuleState> {
  [AuthMutationTypes.SET_AUTH_URLS]: (state: AuthModuleState, urls: Record<string, string>) => void
  [AuthMutationTypes.SET_LOGGED_IN]: (state: AuthModuleState, token: string) => void
  [AuthMutationTypes.SET_LOGGED_OUT]: (state: AuthModuleState) => void
}

export const mutations: AuthModuleMutations = {
  [AuthMutationTypes.SET_AUTH_URLS]: (state, oauth: SocialAuthUrl) => {
    state.authUrls = oauth.socialUrls
  },
  [AuthMutationTypes.SET_LOGGED_OUT]: (state) => {
    state.loggedIn = false
  },
  [AuthMutationTypes.SET_LOGGED_IN]: (state, token: string) => {
    try {
      const decodeStr = process.client ? atob : require('atob')
      const data = JSON.parse(decodeStr(token.split('.')[1]))
      state.tokenExpiresIn = data.exp
    } catch (e) {}
    state.loggedIn = true
  },
  [AuthMutationTypes.SET_LOGGED_OUT]: (state) => {
    state.loggedIn = false
  }
}

interface AuthModuleActions extends ActionTree<AuthModuleState, RootState> {
  [AuthActionTypes.FETCH_AUTH_URLS]: (
    this: Store<RootState>,
    injectee: AuthActionContext
  ) => Promise<void>
  [AuthActionTypes.LOG_IN]: (
    this: Store<RootState>,
    injectee: AuthActionContext,
    args: {
      code: string
      provider: string
    }
  ) => void
  [AuthActionTypes.REFRESH]: (this: Store<RootState>, injectee: AuthActionContext) => void
  [AuthActionTypes.LOG_OUT]: (this: Store<RootState>, injectee: AuthActionContext) => void
}

// TODO: Add proper error handling.
export const actions: AuthModuleActions = {
  async [AuthActionTypes.FETCH_AUTH_URLS]({ commit }) {
    const response: GraphqlQueryResponse = await this.$fetchGraphqlData(
      socialAuthUrlQuery,
      {},
      false,
      false
    )
    commit(AuthMutationTypes.SET_AUTH_URLS, response.data.oauth)
  },

  async [AuthActionTypes.LOG_IN]({ commit }, args) {
    const response = await this.$applyGraphqlMutation(
      socialAuthMutation,
      {
        provider: args.provider,
        code: args.code
      },
      null,
      false
    )
    commit(AuthMutationTypes.SET_LOGGED_IN, response.data.socialAuth.token)
  },

  async [AuthActionTypes.REFRESH]({ commit }) {
    const response = await this.$applyGraphqlMutation(refreshTokenMutation, {}, null, false)
    commit(AuthMutationTypes.SET_LOGGED_IN, response.data.refreshToken.token)
  },

  async [AuthActionTypes.LOG_OUT]({ commit }) {
    try {
      await this.$applyGraphqlMutation(logoutMutation, {}, null, false)
      commit(AuthMutationTypes.SET_LOGGED_OUT)
    } catch (e) {
      throw new Error('Something went wrong while logging you out.')
    }
  }
}
