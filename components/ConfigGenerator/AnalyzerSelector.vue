<template>
  <div class="w-full space-y-2">
    <div class="box-content relative z-20" v-outside-click="outsideClickHandler">
      <z-input
        v-model="searchCanidate"
        class="flex-grow p-2"
        @click="toggleAnalyzerList"
        @focus="toggleAnalyzerList"
        placeholder="Search for Analyzer"
      >
        <template slot="left">
          <z-icon icon="search" size="small" class="ml-1 mr-0.5"></z-icon>
        </template>
      </z-input>
      <div v-if="showAnalyzers" class="absolute inline-block w-full mt-1 bg-ink-300 shadow-lg">
        <ul v-if="searchAnalyzers.length" class="grid grid-cols-3 gap-2 p-2">
          <li
            v-for="analyzer in searchAnalyzers"
            :key="analyzer.name"
            @click="addAnalyzer(analyzer)"
            class="flex items-center justify-between px-2 py-2 rounded-md cursor-pointer bg-ink-400 hover:bg-ink-200"
          >
            <span class="flex items-center space-x-2">
              <analyzer-logo v-bind="analyzer" :hideTooltip="true" />
              <span>{{ analyzer.label }}</span>
              <z-tag
                v-if="analyzer.isBeta"
                text-size="xxs"
                spacing="py-1 px-3"
                bgColor="ink-200"
                class="font-thin leading-none tracking-wider uppercase text-xxs"
                >Beta</z-tag
              >
            </span>
            <span>
              <z-icon icon="plus" color="juniper" size="small" />
            </span>
          </li>
        </ul>
        <div v-else class="flex items-center justify-center h-24">No Matches</div>
      </div>
    </div>
    <template v-if="activeAnalyzers.length">
      <analyzer
        class="z-20"
        v-for="analyzer in activeAnalyzers"
        :key="analyzer.shortcode"
        v-bind="analyzer"
        :analyzerLogo="analyzer.analyzerLogo"
        :availableTransformers="analyzer.transformers"
        :analyzerMeta="analyzer.meta"
        :selectedAnalyzer="getConfig(analyzer.shortcode)"
        :selectedTransformers="userConfig.transformers"
        @onClose="removeAnalyzer(analyzer)"
        @analyzersUpdated="syncAnalyzer"
        @transformersUpdated="syncTransformers"
      >
      </analyzer>
    </template>
    <div v-else class="flex items-center h-64 border rounded-sm border-ink-300">
      <div class="max-w-md mx-auto space-y-4 font-medium text-center font-base">
        <p>
          Analyzers will find issues in your code. Add an analyzer by selecting a language you’ve
          written your code in.
        </p>
        <z-button
          @click="toggleAnalyzerList"
          ref="add-analyzer-button"
          buttonType="secondary"
          icon="plus"
          size="small"
        >
          Add Analyzer
        </z-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, namespace } from 'nuxt-property-decorator'
import { ZIcon, ZStepper, ZStep, ZInput, ZTag, ZButton } from '@deepsourcelabs/zeal'
import Analyzer from './Analyzer.vue'

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
    ZStepper,
    ZStep,
    ZInput,
    ZTag,
    ZButton,
    Analyzer
  }
})
export default class AnalyzerSelector extends Vue {
  // This is the repository config updated by the user
  @Prop({ default: {} })
  userConfig: RepoConfigInterface

  @analyzerListStore.Getter(AnalyzerListGetters.ANALYZERS)
  analyzerList: AnalyzerInterface[]

  @analyzerListStore.Action(AnalyzerListActions.FETCH_ANALYZER_LIST)
  fetchAnalyzers: () => Promise<void>

  private searchCanidate = ''
  private showAnalyzerList = false

  async fetch(): Promise<void> {
    await this.fetchAnalyzers()
  }

  get searchAnalyzers(): AnalyzerInterface[] {
    const analyzersNotYetSelected = this.analyzerList.filter(
      (config) => !this.selectedAnalyzers.includes(config.name)
    )
    if (this.searchCanidate) {
      return analyzersNotYetSelected.filter(
        (config) => config.name.search(this.searchCanidate) >= 0
      )
    }
    return analyzersNotYetSelected
  }

  get showAnalyzers(): boolean {
    return Boolean(this.searchCanidate) || this.showAnalyzerList
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
    this.showAnalyzerList = false
    this.searchCanidate = ''
  }

  removeAnalyzer(analyzer: AnalyzerInterface): void {
    analyzer.enabled = false
    this.$emit('updateAnalyzers', {
      name: analyzer.shortcode,
      meta: {},
      enabled: false
    })
  }

  toggleAnalyzerList(): void {
    this.showAnalyzerList = !this.showAnalyzerList
  }

  validateConfig(): boolean {
    let issueCount = 0
    this.$children.forEach((child: unknown) => {
      const childProxy = child as AnalyzerComponent

      if (childProxy.validateConfig) {
        issueCount = issueCount + childProxy.validateConfig()
      }
    })

    return issueCount > 0 ? false : true
  }

  outsideClickHandler(event: InputEvent): void {
    const addButton = this.$refs['add-analyzer-button'] as Vue
    if (addButton) {
      const el = addButton.$el
      if (event.target == el || el.contains(event.target as Element)) {
        return
      }
      this.showAnalyzerList = false
    }
    this.showAnalyzerList = false
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
