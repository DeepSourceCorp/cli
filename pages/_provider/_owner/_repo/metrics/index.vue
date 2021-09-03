<template>
  <div class="p-4 space-y-6">
    <alerting-metrics-section />
    <metrics-graph
      v-if="repoMetrics.length && !loading"
      :data="repoMetrics"
      :namespaces="repoMetricsNamespaces"
      :allowChartTypeToggle="false"
    ></metrics-graph>
    <stat-section v-else-if="loading && metricsPerformanceLoaderCount" title="Key metrics">
      <template v-slot:controls>
        <div class="flex justify-end h-full">
          <div class="bg-ink-300 rounded-md animate-pulse h-8 w-44"></div>
        </div>
      </template>
      <div class="min-h-80 grid grid-rows-6 gap-2 pr-2">
        <div
          v-for="idx in metricsPerformanceLoaderCount"
          :key="idx"
          class="bg-ink-300 rounded-md animate-pulse"
        ></div>
      </div>
      <div
        class="col-span-1 -m-2 border-l lg:col-span-2 xl:col-span-3 2xl:col-span-4 border-ink-300 flex flex-col"
      >
        <div class="h-23 px-4 pt-4 flex items-start justify-between flex-shrink-0">
          <div class="bg-ink-300 rounded-md animate-pulse h-full w-28"></div>
          <div class="bg-ink-300 rounded-md animate-pulse h-8 w-28"></div>
        </div>
        <div class="p-4 flex-grow h-full w-full">
          <div class="bg-ink-300 rounded-md animate-pulse h-full w-full"></div>
        </div>
      </div>
    </stat-section>
    <div
      v-else-if="!loading && !showMetrics"
      class="min-h-72 flex flex-col items-center justify-center space-y-12 min-h-102"
    >
      <img src="~/assets/images/ui-states/metrics-empty.svg" alt="metrics-empty" />
      <div class="space-y-2 text-center">
        <h3 class="text-lg font-bold tracking-snug">Not enough data.</h3>
        <p class="text-sm text-vanilla-400 max-w-md mx-auto">
          There is still some number crunching to do before we can show relevant metrics to you.
          Please check back later.
        </p>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
// Internals
import { Component, Provide, mixins } from 'nuxt-property-decorator'

// Components
import { StatSection, AlertingMetricsSection } from '@/components/Metrics'
import { MetricsGraph } from '@/components/Metrics'

// Store Imports
import { Metrics as MetricsInterface } from '~/store/repository/detail'
import RepoDetailMixin from '~/mixins/repoDetailMixin'

@Component({
  components: {
    StatSection,
    AlertingMetricsSection,
    MetricsGraph
  },
  layout: 'repository'
})
export default class Metrics extends mixins(RepoDetailMixin) {
  @Provide()
  public pageLengthOptions = [30, 60, 90]

  @Provide()
  public pageLength = this.pageLengthOptions[0]

  @Provide()
  async refetchData(): Promise<void> {
    await this.fetchMetrics({
      ...this.baseRouteParams,
      lastDays: this.pageLength,
      refetch: true
    })

    await this.fetchAlertingMetrics({
      ...this.baseRouteParams,
      refetch: true
    })
  }

  public loading = false

  @Provide()
  updatePageLength(pageLength: number): void {
    this.pageLength = pageLength
    this.$fetch()
  }

  created(): void {
    this.setAnalysisUpdateEvent()
  }

  @Provide()
  get metricRepositoryId(): string {
    return this.repository.id
  }

  get repoMetrics(): Array<MetricsInterface> {
    if (!this.repository.metricsData) return []

    return this.repository.metricsData.filter((metric: MetricsInterface) => {
      return metric.display || metric.last_value
    })
  }

  get repoMetricsNamespaces(): Array<string | null> {
    return this.repository.uniqueNamespaceKeys ?? []
  }

  async fetch(): Promise<void> {
    this.loading = true
    await this.fetchMetrics({
      ...this.baseRouteParams,
      lastDays: this.pageLength
    })
    this.loading = false

    const { provider, owner, repo } = this.$route.params

    if (Array.isArray(this.repoMetrics)) {
      this.$localStore.set(
        `${provider}-${owner}-${repo}`,
        'metrics-performance-data-count',
        this.repoMetrics.length
      )
    }
  }

  get showMetrics(): boolean {
    return this.repository?.alertingMetrics?.length || this.repoMetrics.length
  }

  get metricsPerformanceLoaderCount(): number {
    const { provider, owner, repo } = this.$route.params
    const localCountFromStore = this.$localStore.get(
      `${provider}-${owner}-${repo}`,
      'metrics-performance-data-count'
    ) as number
    return localCountFromStore ?? 6
  }

  head(): Record<string, string> {
    const { repo, owner } = this.$route.params
    return {
      title: `Metrics • ${owner}/${repo}`,
      description:
        'DeepSource is an automated code review tool that helps developers automatically find and fix issues in their code.'
    }
  }
}
</script>
