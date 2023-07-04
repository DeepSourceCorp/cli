import { GetterTree, ActionTree, MutationTree, Store, ActionContext } from 'vuex'
import { GraphqlError, GraphqlQueryResponse } from '~/types/apollo-graphql-types'

import { AnalyzerConnection, Analyzer, TransformerTool, PageInfo } from '~/types/types'
import { RootState } from '~/store'

import AnalyzersGQLQuery from '~/apollo/queries/analyzer/list.gql'
import CheckAnalyzerExistsQuery from '~/apollo/queries/analyzer/checkExists.gql'
import CheckTransformerExistsQuery from '~/apollo/queries/transformer/checkExists.gql'
import AnalyzerNamesQuery from '~/apollo/queries/analyzer/names.gql'
import { resolveNodes } from '~/utils/array'

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
  FETCH_ANALYZER_INFO = 'fetchAnalyzerInfo',
  FETCH_ANALYZER_LIST = 'fetchAnalyzerList',
  CHECK_ANALYZER_EXISTS = 'checkAnalyzerExists',
  CHECK_TRANSFORMER_EXISTS = 'checkTransformerExists',
  FETCH_ANALYZER_NAMES = 'fetchAnalyzerNames'
}

export enum AnalyzerListGetters {
  GET_ANALYZER_INFO = 'getAnalyzerInfo',
  ANALYZERS = 'getAnalyzers'
}

export enum AnalyzerListMutations {
  SET_ERROR = 'setAnalyzerListError',
  SET_LOADING = 'setAnalyzerListLoading',
  SET_ANALYZER_INFO = 'setAnalyzerInfo',
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
//! DO NOT MODIFY, unless changing /generate-config logic
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

  [AnalyzerListActions.CHECK_ANALYZER_EXISTS]: (
    this: Store<RootState>,
    injectee: AnalyzerListActionContext,
    args: { shortcode: string }
  ) => Promise<boolean>

  [AnalyzerListActions.CHECK_TRANSFORMER_EXISTS]: (
    this: Store<RootState>,
    injectee: AnalyzerListActionContext,
    args: { shortcode: string; analyzerShortcode: string }
  ) => Promise<boolean>

  [AnalyzerListActions.FETCH_ANALYZER_NAMES]: (
    this: Store<RootState>,
    injectee: AnalyzerListActionContext,
    args: {
      categories?: string[]
    }
  ) => Promise<Analyzer[]>
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
  },
  async [AnalyzerListActions.CHECK_ANALYZER_EXISTS]({ commit }, args) {
    commit(AnalyzerListMutations.SET_LOADING, true)
    try {
      const checkAnalyzerExistsResponse = (await this.$fetchGraphqlData(
        CheckAnalyzerExistsQuery,
        args,
        false,
        false
      )) as GraphqlQueryResponse
      if (checkAnalyzerExistsResponse.data.analyzer?.name) {
        return true
      }
    } catch (e) {}
    commit(AnalyzerListMutations.SET_LOADING, false)
    return false
  },
  async [AnalyzerListActions.CHECK_TRANSFORMER_EXISTS]({ commit }, { analyzerShortcode, ...rest }) {
    commit(AnalyzerListMutations.SET_LOADING, true)
    try {
      const checkAnalyzerExistsResponse = (await this.$fetchGraphqlData(
        CheckTransformerExistsQuery,
        { ...rest }
      )) as GraphqlQueryResponse
      if (
        checkAnalyzerExistsResponse.data.transformer?.name &&
        checkAnalyzerExistsResponse.data.transformer?.analyzer?.shortcode === analyzerShortcode
      ) {
        return true
      }
    } catch (e) {}
    commit(AnalyzerListMutations.SET_LOADING, false)
    return false
  },
  async [AnalyzerListActions.FETCH_ANALYZER_NAMES](_context, { categories }) {
    const response = (await this.$fetchGraphqlData(AnalyzerNamesQuery, {
      categories
    })) as GraphqlQueryResponse

    return resolveNodes(response.data.analyzers)
  }
}
