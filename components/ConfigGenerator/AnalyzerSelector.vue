<template>
  <div class="w-full space-y-2">
    <analyzer-search
      ref="analyzer-search-component"
      :selected-analyzers="selectedAnalyzers"
      :toggle-search="showAnalyzerList"
      :is-processing="isProcessing"
      :close-on-add="true"
      @addAnalyzer="addAnalyzer"
      @removeAnalyzer="removeAnalyzer"
      @closeSearch="showAnalyzerList = false"
    />
    <template v-if="activeAnalyzers.length">
      <analyzer
        v-for="analyzer in activeAnalyzers"
        :key="analyzer.shortcode"
        class="z-20"
        v-bind="analyzer"
        :analyzer-logo="analyzer.analyzerLogo"
        :available-transformers="analyzer.transformers"
        :analyzer-meta="analyzer.meta"
        :selected-analyzer="getConfig(analyzer.shortcode)"
        :selected-transformers="userConfig.transformers"
        @onClose="removeAnalyzer(analyzer)"
        @analyzersUpdated="syncAnalyzer"
        @transformersUpdated="syncTransformers"
      >
      </analyzer>
    </template>
    <div v-else class="flex items-center h-64 border rounded-sm border-slate-400">
      <div class="max-w-md mx-auto space-y-4 font-medium text-center font-base">
        <p>
          Analyzers will find issues in your code. Add an analyzer by selecting a language you’ve
          written your code in.
        </p>
        <z-button
          ref="add-analyzer-button"
          button-type="secondary"
          icon="plus"
          size="small"
          :disabled="isProcessing"
          @click="showAnalyzerList = true"
        >
          Add Analyzer
        </z-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, namespace } from 'nuxt-property-decorator'
import { ZIcon, ZInput, ZTag, ZButton } from '@deepsource/zeal'
import Analyzer from './Analyzer.vue'
import AnalyzerSearch from './AnalyzerSearch.vue'

import {
  AnalyzerListActions,
  AnalyzerListGetters,
  AnalyzerInterface,
  TransformerInterface
} from '~/store/analyzer/list'
import { RepoConfigInterface, RepoConfigAnalyzerMeta } from '~/store/repository/detail'

const analyzerListStore = namespace('analyzer/list')

/**
 * Building the UI
 * 1. Fetch All the analyzers with their respective transformers
 * 2. Render `activeAnalyzers` in the list
 * 3. Render the rest in the search
 *
 * Analyzer Component
 * This is the where the configuration form is generated and updated.
 * It emits events when anything is updated, those events then correspond
 * to emits within the Analyzer Component
 *
 * It accpets the following props
 *    1.  availableTransformers: List of all the transformers that are
 *        available for this analyzer, for example. YAPF, Black, iSort
 *    2.  analyzerMeta: The Meta Schema for the current analyzer
 *    3.  selectedAnalyzer: The user configuration for the selected analyzer
 *        built from `userConfig`
 *    4.  selectedTransformers: User selected transformers built from `userConfig`
 *
 * It emits the following events
 *    1.  onClose: An event telling that the user has removed the analyzer
 *    2.  analyzersUpdated: user has updated the configuration from
 *    3.  transformersUpdated: user has updated the transformers
 * **/

export interface AnalyzerComponent extends Vue {
  validateConfig: () => number
}

@Component({
  components: {
    ZIcon,
    ZInput,
    ZTag,
    ZButton,
    Analyzer,
    AnalyzerSearch
  }
})
export default class AnalyzerSelector extends Vue {
  // This is the repository config updated by the user
  @Prop({ default: {} })
  userConfig: RepoConfigInterface

  @Prop({ default: false })
  isProcessing: boolean

  @analyzerListStore.Getter(AnalyzerListGetters.ANALYZERS)
  analyzerList: AnalyzerInterface[]

  @analyzerListStore.Action(AnalyzerListActions.FETCH_ANALYZER_LIST)
  fetchAnalyzers: () => Promise<void>

  private showAnalyzerList = false

  async fetch(): Promise<void> {
    await this.fetchAnalyzers()
  }

  get selectedAnalyzers(): string[] {
    return this.userConfig.analyzers.map((analyzer) => analyzer.name)
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
    analyzer.enabled = true
    this.$emit('updateAnalyzers', {
      name: analyzer.shortcode,
      meta: {},
      enabled: true
    })
  }

  removeAnalyzer(analyzer: AnalyzerInterface): void {
    analyzer.enabled = false
    this.$emit('updateAnalyzers', {
      name: analyzer.shortcode,
      meta: {},
      enabled: false
    })
  }

  validateConfig(): boolean {
    let issueCount = 0
    this.$children.forEach((child: unknown) => {
      const childProxy = child as AnalyzerComponent

      if (childProxy.validateConfig) {
        issueCount = issueCount + childProxy.validateConfig()
      }
    })

    return !(issueCount > 0)
  }

  syncAnalyzer(obj: AnalyzerInterface): void {
    this.$emit('updateAnalyzers', obj)
  }

  syncTransformers(obj: Record<string, TransformerInterface>): void {
    this.$emit('updateTransformers', obj)
  }

  getConfig(name: string): RepoConfigAnalyzerMeta | Record<string, unknown> {
    const filteredList = this.userConfig.analyzers.filter((config) => config.name === name)
    return filteredList.length ? filteredList[0] : {}
  }
}
</script>
