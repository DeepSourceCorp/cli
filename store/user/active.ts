import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { RootState } from '~/store'
import ActiveUserDetailGQLQuery from '~/apollo/queries/user/active/detail.gql'

import {
  User
} from '~/types/types'

export const ACT_FETCH_VIEWER_INFO = 'fetchViewerInfo'

const MUT_SET_VIEWER = 'setViewer';

export const state = () => ({
  /**
   * Define state here.
   * For eg,
   * stateProp: 'this is a state property' as string
   */
  viewer: {} as User
})

export type ActiveUserModuleState = ReturnType<typeof state>

export const getters: GetterTree<ActiveUserModuleState, RootState> = {
  /**
   * Define a getter here.
   * For eg,
   * statePropGetter: string => state.stateProp.toUpperCase()
   */
}

export const mutations: MutationTree<ActiveUserModuleState> = {
  /**
   * Define mutation here.
   * For eg,
   * CHANGE_STATE_PROP: (state, newStateProp: string) => (state.stateProp = newStateProp)
   */
  [MUT_SET_VIEWER]: (state: ActiveUserModuleState, viewer: User) => {
    state.viewer = Object.assign({}, state.viewer, viewer)
  }
}

export const actions: ActionTree<ActiveUserModuleState, RootState> = {
  /**
   * Define actions here,
   * For eg,
   * async fetchThings({ commit }) {
   *  commit('CHANGE_STATE_PROP', 'New state property')
   * }
   */
  async [ACT_FETCH_VIEWER_INFO]({ commit }) {
    const response = await this.$fetchGraphqlData(ActiveUserDetailGQLQuery, {})
    commit(MUT_SET_VIEWER, response?.data.viewer)
  }
}