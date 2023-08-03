<template>
  <div v-outside-click="outsideClickHandler" class="relative z-20 box-content">
    <z-input
      v-if="!disabled"
      v-model="searchCandidate"
      icon-position="left"
      spacing="tight"
      background-color="ink-300"
      :show-border="false"
      :placeholder="isProcessing ? 'Processing preset...' : 'Search Analyzers...'"
      class="flex-grow rounded-md p-2"
      @focus="toggleAnalyzerList"
      @click="toggleAnalyzerList"
    >
      <template #left>
        <z-icon
          :icon="isProcessing ? 'spin-loader' : 'search'"
          size="small"
          class="ml-1 mr-0.5"
          :class="{ 'animate-spin': isProcessing }"
        />
      </template>
    </z-input>
    <div
      v-if="searchCandidate || showAnalyzerList || toggleSearch"
      class="absolute mt-1 inline-block w-full shadow-double-dark"
      :class="dropdownBgClass"
    >
      <ul v-if="searchAnalyzers.length" class="grid grid-cols-3 gap-2 p-2">
        <li
          v-for="analyzer in searchAnalyzers"
          :key="analyzer.name"
          class="flex cursor-pointer items-center justify-between rounded-md px-2 py-2 hover:bg-ink-200"
          :class="selectedAnalyzers.includes(analyzer.name) ? 'bg-ink-200' : 'bg-ink-400'"
          @click="toggleAnalyzer(analyzer)"
        >
          <span class="flex w-full items-center space-x-2">
            <analyzer-logo v-bind="analyzer" :hide-tooltip="true" />
            <span>{{ analyzer.label }}</span>
            <z-tag
              v-if="analyzer.isBeta"
              text-size="xxs"
              spacing="py-1 px-3"
              bg-color="ink-200"
              class="text-xxs font-thin uppercase leading-none tracking-wider"
              >Beta</z-tag
            >
          </span>
          <span
            v-show="selectedAnalyzers.includes(analyzer.name)"
            class="flex items-center justify-center rounded-full p-0.5"
          >
            <z-icon icon="check" size="small" class="stroke-2" color="vanilla-100" />
          </span>
        </li>
      </ul>
      <div v-else-if="searchCandidate" class="flex h-24 items-center justify-center">
        <div>
          No matches found for "<b>{{ searchCandidate }}</b
          >"
        </div>
      </div>
      <div v-else class="flex h-24 items-center justify-center">No Analyzers found</div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, mixins } from 'nuxt-property-decorator'
import Analyzer from './Analyzer.vue'

import { AnalyzerInterface } from '~/store/analyzer/list'
import AnalyzerListMixin from '~/mixins/analyzerListMixin'

/**
 * Search component for searching Analyzers.
 */
@Component({
  components: {
    Analyzer
  }
})
export default class AnalyzerSearch extends mixins(AnalyzerListMixin) {
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

  @Prop({ default: false })
  isProcessing: boolean

  @Prop({ default: false })
  showSelectedAnalyzers: boolean

  private searchCandidate = ''
  private showAnalyzerList = false

  /**
   * Fetch hook for analyzer search, this fetches list of all analyzers
   *
   * @return {Promise<void>}
   */
  async fetch(): Promise<void> {
    await this.fetchAnalyzers()
  }

  /**
   * trigger the add analyzers event
   * and close the search if specified so
   *
   * @param {AnalyzerInterface} analyzer
   *
   * @return {any}
   */
  toggleAnalyzer(analyzer: AnalyzerInterface) {
    if (this.selectedAnalyzers.includes(analyzer.name)) {
      this.$emit('removeAnalyzer', analyzer)
    } else {
      this.$emit('addAnalyzer', analyzer)
    }

    if (this.closeOnAdd) {
      this.showAnalyzerList = false
    }

    this.searchCandidate = ''
  }

  get searchAnalyzers(): AnalyzerInterface[] {
    const analyzersNotYetSelected = this.showSelectedAnalyzers
      ? this.analyzerList.filter((config) => !this.selectedAnalyzers.includes(config.name))
      : this.analyzerList

    if (this.searchCandidate) {
      return analyzersNotYetSelected.filter(
        (config) => config.name.toLowerCase().search(this.searchCandidate.toLowerCase()) >= 0
      )
    }
    return analyzersNotYetSelected
  }

  /**
   * toggle the search dropdown
   * @return {void}
   */
  toggleAnalyzerList(): void {
    this.showAnalyzerList = !this.showAnalyzerList
  }

  /**
   * Outside click handler to ignore the add analyzer button
   *
   * @param {InputEvent} event
   *
   * @return {void}
   */
  outsideClickHandler(event: InputEvent): void {
    const addButton = this.$parent?.$refs['add-analyzer-button'] as Vue
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
