import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { RootState } from '~/store'
import { AnalyzerConnection, PageInfo } from '~/types/types'
import AnalyzersGQLQuery from '~/apollo/queries/analyzers.gql';
import { ACT_FETCH_ANALYZERS } from '~/types/action-types';

const MUT_SET_ANALYZERS = 'setAnalyzers';

export const state = () => ({
  /**
   * Define state here.
   * For eg,
   * stateProp: 'this is a state property' as string
   */
  analyzers: {
    pageInfo: {} as PageInfo,
    edges: []
  } as AnalyzerConnection | null
})

export type AnalyzersModuleState = ReturnType<typeof state>

export const getters: GetterTree<AnalyzersModuleState, RootState> = {
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
  [MUT_SET_ANALYZERS]: (state: any, analyzers: AnalyzerConnection) => {
    state.analyzers = analyzers
  }
}

export const actions: ActionTree<AnalyzersModuleState, RootState> = {
  /**
   * Define actions here,
   * For eg,
   * async fetchThings({ commit }) {
   *  commit('CHANGE_STATE_PROP', 'New state property')
   * }
   */
  async [ACT_FETCH_ANALYZERS]({ commit }) {
    let client = this.app.apolloProvider?.defaultClient
    let response = await client?.query({
      query: AnalyzersGQLQuery
    });
    commit(MUT_SET_ANALYZERS, response?.data.analyzers)
  }
}