import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { RootState } from '~/store'

export enum AuthActionTypes {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT'
}

export enum AuthMutationTypes {
  SET_LOGGED_IN = 'SET_LOGGED_IN',
  SET_LOGGED_OUT = 'SET_LOGGED_OUT'
}

export enum AuthGetterTypes {
    IS_LOGGED_IN = 'IS_LOGGED_IN',
    GET_TOKEN = 'GET_TOKEN'
}

// Todo: move to env
const AUTH_COOKIE = 'nova';

/** Auth is the model for authentication. */
export interface Auth {
  token: string
  loggedIn: boolean
}

/** Auth Mutations */
export const mutations: MutationTree<Auth> = {
  [AuthMutationTypes.SET_LOGGED_IN]: (state: Auth, token: string) => {
    state.loggedIn = true;
    state.token = token;
  },

  [AuthMutationTypes.SET_LOGGED_OUT]: (state: Auth) => {
    state.loggedIn = false;
    state.token = '';
  }
}

/** Auth Getters */
export const getters: GetterTree<Auth, RootState> = {
  [AuthGetterTypes.IS_LOGGED_IN]: state => state.loggedIn && state.loggedIn,
  [AuthGetterTypes.GET_TOKEN]: state => { return state.loggedIn ? state.token : '' }
}

/** Auth Actions */
export const actions: ActionTree<Auth, RootState> = {
  async [AuthActionTypes.LOGIN]({ commit }) {
    const cookie = this.$cookies.get(AUTH_COOKIE);
    commit(AuthMutationTypes.SET_LOGGED_IN, cookie.jwt);
  },

  async [AuthActionTypes.LOGOUT]({ commit }) {
    commit(AuthMutationTypes.SET_LOGGED_OUT)
  }
}

export const state = function() :Auth {return <Auth>{
  token: '',
  loggedIn: false
}};
