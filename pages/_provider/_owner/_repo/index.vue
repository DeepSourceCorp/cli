<template>
  <div class="p-4 space-y-6">
    <issue-overview-cards />
    <alerting-metrics-section :routeToMetricsPage="true" />
    <code-quality-graph />
    <recent-runs-section />
  </div>
</template>
<script lang="ts">
// Internals
import { Component, mixins, namespace } from 'nuxt-property-decorator'

// Components
import { ZAnimatedInteger } from '@deepsourcelabs/zeal'
import { CodeQualityGraph } from '@/components/Graphs'
import { AlertingMetricsSection } from '@/components/Metrics'
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

@Component({
  components: {
    AlertingMetricsSection,
    IssueOverviewCards,
    RecentRunsSection,
    ZAnimatedInteger,
    CodeQualityGraph,
    TransformCard,
    AutofixListItem
  },
  layout: 'repository'
})
export default class Overview extends mixins(RepoDetailMixin) {
  private loading = false

  created(): void {
    this.setAnalysisUpdateEvent()
  }

  async fetch(): Promise<void> {
    this.loading = true
    try {
      await this.fetchBasicRepoDeatils({ ...this.baseRouteParams, refetch: true })
      this.fetchRepoDetails(this.baseRouteParams)
    } catch (e) {
      this.$toast.danger('There was a problem loading this repository')
    }
    this.loading = false
  }

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
