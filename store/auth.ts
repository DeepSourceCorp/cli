import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { RootState } from '~/store'

const MUT_SET_USER = 'setUser';
const MUT_RESET_USER = 'resetUser';
export const ACT_COMPLETE_LOGIN = 'user';
export const ACT_RESET_TOKEN = 'resetToken'


export type User = {
  token: string
  loggedIn: boolean
}

export const state = () => ({
  user!: <User>{
    token: 'fasfhjaifh',
    loggedIn: false
  },
})

export type AuthState = ReturnType<typeof state>

export const getters: GetterTree<AuthState, RootState> = {
  /**
   * Define a getter here.
   * For eg,
   * statePropGetter: string => state.stateProp.toUpperCase()
   */  token: state => state.user.token,
}

export const mutations: MutationTree<RootState> = {
  /**
   * Define mutation here.
   * For eg,
   * CHANGE_STATE_PROP: (state, newStateProp: string) => (state.stateProp = newStateProp)
   */
  [MUT_SET_USER]: (state: any, user: User) => {
    state.user = user;
  },

  [MUT_RESET_USER]: (state: any) => {
    state.user = Object.assign({}, state.user, {token: 'asdasd'})
  }

}

export const actions: ActionTree<AuthState, RootState> = {
  /**
   * Define actions here,
   * For eg,
   * async fetchThings({ commit }) {
   *  commit('CHANGE_STATE_PROP', 'New state property')
   * }
   */
  async [ACT_COMPLETE_LOGIN]({ commit }) {
    const user = <User> {
      loggedIn: true,
      token: "abcd"
    }
    commit(MUT_SET_USER, user)
  },

  async [ACT_RESET_TOKEN]({ commit }) {
    commit(MUT_RESET_USER, {})
  }
}
