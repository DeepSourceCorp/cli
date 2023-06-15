<template>
  <stat-section
    :show-border="false"
    spacing-class="gap-3"
    custom-grid-class="grid grid-cols-2 lg:grid-cols-3"
  >
    <template v-if="loading">
      <div
        v-for="idx in WIDGETS_COUNT"
        :key="idx"
        class="widget-skeleton-dimensions space-y-4 rounded-md bg-ink-300 p-3"
      ></div>
    </template>

    <template v-else>
      <template v-for="widget in repository.widgets">
        <stat-card
          v-if="Object.keys(issueWidgets).includes(widget)"
          :key="widget"
          :to="issueWidgets[widget].link"
          :trend-direction="issueWidgets[widget].trend_direction"
          :trend-hint="issueWidgets[widget].trend_display"
          :trend-positive="isTrendPositive(issueWidgets[widget])"
          :trend-value="issueWidgets[widget].trend_value"
          :remove-styles="true"
          value-text-size="text-base"
          class="lg:text-border-b-transparent group h-26 cursor-auto rounded-md bg-ink-300 p-3 text-sm font-medium hover:bg-ink-200"
        >
          <template #title>
            <div class="flex items-center gap-x-1.5">
              <z-icon :icon="WIDGET_ICON_MAP[widget]" class="hidden self-start lg:block" />

              <h5 class="widget-card-title text-sm font-medium text-vanilla-300">
                {{ toSentenceCase(issueWidgets[widget].title) }}
              </h5>
            </div>
          </template>

          <template v-if="canCustomizeWidgets" #icon>
            <z-icon
              color="current"
              icon="edit-3"
              size="small"
              class="invisible flex-shrink-0 hover:cursor-pointer lg:group-hover:visible"
              @click.stop.prevent="showCustomizeModal = true"
            />
          </template>

          <span
            v-tooltip="
              issueWidgets[widget].value_display > 1000
                ? `${formatIntl(issueWidgets[widget].value_display)} ${issueWidgets[widget].title}`
                : ''
            "
            :class="[
              issueWidgets[widget].value_display === ''
                ? 'text-sm text-slate-200'
                : 'text-vanilla-100',
              { 'font-mono': Number.isFinite(issueWidgets[widget].value_display) }
            ]"
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
import { StatCard, StatSection } from '@/components/Metrics'
import { ZButton, ZIcon, ZTicker } from '@deepsource/zeal'
import { Component, mixins } from 'nuxt-property-decorator'

import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'

import { RepoPerms } from '~/types/permTypes'

import { formatIntl, shortenLargeNumber, toSentenceCase } from '~/utils/string'
import { WIDGET_ICON_MAP } from '~/utils/repository'

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
  loading = false
  showCustomizeModal = false

  timerId: ReturnType<typeof setTimeout>

  readonly WIDGETS_COUNT = 6
  readonly WIDGET_ICON_MAP = WIDGET_ICON_MAP

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
    clearInterval(this.timerId)
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

    this.loading = false
  }

  created() {
    this.timerId = setTimeout(() => {
      if (this.$fetchState.pending) {
        this.loading = true
      }
    }, 300)
  }

  get issueWidgets(): Record<string, Widget> {
    return this.repository.widgetsDisplay as Record<string, Widget>
  }

  get canCustomizeWidgets(): boolean {
    return this.$gateKeeper.repo(RepoPerms.CUSTOMIZE_OVERVIEW_WIDGETS, this.repoPerms.permission)
  }
}
</script>

<style lang="postcss" scoped>
.widget-skeleton-dimensions {
  height: 104px;
}

@media screen and (width: 1024px) {
  .widget-skeleton-dimensions {
    width: 136px;
  }
}

@media screen and (min-width: 1025px) {
  .widget-skeleton-dimensions {
    width: auto;
  }
}
</style>

<style lang="scss" scoped>
@import '~/assets/css/default.scss';

.widget-card-title {
  @include lhCrop(1.25);
}
</style>
