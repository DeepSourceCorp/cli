<template>
  <stat-section
    title="Codebase report"
    helpText="Overview of issues currently present"
    :bodySpacing="0"
    :gridSpacing="0"
    spacingClass="p-0 gap-px"
    customGridClass="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
  >
    <div slot="controls" class="flex justify-end">
      <z-button
        v-if="canCustomizeWidgets"
        button-type="secondary"
        icon="sliders"
        size="small"
        class="stroke-1.5"
        label="Customize"
        @click="showCustomizeModal = true"
      />
    </div>
    <template v-if="$fetchState.pending">
      <div v-for="idx in loaderCount" :key="idx" class="p-2 space-y-4 h-22 sm:h-24 outline-ink-200">
        <div class="h-6 rounded-md bg-ink-300 w-36 animate-pulse"></div>
        <div class="h-6 rounded-md bg-ink-300 w-14 animate-pulse"></div>
      </div>
    </template>
    <template v-else>
      <template v-for="widget in repository.widgets">
        <stat-card
          v-if="Object.keys(issueWidgets).includes(widget)"
          :key="widget"
          :to="issueWidgets[widget].link"
          :hint-as-tooltip="false"
          :trend-direction="issueWidgets[widget].trend_direction"
          :trend-hint="issueWidgets[widget].trend_display"
          :trend-positive="isTrendPositive(issueWidgets[widget])"
          :trend-value="issueWidgets[widget].trend_value"
          :remove-styles="true"
          class="outline-ink-200 hover:bg-ink-300 min-h-22 sm:min-h-24"
        >
          <template slot="title">
            <h5 class="text-base font-medium text-vanilla-100">
              {{ toSentenceCase(issueWidgets[widget].title) }}
            </h5>
          </template>
          <span
            v-tooltip="
              issueWidgets[widget].value_display > 1000
                ? `${formatIntl(issueWidgets[widget].value_display)} ${issueWidgets[widget].title}`
                : ''
            "
          >
            {{ shortenNumber(issueWidgets[widget].value_display) }}
          </span>
        </stat-card>
      </template>
    </template>
    <portal to="modal">
      <customize-widgets-modal
        v-if="showCustomizeModal && canCustomizeWidgets"
        @close="closeAndRefetchData"
      />
    </portal>
  </stat-section>
</template>
<script lang="ts">
import { Component, Watch, mixins } from 'nuxt-property-decorator'
import { StatCard, StatSection } from '@/components/Metrics'
import { ZButton, ZIcon, ZTicker } from '@deepsourcelabs/zeal'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import { formatIntl, shortenLargeNumber, toSentenceCase } from '~/utils/string'
import { RepoPerms } from '~/types/permTypes'
import RoleAccessMixin from '~/mixins/roleAccessMixin'

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
export default class IssueOverviewCards extends mixins(RepoDetailMixin, RoleAccessMixin) {
  public shortenNumber = shortenLargeNumber
  public formatIntl = formatIntl
  public toSentenceCase = toSentenceCase
  public showCustomizeModal = false

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

  refetchData(): void {
    this.fetchWidgets({
      ...this.baseRouteParams,
      refetch: true
    })
  }

  async closeAndRefetchData(): Promise<void> {
    this.showCustomizeModal = false
    await this.refetchData()
  }

  async fetch(): Promise<void> {
    await this.fetchWidgets(this.baseRouteParams)
  }

  get issueWidgets(): Record<string, Widget> {
    return this.repository.widgetsDisplay as Record<string, Widget>
  }

  get loaderCount(): number {
    const { provider, owner, repo } = this.$route.params
    const localCountFromStore = this.$localStore.get(
      `${provider}-${owner}-${repo}`,
      'issue-overview-loader-count'
    ) as number
    return localCountFromStore ?? 6
  }

  get canCustomizeWidgets(): boolean {
    return this.$gateKeeper.repo(RepoPerms.CUSTOMIZE_OVERVIEW_WIDGETS, this.repoPerms.permission)
  }
}
</script>
