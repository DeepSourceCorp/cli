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
  LOG_OUT = 'logout',
  PURGE_CLIENT_DATA = 'purgeClientData'
}

export enum AuthGetterTypes {
  GET_AUTH_URL = 'getAuthUrls',
  GET_LOGGED_IN = 'isLoggedIn',
  TOKEN = 'getJWT',
  EXPIRY = 'getJWTExpiry'
}

export interface AuthModuleState {
  token: string
  tokenExpiresIn: number
  loggedIn: boolean
  authUrls: Record<string, string>
  error: Record<string, unknown>
}

export const state = (): AuthModuleState => ({
  token: '',
  tokenExpiresIn: 0,
  loggedIn: false,
  authUrls: {},
  error: {}
})

export type AuthActionContext = ActionContext<AuthModuleState, RootState>

export const getters: GetterTree<AuthModuleState, RootState> = {
  [AuthGetterTypes.GET_AUTH_URL]: (accountAuthState) => {
    return (provider: string) => {
      return provider in accountAuthState.authUrls ? accountAuthState.authUrls[provider] : ''
    }
  },
  [AuthGetterTypes.GET_LOGGED_IN]: (accountAuthState): boolean => {
    return accountAuthState.loggedIn
  },
  [AuthGetterTypes.TOKEN]: (accountAuthState): string => {
    return accountAuthState.token
  },
  [AuthGetterTypes.EXPIRY]: (accountAuthState): number => {
    return accountAuthState.tokenExpiresIn
  }
}

interface AuthModuleMutations extends MutationTree<AuthModuleState> {
  [AuthMutationTypes.SET_AUTH_URLS]: (
    accountAuthState: AuthModuleState,
    urls: Record<string, string>
  ) => void
  [AuthMutationTypes.SET_LOGGED_IN]: (accountAuthState: AuthModuleState, token: string) => void
  [AuthMutationTypes.SET_LOGGED_OUT]: (accountAuthState: AuthModuleState) => void
}

export const mutations: AuthModuleMutations = {
  [AuthMutationTypes.SET_AUTH_URLS]: (accountAuthState, oauth: SocialAuthUrl) => {
    accountAuthState.authUrls = oauth.socialUrls
  },
  [AuthMutationTypes.SET_LOGGED_OUT]: (accountAuthState) => {
    accountAuthState.loggedIn = false
    accountAuthState.token = ''
  },
  [AuthMutationTypes.SET_LOGGED_IN]: (accountAuthState, token: string) => {
    try {
      if (token) {
        const decodeStr = process.client ? atob : require('atob')
        const data = JSON.parse(decodeStr(token.split('.')[1]))
        accountAuthState.loggedIn = true
        accountAuthState.token = token
        accountAuthState.tokenExpiresIn = data.exp
      }
    } catch (e) {
      accountAuthState.loggedIn = false
    }
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
  [AuthActionTypes.LOG_OUT]: (
    this: Store<RootState>,
    injectee: AuthActionContext,
    args: {
      onPrem: boolean
    }
  ) => void
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
    if (response.data.refreshToken.token) {
      commit(AuthMutationTypes.SET_LOGGED_IN, response.data.refreshToken.token)
    } else {
      // To suppress JSONWebToken errors in Asgard, we implemented silent breakage on Asgard.
      // In case the refresh fails, Asgard will return a blank token.
      throw new Error('Failed to refresh token, please login again')
    }
  },

  async [AuthActionTypes.PURGE_CLIENT_DATA]() {
    try {
      // resets the indexedDB
      await this.$resetLocalDB()

      // reset rudder stack
      if (process.client) {
        this.$rudder?.reset(true)
      }

      // reset the apollo cache
      this.$clearGqlStore()

      // purge localstorage except cookie consent
      this.$localStore.purge()

      // purge all client accessible cookies
      this.$cookies.removeAll()

      // @ts-ignore
      if (process.client && window && typeof indexedDB.databases === 'function') {
        // skipcq: JS-0372, JS-0295
        // @ts-ignore
        const databases = await indexedDB.databases()

        Promise.all(
          // skipcq: JS-0372, JS-0295
          // @ts-ignore
          databases.map((db) => {
            // skipcq: JS-0372, JS-0295
            // @ts-ignore
            if (db.name) {
              // skipcq: JS-0372, JS-0295
              // @ts-ignore
              return indexedDB.deleteDatabase(db.name)
            }
          })
        )
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        throw new Error('Something went wrong while logging you out.')
      }
      this.$logErrorAndToast(e as Error)
    }
  },

  async [AuthActionTypes.LOG_OUT]({ commit, dispatch }) {
    try {
      commit(AuthMutationTypes.SET_LOGGED_OUT)
      await this.$applyGraphqlMutation(logoutMutation, {}, null, false)
      dispatch(AuthActionTypes.PURGE_CLIENT_DATA)
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        throw new Error('Something went wrong while logging you out.')
      }
      this.$logErrorAndToast(e as Error)
    }
  }
}
