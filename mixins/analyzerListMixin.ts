import { Component, Vue, namespace } from 'nuxt-property-decorator'
import { AnalyzerInterface, AnalyzerListActions, AnalyzerListGetters } from '~/store/analyzer/list'

const analyzerListStore = namespace('analyzer/list')

@Component
export default class AnalyzerListMixin extends Vue {
  @analyzerListStore.Getter(AnalyzerListGetters.ANALYZERS)
  analyzerList: AnalyzerInterface[]

  @analyzerListStore.Action(AnalyzerListActions.FETCH_ANALYZER_LIST)
  fetchAnalyzers: () => Promise<void>

  @analyzerListStore.Action(AnalyzerListActions.CHECK_ANALYZER_EXISTS)
  checkAnalyzerExists: (arg?: { shortcode: string }) => Promise<boolean>

  @analyzerListStore.Action(AnalyzerListActions.CHECK_TRANSFORMER_EXISTS)
  checkTransformerExists: (arg?: {
    shortcode: string
    analyzerShortcode: string
  }) => Promise<boolean>
}
