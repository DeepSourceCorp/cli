<template>
  <stat-section
    v-if="(alertingMetrics.length && !loading) || (loading && loaderCount > 0)"
    title="Alerting metrics"
    spacingClass="gap-3"
    helpText="Metrics critically alerting based on thresholds"
    :showBorder="false"
  >
    <template v-if="loading">
      <div
        v-for="idx in loaderCount"
        :key="idx"
        class="flex flex-col justify-between h-28 p-2 space-y-2 bg-ink-300 rounded-md"
      >
        <div class="flex justify-between space-x-2">
          <div class="w-48 h-5 rounded-md bg-ink-400 animate-pulse"></div>
          <div class="w-5 h-5 rounded-md bg-ink-400 animate-pulse"></div>
        </div>
        <div class="flex space-x-2">
          <div class="h-6 rounded-md bg-ink-400 w-23 animate-pulse"></div>
          <div class="w-12 h-6 rounded-md bg-ink-400 animate-pulse"></div>
        </div>
      </div>
    </template>
    <template v-else>
      <stat-card
        v-for="(m, index) in alertingMetrics"
        color="cherry"
        trendIcon="threshold"
        :key="index"
        :to="metricsPageLink"
        :title="m.name"
        :subtitle="m.namespace.key"
        :value="m.value"
        :icon="m.namespace.shortcode"
        :trendHint="`Threshold for this metric is set to ${m.thresholdDisplay}`"
        :trendValue="m.thresholdDisplay"
        :showBorders="false"
      >
      </stat-card>
    </template>
  </stat-section>
</template>
<script lang="ts">
import { Component, mixins, Prop } from 'nuxt-property-decorator'
import { StatCard, StatSection } from '@/components/Metrics'
import { ZButton, ZIcon } from '@deepsourcelabs/zeal'

import RepoDetailMixin from '~/mixins/repoDetailMixin'

const NUMBER_TYPES = ['IDP', 'DDP']

interface AlertingMetrics {
  shortcode: string
  name: string
  value: number | string
  threshold: 15
  thresholdDisplay?: string
}

@Component({
  components: {
    StatSection,
    StatCard,
    ZButton,
    ZIcon
  },
  layout: 'repository'
})
export default class AlertingMetricsSection extends mixins(RepoDetailMixin) {
  public loading = false

  @Prop({ default: false })
  routeToMetricsPage: boolean

  async fetch(): Promise<void> {
    this.loading = true
    await this.fetchAlertingMetrics(this.baseRouteParams)
    this.setLoaderCount()
    this.loading = false
  }

  get metricsPageLink(): string | null {
    if (this.routeToMetricsPage) {
      return this.$generateRoute(['metrics'])
    }
    return null
  }

  get alertingMetrics(): Array<AlertingMetrics> {
    if (this.repository.alertingMetrics) {
      return this.repository.alertingMetrics.map((metric: AlertingMetrics) => {
        let thresholdDisplay = String(metric.threshold)

        if (!NUMBER_TYPES.includes(metric.shortcode)) {
          thresholdDisplay = `${metric.threshold}%`
        }
        return {
          thresholdDisplay,
          ...metric
        }
      })
    }
    return []
  }

  setLoaderCount(): void {
    const { provider, owner, repo } = this.$route.params

    if (Array.isArray(this.repository.alertingMetrics)) {
      this.$localStore.set(
        `${provider}-${owner}-${repo}`,
        'alerting-metrics-loader-count',
        this.repository.alertingMetrics.length
      )
    }
  }

  get loaderCount(): number {
    const { provider, owner, repo } = this.$route.params
    let localCountFromStore
    if (process.client) {
      localCountFromStore = this.$localStore.get(
        `${provider}-${owner}-${repo}`,
        'alerting-metrics-loader-count'
      ) as number
    }
    return localCountFromStore ?? 4
  }
}
</script>
