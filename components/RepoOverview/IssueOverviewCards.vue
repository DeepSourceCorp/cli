<template>
  <stat-section
    title="Codebase report"
    helpText="Overview of issues currently present"
    :bodySpacing="0"
    :gridSpacing="0"
    spacingClass="p-0 gap-px"
    customGridClass="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
  >
    <template v-if="loading">
      <div
        v-for="idx in loaderCount"
        :key="idx"
        class="p-2 h-22 sm:h-24 space-y-4 outline-ink-300"
        v-once
      >
        <div class="bg-ink-300 h-6 w-36 rounded-md animate-pulse"></div>
        <div class="bg-ink-300 h-6 w-14 rounded-md animate-pulse"></div>
      </div>
    </template>
    <template v-else>
      <template v-for="(widget, key) in issueWidgets">
        <stat-card
          v-if="widget.value_display !== null"
          :key="key"
          :to="widget.link"
          :roundedCorners="false"
          :showBorder="false"
          :trendValue="widget.trend_value"
          :trendHint="`Change ${widget.trend_display}`"
          :trendDirection="widget.trend_direction"
          :trendPositive="isTrendPositive(widget)"
          :removeStyles="true"
          class="outline-ink-200 hover:bg-ink-300 min-h-22 sm:min-h-24"
        >
          <template slot="title">
            <h5 class="text-base text-vanilla-100 font-medium">
              {{ widget.title }}
            </h5>
          </template>
          <span :class="isTrendPositive(widget) ? '' : 'text-cherry'">
            {{ widget.value_display }}
          </span>
        </stat-card>
      </template>
    </template>
  </stat-section>
</template>
<script lang="ts">
import { Component, Watch, mixins } from 'nuxt-property-decorator'
import { StatCard, StatSection } from '@/components/Metrics'
import { ZButton, ZIcon, ZTicker } from '@deepsourcelabs/zeal'
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
    StatSection,
    StatCard,
    ZButton,
    ZIcon,
    ZTicker
  },
  layout: 'repository'
})
export default class IssueOverviewCards extends mixins(RepoDetailMixin) {
  public loading = false

  isTrendPositive(widget: Widget): boolean | null {
    if (!widget.trend_value) {
      return true
    }
    if (widget.trend_direction && widget.trend_value) {
      if (
        (widget.trend_direction === 'down' && !widget.trend_positive) ||
        (widget.trend_direction === 'up' && widget.trend_positive)
      ) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }

  @Watch('issueWidgets', { deep: true })
  setLoaderCount(): void {
    const { provider, owner, repo } = this.$route.params

    if (this.issueWidgets) {
      this.$localStore.set(
        `${provider}-${owner}-${repo}`,
        'issue-overview-loader-count',
        Object.keys(this.issueWidgets).length
      )
    }
  }

  mounted() {
    this.$socket.$on('repo-analysis-updated', this.refetchData)
  }

  beforeDestroy() {
    this.$socket.$off('repo-analysis-updated', this.refetchData)
  }

  async refetchData(): Promise<void> {
    await this.fetchWidgets({
      ...this.baseRouteParams,
      refetch: true
    })
  }

  async fetch(): Promise<void> {
    this.loading = true
    await this.fetchWidgets(this.baseRouteParams)
    this.loading = false
  }

  get issueWidgets(): Array<Widget> {
    return this.repository.widgetsDisplay
  }

  get loaderCount(): number {
    const { provider, owner, repo } = this.$route.params
    const localCountFromStore = this.$localStore.get(
      `${provider}-${owner}-${repo}`,
      'issue-overview-loader-count'
    ) as number
    return localCountFromStore ?? 6
  }
}
</script>
