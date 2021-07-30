import { GetterTree, ActionTree, MutationTree, Store, ActionContext } from 'vuex'
import { GraphqlError, GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import AnalyzersGQLQuery from '~/apollo/queries/analyzer/list.gql'
import { AnalyzerConnection, Analyzer, TransformerTool, PageInfo } from '~/types/types'
import { RootState } from '~/store'

export interface AnalyzerMetaProperitiesInterface {
  description: string
  name: string
  items: string[] | Record<string, string>[]
  placeholder: string
  title: string
  type: string
  selected: string | number | boolean
  default: string | number | boolean | string[]
}

export interface AnalyzerMetaInterface {
  additionalProperties: boolean
  optional_required: Array<string>
  required: Array<string>
  properties: Record<string, AnalyzerMetaProperitiesInterface>
}

export interface TransformerInterface {
  name: string
  shortcode: string
  enabled: boolean
}

export interface AnalyzerInterface extends Analyzer {
  label: string
  icon: string
  enabled: boolean
  transformers: Array<TransformerTool>
  meta: AnalyzerMetaInterface
}

export enum AnalyzerListActions {
  FETCH_ANALYZER_LIST = 'fetchAnalyzerList'
}

export enum AnalyzerListGetters {
  ANALYZERS = 'getAnalyzers'
}

export enum AnalyzerListMutations {
  SET_ERROR = 'setAnalyzerListError',
  SET_LOADING = 'setAnalyzerListLoading',
  SET_ANALYZER_LIST = 'setAnalyzerList'
}

export interface AnalyzerListModuleState {
  loading: boolean
  error: Record<string, any>
  analyzerList: AnalyzerConnection
}

export const state = (): AnalyzerListModuleState => ({
  ...(<AnalyzerListModuleState>{
    loading: false,
    error: {},
    analyzerList: {
      pageInfo: {} as PageInfo,
      edges: []
    }
  })
})

export type AnalyzerListActionContext = ActionContext<AnalyzerListModuleState, RootState>

export const getters: GetterTree<AnalyzerListModuleState, RootState> = {
  [AnalyzerListGetters.ANALYZERS]: (state) => {
    // Make sure all edges have nodes
    const analyzers: Array<Analyzer> = []

    state.analyzerList.edges.forEach((edge) => {
      if (edge && edge.node) {
        analyzers.push(edge.node)
      }
    })

    return analyzers.map((node) => {
      return {
        name: node.shortcode,
        shortcode: node.shortcode,
        label: node.name,
        analyzerLogo: node.analyzerLogo,
        icon: node.shortcode,
        enabled: false,
        transformers: node.transformertoolSet.edges.map((edge) => {
          if (edge) {
            return edge.node
          }
          return {}
        }),
        meta: JSON.parse(node.metaSchema)
      }
    })
  }
}
interface AnalyzerListModuleMutations extends MutationTree<AnalyzerListModuleState> {
  [AnalyzerListMutations.SET_LOADING]: (state: AnalyzerListModuleState, value: boolean) => void
  [AnalyzerListMutations.SET_ERROR]: (state: AnalyzerListModuleState, error: GraphqlError) => void
  [AnalyzerListMutations.SET_ANALYZER_LIST]: (
    state: AnalyzerListModuleState,
    analyzerList: AnalyzerConnection
  ) => void
}

export const mutations: AnalyzerListModuleMutations = {
  [AnalyzerListMutations.SET_LOADING]: (state, value) => {
    state.loading = value
  },
  [AnalyzerListMutations.SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  },
  [AnalyzerListMutations.SET_ANALYZER_LIST]: (state, analyzerList) => {
    state.analyzerList = Object.assign({}, state.analyzerList, analyzerList)
  }
}

interface AnalyzerListModuleActions extends ActionTree<AnalyzerListModuleState, RootState> {
  [AnalyzerListActions.FETCH_ANALYZER_LIST]: (
    this: Store<RootState>,
    injectee: AnalyzerListActionContext
  ) => Promise<void>
}

export const actions: AnalyzerListModuleActions = {
  async [AnalyzerListActions.FETCH_ANALYZER_LIST]({ commit }) {
    commit(AnalyzerListMutations.SET_LOADING, true)
    await this.$fetchGraphqlData(AnalyzersGQLQuery, {})
      .then((response: GraphqlQueryResponse) => {
        commit(AnalyzerListMutations.SET_ANALYZER_LIST, response.data.analyzers)
        commit(AnalyzerListMutations.SET_LOADING, false)
      })
      .catch((e: GraphqlError) => {
        commit(AnalyzerListMutations.SET_ERROR, e)
        commit(AnalyzerListMutations.SET_LOADING, false)
      })
  }
}
