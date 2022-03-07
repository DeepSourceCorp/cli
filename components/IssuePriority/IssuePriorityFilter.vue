<template>
  <z-badge :is-dot="filterApplied" type="success" size="md">
    <z-menu v-if="!filterApplied" direction="right" width="small" class="text-vanilla-100">
      <template v-slot:trigger="{ toggle }">
        <z-button
          size="small"
          label="Filter"
          icon="z-filter"
          class="outline-none text-vanilla-100 focus:outline-none"
          :class="buttonBackground"
          @click="toggle"
        />
      </template>
      <template slot="body" class="text-vanilla-200">
        <div class="max-h-56 overflow-y-auto">
          <z-menu-item
            v-for="filter in languageFilters"
            :key="filter.shortcode"
            :icon="filter.shortcode"
            @click="modelValue = filter.shortcode"
          >
            {{ filter.name }}
          </z-menu-item>
        </div>
      </template>
    </z-menu>

    <z-button
      v-else
      size="small"
      class="outline-none text-vanilla-100 focus:outline-none"
      :class="buttonBackground"
      @click="modelValue = ''"
    >
      <div class="flex items-center gap-x-2">
        <span class="items-center xl:flex gap-x-1">
          <template v-if="languageFilters[modelValue]">
            <analyzer-logo v-bind="languageFilters[modelValue]" class="flex-shrink-0 w-5" />
            <span class="hidden md:block">
              {{ languageFilters[modelValue].name }}
            </span>
          </template>
          <template v-else>
            <z-icon :icon="modelValue" />
            <span class="hidden md:block">
              {{ modelValue }}
            </span>
          </template>
        </span>
        <z-icon icon="x" size="small" />
      </div>
    </z-button>
  </z-badge>
</template>

<script lang="ts">
import { Component, mixins, namespace, Prop } from 'nuxt-property-decorator'
import { ModelSync } from 'vue-property-decorator'
import { ZIcon, ZButton, ZInput, ZMenu, ZMenuItem, ZBadge } from '@deepsourcelabs/zeal'
import AnalyzerLogo from '~/components/AnalyzerLogo.vue'
import { Analyzer, AnalyzerConnection, IssuePriorityLevel, Maybe } from '~/types/types'
import { resolveNodes } from '~/utils/array'

import RepoDetailMixin from '~/mixins/repoDetailMixin'
import AnalyzerListMixin from '~/mixins/analyzerListMixin'

const analyzerListStore = namespace('analyzer/list')

export interface AnalyzerChoice {
  name: string
  shortcode: string
  analyzerLogo?: string
}

/**
 * Component to filter issues based on analyzer
 */
@Component({
  components: {
    ZIcon,
    ZButton,
    ZInput,
    ZMenu,
    ZMenuItem,
    ZBadge,
    AnalyzerLogo
  }
})
export default class IssuePriorityFilter extends mixins(AnalyzerListMixin, RepoDetailMixin) {
  @ModelSync('selectedAnalyzer', 'updateAnalyzer', { type: String })
  readonly modelValue: string

  @Prop({ default: 'bg-ink-300 hover:bg-ink-200' })
  buttonBackground: string

  @Prop({ default: IssuePriorityLevel.Repository })
  level: IssuePriorityLevel

  @analyzerListStore.State('analyzerList')
  stateAnalyzerList: AnalyzerConnection

  /**
   * fetch hook for vue component
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    this.level === IssuePriorityLevel.Repository
      ? await this.fetchAvailableAnalyzers(this.baseRouteParams)
      : await this.fetchAnalyzers()
  }

  /**
   * Method to fetch available analyzers for a repository
   *
   * @returns {Promise<void>}
   */
  async refetchAnalyzers(): Promise<void> {
    this.fetchAvailableAnalyzers({
      ...this.baseRouteParams,
      refetch: true
    })
  }

  /**
   * mounted hook for Vue component
   *
   * @returns {void}
   */
  mounted(): void {
    if (this.level === IssuePriorityLevel.Repository) {
      this.$socket.$on('repo-analysis-updated', this.refetchAnalyzers)
    }
  }

  /**
   * beforeDestroy hook for Vue component
   *
   * @returns {void}
   */
  beforeDestroy(): void {
    if (this.level === IssuePriorityLevel.Repository) {
      this.$socket.$off('repo-analysis-updated', this.refetchAnalyzers)
    }
  }

  get languageFilters(): Record<string, AnalyzerChoice> {
    const repoAnalyzers =
      this.level === IssuePriorityLevel.Repository
        ? (resolveNodes(this.repository.availableAnalyzers) as Analyzer[])
        : (resolveNodes(this.stateAnalyzerList) as Analyzer[])

    const analyzerFilters: Record<string, AnalyzerChoice> = {}
    repoAnalyzers.forEach((repoAnalyzer) => {
      const { name, shortcode, analyzerLogo } = repoAnalyzer
      analyzerFilters[shortcode] = {
        name,
        shortcode,
        analyzerLogo: analyzerLogo || ''
      }
    })
    return analyzerFilters
  }

  get filterApplied(): boolean {
    return Boolean(this.modelValue)
  }
}
</script>
