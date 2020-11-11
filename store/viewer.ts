import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { RootState } from '~/store'
import { AnalyzerConnection, PageInfo } from '~/types/types'
import AnalyzersGQLQuery from '~/apollo/queries/analyzerList/analyzers.gql';
import { ACT_FETCH_ANALYZER_LIST } from '~/types/action-types';

const MUT_SET_ANALYZER_LIST = 'setAnalyzerList';

export const state = () => ({
  /**
   * Define state here.
   * For eg,
   * stateProp: 'this is a state property' as string
   */
  analyzerList: {
    pageInfo: {} as PageInfo,
    edges: []
  } as AnalyzerConnection | null
})

export type AnalyzerListModuleState = ReturnType<typeof state>

export const getters: GetterTree<AnalyzerListModuleState, RootState> = {
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
  [MUT_SET_ANALYZER_LIST]: (state: any, analyzerList: AnalyzerConnection) => {
    state.analyzerList = analyzerList
  }
}

export const actions: ActionTree<AnalyzerListModuleState, RootState> = {
  /**
   * Define actions here,
   * For eg,
   * async fetchThings({ commit }) {
   *  commit('CHANGE_STATE_PROP', 'New state property')
   * }
   */
  async [ACT_FETCH_ANALYZER_LIST]({ commit }) {
    let client = this.app.apolloProvider?.defaultClient
    let response = await client?.query({
      query: AnalyzersGQLQuery
    });
    commit(MUT_SET_ANALYZER_LIST, response?.data.analyzers)
  }
}