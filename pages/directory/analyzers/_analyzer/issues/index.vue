<template>
  <div>
    <div
      class="
        flex flex-row-reverse
        items-center
        px-4
        py-3
        border-b
        gap-x-2
        border-ink-200
        lg:flex-row
      "
    >
      <div
        class="duration-300 ease-in-out border rounded-md border-ink-200"
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
          <span class="px-1 truncate">Filter by Autofix</span>
          <z-icon
            icon="plus"
            size="small"
            color="vanilla-200"
            class="duration-75 transform"
            :class="{
              'rotate-45': onlyAutofix
            }"
          />
        </z-button>
      </div>
      <z-input
        size="small"
        placeholder="Search for issue title or issue code"
        background-color="ink-300"
        :show-border="false"
        :value="searchTerm"
        :disabled="!isLoaded"
        class="w-full lg:max-w-xs"
        @debounceInput="searchDir"
      >
        <z-icon icon="search" size="small" slot="left" class="ml-1" />
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
        class="block mb-3"
      />
      <div class="flex justify-center mt-6 text-sm">
        <z-pagination
          v-if="totalPageCount > 1"
          :page="currentPage"
          :totalPages="totalPageCount"
          :totalVisible="perPageCount"
          @selected="updatePageNum"
        />
      </div>
    </div>
    <lazy-empty-state
      v-else
      title="No issues found!"
      :webp-image-path="require('~/assets/images/ui-states/directory/empty-search.webp')"
      :png-image-path="require('~/assets/images/ui-states/directory/empty-search.png')"
      image-width="w-28"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'

import { ZButton, ZInput, ZIcon, ZPagination } from '@deepsourcelabs/zeal'

import { Analyzer, Issue } from '~/types/types'
import { resolveNodes } from '~/utils/array'
import MetaMixin from '~/mixins/metaMixin'

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

  created() {
    this.metaTitle = `Issues • ${this.analyzer.name} Analyzer by DeepSource`
    this.metaDescription = this.getMetaDescription(this.analyzer)
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

  filterByAutofixable(): void {
    this.onlyAutofix = !this.onlyAutofix
    this.$emit('filter-by-autofix')
  }

  searchDir(val: string): void {
    this.searchTerm = val
    this.$emit('filter-by-text', val)
  }

  updatePageNum(val: number): void {
    this.$emit('update-page', val)
  }

  getMetaDescription(analyzer: Analyzer): string {
    if (analyzer.shortcode === 'test-coverage')
      return "DeepSource's Test Coverage Analyzer tracks the test coverage of your code. Learn all about it here."
    if (analyzer.shortcode === 'secrets')
      return "DeepSource's Secrets Analyzer runs continuous static analysis on your code and helps you find various security issues. Learn all about it here."
    return `DeepSource's ${analyzer.name} Analyzer continuously analyzes your ${
      analyzer.name
    } code and helps you find${
      analyzer.autofixableIssuesCount ? ' and fix' : ''
    } various code quality issues. Learn all about it here.`
  }
}
</script>
