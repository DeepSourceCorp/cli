import { GetterTree, ActionTree, MutationTree, Store, ActionContext } from 'vuex'
import {
  GraphqlError,
  GraphqlMutationResponse,
  GraphqlQueryResponse
} from '~/types/apollo-graphql-types'
import AnalyzersGQLPublicQuery from '~/apollo/queries/analyzer/publicList.gql'
import AnalyzerDetailsQuery from '~/apollo/queries/analyzer/detailed.gql'
import AnalyzerIssuesQuery from '~/apollo/queries/analyzer/listIssues.gql'
import TransformersGQLPublicQuery from '~/apollo/queries/transformer/publicList.gql'
import TransformersDetailsQuery from '~/apollo/queries/transformer/detailed.gql'
import AddAnalyzerFeedbackMutation from '~/apollo/mutations/directory/addAnalyzerFeedback.gql'
import AddTransformerFeedbackMutation from '~/apollo/mutations/directory/addTransformerFeedback.gql'
import {
  AnalyzerConnection,
  Analyzer,
  TransformerTool,
  TransformerToolConnection,
  PageInfo,
  AddAnalyzerFeedbackInput,
  AddTransformerFeedbackInput
} from '~/types/types'
import { RootState } from '~/store'
import { resolveNodes } from '~/utils/array'

export enum DirectoryActions {
  FETCH_ANALYZER_DIR_LIST = 'fetchAnalyzerDirList',
  FETCH_ANALYZER_DETAILS = 'fetchAnalyzerDetails',
  FETCH_ANALYZER_ISSUES = 'fetchAnalyzerIssues',
  FETCH_TRANSFORMERS_DIR_LIST = 'fetchTransformersDirList',
  FETCH_TRANSFORMER_DETAILS = 'fetchTransformerDetails',
  ADD_ANALYZER_FEEDBACK = 'addAnalyzerFeedback',
  ADD_TRANSFORMER_FEEDBACK = 'addTransformerFeedback'
}

export enum DirectoryGetters {
  DIRECTORY_ANALYZERS = 'getDirectoryAnalyzers',
  DIRECTORY_TRANSFORMERS = 'getDirectoryTransformers'
}

export enum DirectoryMutations {
  SET_ERROR = 'setAnalyzerListError',
  SET_LOADING = 'setAnalyzerListLoading',
  SET_ANALYZER_LIST = 'setAnalyzerDirList',
  SET_TRANSFORMER_LIST = 'setTransformerDirList'
}

export interface DirectoryModuleState {
  loading: boolean
  error: GraphqlError | Record<string, unknown>
  analyzerList: AnalyzerConnection
  transformerList: TransformerToolConnection
}

export const state = (): DirectoryModuleState => ({
  ...(<DirectoryModuleState>{
    loading: false,
    error: {},
    analyzerList: {
      pageInfo: {} as PageInfo,
      edges: []
    },
    transformerList: {
      pageInfo: {} as PageInfo,
      edges: []
    }
  })
})

export type DirectoryActionContext = ActionContext<DirectoryModuleState, RootState>

export const getters: GetterTree<DirectoryModuleState, RootState> = {
  //! Also used by Discover components
  [DirectoryGetters.DIRECTORY_ANALYZERS]: (state) => {
    return resolveNodes(state.analyzerList) as Analyzer[]
  },
  [DirectoryGetters.DIRECTORY_TRANSFORMERS]: (state) => {
    return resolveNodes(state.transformerList) as TransformerTool[]
  }
}
interface DirectoryModuleMutations extends MutationTree<DirectoryModuleState> {
  [DirectoryMutations.SET_LOADING]: (state: DirectoryModuleState, value: boolean) => void

  [DirectoryMutations.SET_ERROR]: (state: DirectoryModuleState, error: GraphqlError) => void

  [DirectoryMutations.SET_ANALYZER_LIST]: (
    state: DirectoryModuleState,
    analyzerList: AnalyzerConnection
  ) => void

  [DirectoryMutations.SET_TRANSFORMER_LIST]: (
    state: DirectoryModuleState,
    transformerDirList: TransformerToolConnection
  ) => void
}

export const mutations: DirectoryModuleMutations = {
  [DirectoryMutations.SET_LOADING]: (state, value) => {
    state.loading = value
  },
  [DirectoryMutations.SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  },
  [DirectoryMutations.SET_ANALYZER_LIST]: (state, analyzerDirList) => {
    state.analyzerList = Object.assign({}, state.analyzerList, analyzerDirList)
  },
  [DirectoryMutations.SET_TRANSFORMER_LIST]: (state, transformerDirList) => {
    state.transformerList = Object.assign({}, state.transformerList, transformerDirList)
  }
}

interface DirectoryModuleActions extends ActionTree<DirectoryModuleState, RootState> {
  [DirectoryActions.FETCH_ANALYZER_DIR_LIST]: (
    this: Store<RootState>,
    injectee: DirectoryActionContext,
    args?: { q: string }
  ) => Promise<void>

  [DirectoryActions.FETCH_ANALYZER_DETAILS]: (
    this: Store<RootState>,
    injectee: DirectoryActionContext,
    args: { shortcode: string; first?: number }
  ) => Promise<Analyzer | undefined>

  [DirectoryActions.FETCH_ANALYZER_ISSUES]: (
    this: Store<RootState>,
    injectee: DirectoryActionContext,
    args: {
      shortcode: string
      first: number
      offset: number
      autofixAvailable: boolean
      q: string
      issueType: string
    }
  ) => Promise<Analyzer | undefined>

  [DirectoryActions.FETCH_TRANSFORMERS_DIR_LIST]: (
    this: Store<RootState>,
    injectee: DirectoryActionContext,
    args?: { q: string }
  ) => Promise<void>

  [DirectoryActions.FETCH_TRANSFORMER_DETAILS]: (
    this: Store<RootState>,
    injectee: DirectoryActionContext,
    args?: { shortcode: string }
  ) => Promise<TransformerTool | undefined>

  [DirectoryActions.ADD_ANALYZER_FEEDBACK]: (
    this: Store<RootState>,
    injectee: DirectoryActionContext,
    args: { input: AddAnalyzerFeedbackInput }
  ) => Promise<boolean>

  [DirectoryActions.ADD_TRANSFORMER_FEEDBACK]: (
    this: Store<RootState>,
    injectee: DirectoryActionContext,
    args: { input: AddTransformerFeedbackInput }
  ) => Promise<boolean>
}

export const actions: DirectoryModuleActions = {
  //! Also used by Discover components
  async [DirectoryActions.FETCH_ANALYZER_DIR_LIST]({ commit }, args) {
    commit(DirectoryMutations.SET_LOADING, true)
    await this.$fetchGraphqlData(AnalyzersGQLPublicQuery, args)
      .then((response: GraphqlQueryResponse) => {
        commit(DirectoryMutations.SET_ANALYZER_LIST, response.data.analyzers)
        commit(DirectoryMutations.SET_LOADING, false)
      })
      .catch((e: GraphqlError) => {
        commit(DirectoryMutations.SET_ERROR, e)
        commit(DirectoryMutations.SET_LOADING, false)
      })
  },
  async [DirectoryActions.FETCH_ANALYZER_DETAILS]({ commit }, { shortcode, first = 5 }) {
    commit(DirectoryMutations.SET_LOADING, true)
    try {
      const analyzerResponse = (await this.$fetchGraphqlData(AnalyzerDetailsQuery, {
        shortcode,
        first
      })) as GraphqlQueryResponse
      if (analyzerResponse && analyzerResponse.data) {
        return analyzerResponse.data.analyzer as Analyzer
      }
    } catch (e) {
      commit(DirectoryMutations.SET_ERROR, e as GraphqlError)
    } finally {
      commit(DirectoryMutations.SET_LOADING, false)
    }
  },
  async [DirectoryActions.FETCH_ANALYZER_ISSUES]({ commit }, { first = 20, ...rest }) {
    commit(DirectoryMutations.SET_LOADING, true)
    try {
      const analyzerResponse = (await this.$fetchGraphqlData(AnalyzerIssuesQuery, {
        first,
        ...rest
      })) as GraphqlQueryResponse
      if (analyzerResponse && analyzerResponse.data) {
        return analyzerResponse.data.analyzer as Analyzer
      }
    } catch (e) {
      commit(DirectoryMutations.SET_ERROR, e as GraphqlError)
    } finally {
      commit(DirectoryMutations.SET_LOADING, false)
    }
  },
  async [DirectoryActions.FETCH_TRANSFORMERS_DIR_LIST]({ commit }, args) {
    commit(DirectoryMutations.SET_LOADING, true)
    await this.$fetchGraphqlData(TransformersGQLPublicQuery, args)
      .then((response: GraphqlQueryResponse) => {
        commit(DirectoryMutations.SET_TRANSFORMER_LIST, response.data.transformers)
        commit(DirectoryMutations.SET_LOADING, false)
      })
      .catch((e: GraphqlError) => {
        commit(DirectoryMutations.SET_ERROR, e)
        commit(DirectoryMutations.SET_LOADING, false)
      })
  },
  async [DirectoryActions.ADD_ANALYZER_FEEDBACK]({ commit }, { input }) {
    try {
      const feedbackResponse = (await this.$applyGraphqlMutation(AddAnalyzerFeedbackMutation, {
        input
      })) as GraphqlMutationResponse
      if (feedbackResponse?.data.addAnalyzerFeedback?.ok) {
        this.$toast.success('Feedback successfully submitted.')
        return true
      }
    } catch (e) {
      commit(DirectoryMutations.SET_ERROR, e as GraphqlError)
      this.$logErrorAndToast(e as Error, 'There was an error submitting your feedback.')
    }
    return false
  },
  async [DirectoryActions.FETCH_TRANSFORMER_DETAILS]({ commit }, args) {
    commit(DirectoryMutations.SET_LOADING, true)
    try {
      const transformerResposne = (await this.$fetchGraphqlData(
        TransformersDetailsQuery,
        args
      )) as GraphqlQueryResponse
      if (transformerResposne && transformerResposne.data) {
        return transformerResposne.data.transformer as TransformerTool
      }
    } catch (e) {
      commit(DirectoryMutations.SET_ERROR, e as GraphqlError)
    } finally {
      commit(DirectoryMutations.SET_LOADING, false)
    }
  },
  async [DirectoryActions.ADD_TRANSFORMER_FEEDBACK]({ commit }, { input }) {
    try {
      const feedbackResponse = (await this.$applyGraphqlMutation(AddTransformerFeedbackMutation, {
        input
      })) as GraphqlMutationResponse
      if (feedbackResponse?.data.addTransformerFeedback?.ok) {
        this.$toast.success('Feedback successfully submitted.')
        return true
      }
    } catch (e) {
      commit(DirectoryMutations.SET_ERROR, e as GraphqlError)
      this.$logErrorAndToast(e as Error, 'There was an error submitting your feedback.')
    }
    return false
  }
}
