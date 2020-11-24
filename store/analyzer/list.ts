import { GetterTree, ActionTree, MutationTree, Store, ActionContext } from 'vuex'
import { GraphqlError, GraphqlQueryResponse } from '~/types/apollo-graphql-types';
import AnalyzersGQLQuery from '~/apollo/queries/analyzer/list.gql';
import { AnalyzerConnection, PageInfo } from '~/types/types'
import { RootState } from '~/store'

export const ACT_FETCH_ANALYZER_LIST = 'fetchAnalyzerList'

export const MUT_SET_ERROR = 'setAnalyzerListError'
export const MUT_SET_LOADING = 'setAnalyzerListLoading'
export const MUT_SET_ANALYZER_LIST = 'setAnalyzerList';

export interface AnalyzerListModuleState {
  loading: boolean,
  error: Record<string, any>,
  analyzerList: AnalyzerConnection
}

export const state = (): AnalyzerListModuleState => ({
  ...<AnalyzerListModuleState>({
    loading: false,
    error: {},
    analyzerList: {
      pageInfo: {} as PageInfo,
      edges: []
    }
  })
})

export type AnalyzerListActionContext = ActionContext<AnalyzerListModuleState, RootState>

export const getters: GetterTree<AnalyzerListModuleState, RootState> = {}

interface AnalyzerListModuleMutations extends MutationTree<AnalyzerListModuleState> {
  [MUT_SET_LOADING]: (state: AnalyzerListModuleState, value: boolean) => void;
  [MUT_SET_ERROR]: (state: AnalyzerListModuleState, error: GraphqlError) => void;
  [MUT_SET_ANALYZER_LIST]: (state: AnalyzerListModuleState, analyzerList: AnalyzerConnection) => void;
}

export const mutations: AnalyzerListModuleMutations = {
  [MUT_SET_LOADING]: (state, value) => {
    state.loading = value
  },
  [MUT_SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  },
  [MUT_SET_ANALYZER_LIST]: (state, analyzerList) => {
    state.analyzerList = Object.assign({}, state.analyzerList, analyzerList)
  }
}

interface AnalyzerListModuleActions extends ActionTree<AnalyzerListModuleState, RootState> {
  [ACT_FETCH_ANALYZER_LIST]: (this: Store<RootState>, injectee: AnalyzerListActionContext) => Promise<void>;
}

export const actions: AnalyzerListModuleActions = {
  async [ACT_FETCH_ANALYZER_LIST]({ commit }) {
    commit(MUT_SET_LOADING, true)
    await this.$fetchGraphqlData(AnalyzersGQLQuery, {})
      .then((response: GraphqlQueryResponse) => {
        commit(MUT_SET_ANALYZER_LIST, response.data.analyzers)
        commit(MUT_SET_LOADING, false)
      }).catch((e: GraphqlError) => {
        commit(MUT_SET_ERROR, e)
        commit(MUT_SET_LOADING, false)
      })
  }
}