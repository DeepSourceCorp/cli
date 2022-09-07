<template>
  <stat-section
    :body-spacing="0"
    :grid-spacing="0"
    spacing-class="p-0 gap-px"
    header-spacing-class="pl-4 pr-2 py-2"
    customGridClass="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
  >
    <div slot="title" class="flex items-center justify-between">
      <div class="flex items-center h-full space-x-2">
        <span class="text-base font-semibold tracking-snug">Codebase report</span>
        <z-icon
          v-tooltip="{
            content: 'Overview of issues currently present',
            delay: { show: 0, hide: 100 }
          }"
          color="vanilla-400"
          icon="help"
          class="stroke-1.5 transition-opacity duration-75 flex-shrink-0"
        />
      </div>
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
          class="outline-ink-200 hover:bg-ink-300 p-3"
          :class="{
            [issueWidgets[widget].value_display === '']:
              'text-lg font-medium tracking-wider text-vanilla-400'
          }"
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
            <!-- value_display is returned as an empty string if not available, hence the exact check -->
            {{
              issueWidgets[widget].value_display === ''
                ? 'N/A'
                : shortenLargeNumber(issueWidgets[widget].value_display)
            }}
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

/** Show the issue overview widgets for the repository*/
@Component({
  components: {
    StatSection,
    StatCard,
    ZButton,
    ZIcon,
    ZTicker
  },
  layout: 'repository',
  methods: {
    shortenLargeNumber,
    formatIntl,
    toSentenceCase
  }
})
export default class IssueOverviewCards extends mixins(RepoDetailMixin, RoleAccessMixin) {
  public showCustomizeModal = false

  /**
   * Check if the trend is positive or not
   *
   * @param {Widget} widget
   *
   * @return {boolean | null}
   */
  isTrendPositive(widget: Widget): boolean | null {
    if (!widget.trend_value) {
      return true
    }

    // skipcq: JS-D009
    if (widget.trend_direction && widget.trend_value) {
      return (
        (widget.trend_direction === 'down' && !widget.trend_positive) ||
        (widget.trend_direction === 'up' && widget.trend_positive)
      )
    } else {
      return false
    }
  }

  /**
   * Set the loader count in localstore the generate loading states the next time
   *
   * @return {void}
   */
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

  /**
   * Vue mounted hook to set the repo-analysis event
   *
   * @return {void}
   */
  mounted() {
    this.$socket.$on('repo-analysis-updated', this.refetchData)
  }

  /**
   * Vue beforeDestroy hook to remove the repo-analysis event
   *
   * @return {void}
   */
  beforeDestroy() {
    this.$socket.$off('repo-analysis-updated', this.refetchData)
  }

  /**
   * Refetch the widget data
   *
   * @return {void}
   */
  refetchData(): void {
    this.fetchWidgets({
      ...this.baseRouteParams,
      refetch: true
    })
  }

  /**
   * Close customize modal and refetch data
   *
   * @return {Promise<void>}
   */
  async closeAndRefetchData(): Promise<void> {
    this.showCustomizeModal = false
    await this.refetchData()
  }

  /**
   * Fetch hook to get the widgets from the backend
   *
   * @return {Promise<void>}
   */
  async fetch(): Promise<void> {
    await this.fetchWidgets(this.baseRouteParams)
  }

  get issueWidgets(): Record<string, Widget> {
    return this.repository.widgetsDisplay as Record<string, Widget>
  }

  get loaderCount(): number {
    if (process.client) {
      const { provider, owner, repo } = this.$route.params
      const localCountFromStore = this.$localStore.get(
        `${provider}-${owner}-${repo}`,
        'issue-overview-loader-count'
      ) as number
      return localCountFromStore ?? 6
    }

    return 6
  }

  get canCustomizeWidgets(): boolean {
    return this.$gateKeeper.repo(RepoPerms.CUSTOMIZE_OVERVIEW_WIDGETS, this.repoPerms.permission)
  }
}
</script>
