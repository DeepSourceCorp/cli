<template>
  <z-radio-group v-model="modelValue" class="flex">
    <z-radio-button v-tooltip="'All'" value="all">
      <div class="flex h-4 items-center space-x-2 whitespace-nowrap">
        <z-icon icon="all" size="small" />
        <span v-if="modelValue === 'all'" class="text-sm leading-none">All</span>
      </div>
    </z-radio-button>
    <z-radio-button
      v-for="analyzer in languageFilters"
      :key="analyzer.shortcode"
      v-tooltip="analyzer.name"
      :value="analyzer.shortcode"
    >
      <div class="flex h-4 items-center space-x-2 whitespace-nowrap">
        <img
          class="h-4 w-auto min-w-4 flex-shrink-0"
          :src="analyzer.analyzerLogo"
          :alt="analyzer.name"
        />
        <span v-if="analyzer.shortcode === modelValue" class="text-sm leading-none">{{
          analyzer.name
        }}</span>
      </div>
    </z-radio-button>
  </z-radio-group>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ModelSync } from 'vue-property-decorator'

import RepoDetailMixin from '~/mixins/repoDetailMixin'
import { Analyzer, AnalyzerEdge } from '~/types/types'

export interface AnalyzerChoice {
  name: string
  shortcode: string
  analyzerLogo?: string
}

@Component({})
export default class IssueAnalyzerSelector extends mixins(RepoDetailMixin) {
  @ModelSync('selectedAnalyzer', 'updateAnalyzer', { type: String, default: 'all' })
  readonly modelValue: string

  async fetch(): Promise<void> {
    // Separate query later
    await this.fetchAvailableAnalyzers(this.baseRouteParams)
  }

  async refetchAnalyzers(): Promise<void> {
    this.fetchAvailableAnalyzers({
      ...this.baseRouteParams,
      refetch: true
    })
  }

  mounted(): void {
    this.$socket.$on('repo-analysis-updated', this.refetchAnalyzers)
  }

  beforeDestroy(): void {
    this.$socket.$off('repo-analysis-updated', this.refetchAnalyzers)
  }

  get languageFilters(): AnalyzerChoice[] {
    if (this.repository.availableAnalyzers) {
      const { edges } = this.repository.availableAnalyzers
      return edges
        .map((edge) => {
          const node = (edge as AnalyzerEdge).node as Analyzer
          return {
            name: node.name,
            shortcode: node.shortcode,
            analyzerLogo: node.analyzerLogo || ''
          }
        })
        .sort((a: Record<string, string>, b: Record<string, string>) => {
          if (a.shortcode < b.shortcode) {
            return -1
          }
          if (a.shortcode > b.shortcode) {
            return 1
          }
          return 0
        })
    }

    return []
  }
}
</script>
