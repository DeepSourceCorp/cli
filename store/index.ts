import { GetterTree, ActionTree, MutationTree } from 'vuex'

export const state = () => ({
  /**
   * Define global state.
   * For eg,
   * stateProp: 'this is a state property' as string
   */
})

export type RootState = ReturnType<typeof state>

export const getters: GetterTree<RootState, RootState> = {
  /**
   * Define a getter here.
   * For eg,
   * statePropGetter: string => state.stateProp.toUpperCase()
   */
}

export const mutations: MutationTree<RootState> = {
  /**
   * Define mutation here.
   * For eg,
   * CHANGE_STATE_PROP: (state, newStateProp: string) => (state.stateProp = newStateProp)
   */
}

export const actions: ActionTree<RootState, RootState> = {
  /**
   * Define actions here.
   * For eg,
   * async fetchThings({ commit }) {
   *  commit('CHANGE_STATE_PROP', 'New state property')
   * }
   */
}