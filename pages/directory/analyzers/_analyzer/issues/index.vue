<template>
  <div>
    <div
      class="flex flex-row-reverse items-center gap-x-2 border-b border-slate-400 px-4 py-3 lg:flex-row"
    >
      <div
        class="rounded-md border border-slate-400 duration-300 ease-in-out"
        :class="
          onlyAutofix
            ? 'border-solid bg-vanilla-100 bg-opacity-5'
            : 'border-dashed hover:border-solid'
        "
      >
        <z-button
          :show-border="false"
          button-type="ghost"
          :color="onlyAutofix ? 'vanilla-100' : 'vanilla-200'"
          size="small"
          :disabled="!isLoaded"
          @click="filterByAutofixable"
        >
          <z-icon icon="autofix" size="small" color="vanilla-200" />
          <span class="truncate px-1">Filter by Autofix</span>
          <z-icon
            icon="plus"
            size="small"
            color="vanilla-200"
            class="transform duration-75"
            :class="{
              'rotate-45': onlyAutofix
            }"
          />
        </z-button>
      </div>
      <z-input
        size="small"
        placeholder="Search for an issue..."
        background-color="ink-300"
        :show-border="false"
        :value="searchTerm"
        class="w-full lg:max-w-xs"
        @debounceInput="searchDir"
      >
        <template #left>
          <z-icon icon="search" size="small" class="ml-1" />
        </template>
      </z-input>
    </div>
    <div v-if="!isLoaded" class="p-4">
      <issue-dir-card-skeleton v-for="id in 5" :key="id" class="mb-3" />
    </div>
    <div v-else-if="analyzerIssues.length" class="p-4 pb-12 lg:pb-4">
      <issue-dir-card
        v-for="issue in analyzerIssues"
        :key="issue.shortcode"
        :issue="issue"
        :issue-type-title="issueTypeTitles[issue.issueType]"
        :analyzer-url="analyzerUrl"
        class="mb-3 block"
      />
      <div class="mt-6 flex justify-center text-sm">
        <z-pagination
          v-if="totalPageCount > 1"
          :page="currentPage"
          :total-pages="totalPageCount"
          :total-visible="perPageCount"
          @selected="updatePageNum"
        />
      </div>
    </div>
    <lazy-empty-state
      v-else
      :title="searchTerm ? `No results found for '${searchTerm}'` : 'No issues found!'"
      :subtitle="
        searchTerm
          ? `We couldn't find any items for this phrase. Try changing your search query.`
          : 'That’s all we can say right now.'
      "
      :webp-image-path="
        searchTerm ? require('~/assets/images/ui-states/directory/empty-search.webp') : undefined
      "
      :png-image-path="
        searchTerm ? require('~/assets/images/ui-states/directory/empty-search.gif') : undefined
      "
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, mixins, Watch } from 'nuxt-property-decorator'

import { ZButton, ZInput, ZIcon, ZPagination } from '@deepsource/zeal'

import { Analyzer, Issue } from '~/types/types'
import { resolveNodes } from '~/utils/array'
import MetaMixin from '~/mixins/metaMixin'

/**
 * Issues page for a particular analyzer in analyzer directory.
 */
@Component({
  components: { ZButton, ZIcon, ZInput, ZPagination },
  layout: 'sidebar-only',
  scrollToTop: true
})
export default class AnalyzerDirectoryDetails extends mixins(MetaMixin) {
  @Prop()
  analyzer!: Analyzer

  @Prop()
  isLoaded!: boolean

  @Prop()
  perPageCount!: number

  @Prop()
  currentPage!: number

  @Prop()
  issueTypeTitles!: Record<string, string>

  private onlyAutofix = false
  private searchTerm = ''
  setCanonical = true

  /**
   * Watcher for analyzer shortcode that updates meta information on change.
   *
   * @param {string} newShortcode - New value of `analyzer.shortcode`.
   * @returns {void}
   */
  @Watch('analyzer.shortcode', { immediate: true })
  generateMeta(newShortcode: string): void {
    if (newShortcode) {
      this.metaTitle = `Issues • ${this.analyzer.name} Analyzer by DeepSource`
      this.metaDescription = this.getMetaDescription(this.analyzer)
    }
  }

  get analyzerUrl(): string {
    return `/directory/analyzers/${this.analyzer.shortcode || this.$route.params.analyzer}`
  }

  get analyzerIssues(): Issue[] {
    return resolveNodes(this.analyzer.issues) as Issue[]
  }

  get totalPageCount(): number {
    if (this.analyzer && this.analyzer.issues.totalCount)
      return Math.ceil(this.analyzer.issues.totalCount / this.perPageCount)
    return 0
  }

  /**
   * Emits an event for `filter-by-autofix` to toggle filter value.
   *
   * @returns {void}
   */
  filterByAutofixable(): void {
    this.onlyAutofix = !this.onlyAutofix
    this.$emit('filter-by-autofix')
  }

  /**
   * Emits an event for `filter-by-text` to filter data by search term.
   *
   * @param {string} val - Search term to emit.
   * @returns {voids}
   */
  searchDir(val: string): void {
    this.searchTerm = val
    this.$emit('filter-by-text', val)
  }

  /**
   * Emits an event for `update-page` to update pagination.
   *
   * @param {number} val - Page number to update to.
   * @returns {void}
   */
  updatePageNum(val: number): void {
    this.$emit('update-page', val)
  }

  /**
   * Function to return appropriate meta description for a given analyzer.
   *
   * @param {Analyzer} analyzer
   * @returns {void}
   */
  getMetaDescription(analyzer: Analyzer): string {
    switch (analyzer.shortcode) {
      case 'test-coverage':
        return "DeepSource's Test Coverage Analyzer tracks the test coverage of your code. Learn all about it here."

      case 'secrets':
        return "DeepSource's Secrets Analyzer runs continuous static analysis on your code and helps you find various security issues. Learn all about it here."

      default:
        return `DeepSource's ${analyzer.name} Analyzer continuously analyzes your ${
          analyzer.name
        } code and helps you find${
          analyzer.autofixableIssuesCount ? ' and fix' : ''
        } various code quality issues. Learn all about it here.`
    }
  }
}
</script>
