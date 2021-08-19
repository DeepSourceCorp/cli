<template>
  <div class="box-content relative z-20" v-outside-click="outsideClickHandler">
    <z-input
      v-model="searchCandidate"
      class="flex-grow p-2"
      v-if="!disabled"
      @click="toggleAnalyzerList"
      @focus="toggleAnalyzerList"
      placeholder="Search Analyzers..."
    >
      <template slot="left">
        <z-icon icon="search" size="small" class="ml-1 mr-0.5"></z-icon>
      </template>
    </z-input>
    <div
      v-if="searchCandidate || showAnalyzerList || toggleSearch"
      class="absolute inline-block w-full mt-1 shadow-lg"
      :class="dropdownBgClass"
    >
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
      <div v-else-if="searchCandidate" class="flex items-center justify-center h-24">
        <div>
          No matches found for "<b>{{ searchCandidate }}</b
          >"
        </div>
      </div>
      <div v-else class="flex items-center justify-center h-24">No Analyzers found</div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, namespace } from 'nuxt-property-decorator'
import { ZIcon, ZInput, ZTag, ZButton } from '@deepsourcelabs/zeal'
import Analyzer from './Analyzer.vue'

import { AnalyzerListActions, AnalyzerListGetters, AnalyzerInterface } from '~/store/analyzer/list'

const analyzerListStore = namespace('analyzer/list')

@Component({
  components: {
    ZIcon,
    ZInput,
    ZTag,
    ZButton,
    Analyzer
  }
})
export default class AnalyzerSearch extends Vue {
  @Prop({ default: () => [] })
  selectedAnalyzers: string[] = []

  @Prop({ default: false })
  toggleSearch: boolean

  @Prop({ default: false })
  disabled: boolean

  @Prop({ default: false })
  closeOnAdd: boolean

  @Prop({ default: 'bg-ink-300' })
  dropdownBgClass: string

  @analyzerListStore.Getter(AnalyzerListGetters.ANALYZERS)
  analyzerList: AnalyzerInterface[]

  @analyzerListStore.Action(AnalyzerListActions.FETCH_ANALYZER_LIST)
  fetchAnalyzers: () => Promise<void>

  private searchCandidate = ''
  private showAnalyzerList = false

  async fetch(): Promise<void> {
    await this.fetchAnalyzers()
  }

  addAnalyzer(analyzer: AnalyzerInterface) {
    this.$emit('addAnalyzer', analyzer)
    if (this.closeOnAdd) {
      this.showAnalyzerList = false
    }
    this.searchCandidate = ''
  }

  get searchAnalyzers(): AnalyzerInterface[] {
    const analyzersNotYetSelected = this.analyzerList.filter(
      (config) => !this.selectedAnalyzers.includes(config.name)
    )
    if (this.searchCandidate) {
      return analyzersNotYetSelected.filter(
        (config) => config.name.toLowerCase().search(this.searchCandidate.toLowerCase()) >= 0
      )
    }
    return analyzersNotYetSelected
  }

  toggleAnalyzerList(): void {
    this.showAnalyzerList = !this.showAnalyzerList
  }

  outsideClickHandler(event: InputEvent): void {
    const addButton = this.$parent.$refs['add-analyzer-button'] as Vue
    if (addButton) {
      const el = addButton.$el
      if (event.target == el || el.contains(event.target as Element)) {
        return
      }
    }
    this.showAnalyzerList = false
    this.$emit('closeSearch')
  }
}
</script>
