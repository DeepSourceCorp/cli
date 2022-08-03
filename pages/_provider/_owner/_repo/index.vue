<template>
  <div class="p-4 space-y-6">
    <issue-overview-cards />
    <!-- <alerting-metrics-section :routeToMetricsPage="true" /> -->
    <code-quality-graph />
    <client-only>
      <recent-runs-section />
    </client-only>
  </div>
</template>
<script lang="ts">
// Internals
import { Component, mixins } from 'nuxt-property-decorator'

// Components
import { CodeQualityGraph } from '@/components/Graphs'
import { TransformCard } from '@/components/History'
import { AutofixListItem } from '@/components/Autofix'
import { IssueOverviewCards, RecentRunsSection } from '@/components/RepoOverview'

import RepoDetailMixin from '~/mixins/repoDetailMixin'

export interface Widget {
  title: string
  value_display: number
  link: string
  description: string
  hint?: string
  has_trend_value: boolean
  trend_direction: string | null
  trend_value: string
  trend_display: string
  trend_positive: boolean
}

/**
 * Repo home page
 */
@Component({
  components: {
    IssueOverviewCards,
    RecentRunsSection,
    CodeQualityGraph,
    TransformCard,
    AutofixListItem
  },
  layout: 'repository'
})
export default class Overview extends mixins(RepoDetailMixin) {
  /**
   * Fetch hook to fetch all the basic details for a repository
   * @return {Promise<void>}
   */
  async fetch(): Promise<void> {
    try {
      await this.fetchBasicRepoDetails(this.baseRouteParams)
      this.fetchRepoDetails(this.baseRouteParams)
    } catch (e) {
      this.$toast.danger('There was a problem loading this repository')
    }
  }

  /**
   * Head hook to add meta details to the page
   * @return {Record<string, string>}
   */
  head(): Record<string, string> {
    const { repo, owner } = this.$route.params
    return {
      title: `${owner}/${repo} • DeepSource`,
      description:
        'DeepSource is an automated code review tool that helps developers automatically find and fix issues in their code.'
    }
  }
}
</script>
