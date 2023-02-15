import { Component, Vue, namespace } from 'nuxt-property-decorator'
import {
  AnalyzerInterface,
  AnalyzerListActions,
  AnalyzerListGetters,
  TransformerInterface
} from '~/store/analyzer/list'
import { RepoConfigInterface } from '~/store/repository/detail'

const analyzerListStore = namespace('analyzer/list')

export interface AnalyzerComponent extends Vue {
  validateConfig: (collapseCardsIfRequired?: boolean) => number
}

const BASE_CONFIG = {
  version: 1,
  analyzers: [],
  transformers: [],
  test_patterns: [],
  exclude_patterns: []
}

@Component
export default class ConfigGeneratorMixin extends Vue {
  public templateConfig: RepoConfigInterface = JSON.parse(JSON.stringify(BASE_CONFIG))

  @analyzerListStore.Getter(AnalyzerListGetters.ANALYZERS)
  analyzerList: AnalyzerInterface[]

  @analyzerListStore.Action(AnalyzerListActions.FETCH_ANALYZER_LIST)
  fetchAnalyzers: () => Promise<void>

  get selectedAnalyzers(): string[] {
    return this.templateConfig.analyzers.map((analyzer) => analyzer.name)
  }

  get activeAnalyzers(): AnalyzerInterface[] {
    return this.analyzerList
      .filter((config) => this.selectedAnalyzers.includes(config.name))
      .sort((curr, next) => {
        const currIndex = this.selectedAnalyzers.indexOf(curr.name)
        const nextIndex = this.selectedAnalyzers.indexOf(next.name)
        return currIndex - nextIndex
      })
  }

  addAnalyzer(analyzer: AnalyzerInterface): void {
    this.templateConfig.analyzers = this.templateConfig.analyzers.concat({
      name: analyzer.name,
      meta: {},
      enabled: true
    })
  }

  removeAnalyzer(analyzerToRemove: AnalyzerInterface): void {
    this.templateConfig.analyzers = this.templateConfig.analyzers.filter(
      (analyzer) => analyzer.name !== analyzerToRemove.name
    )
  }

  syncAnalyzer(obj: AnalyzerInterface): void {
    this.templateConfig.analyzers = this.templateConfig.analyzers.map((analyzer) => {
      if (analyzer.name === obj.name) {
        Object.assign(analyzer, obj)
      }
      return analyzer
    })
  }

  syncTransformers(obj: Record<string, TransformerInterface>): void {
    if (Array.isArray(this.templateConfig.transformers)) {
      const enabled = this.templateConfig.transformers.map((transformer) => transformer.name)
      Object.keys(obj).forEach((name) => {
        if (!enabled.includes(name)) {
          this.templateConfig.transformers.push(obj[name])
        }
      })
      this.templateConfig.transformers = this.templateConfig.transformers
        .map((transformer) => {
          if (Object.keys(obj).includes(transformer.name)) {
            Object.assign(transformer, obj[transformer.name])
          }
          return transformer
        })
        .filter((transformer) => transformer.enabled)
    }
  }

  validateConfig(collapseCardsIfRequired = true): boolean {
    let issueCount = 0
    this.$children.forEach((child: unknown) => {
      const childProxy = child as AnalyzerComponent

      if (childProxy.validateConfig) {
        issueCount = issueCount + childProxy.validateConfig(collapseCardsIfRequired)
      }
    })

    return issueCount > 0 ? false : true
  }
}
