<template>
  <chart-container :is-widget="true" class="pb-0.5 pt-4" @mouseleave.native="hideReportControls">
    <template #report-header>
      <div class="inline-flex h-8 w-full items-center justify-between">
        <h3 class="inline-flex items-center gap-x-2 text-sm font-normal text-vanilla-100">
          {{ label }}

          <z-icon
            v-if="helpText"
            v-tooltip="{ content: helpText, delay: { show: 0, hide: 100 } }"
            icon="help"
            color="vanilla-400"
            class="hidden flex-shrink-0 stroke-1.5 transition-opacity duration-75 lg:inline"
          />
        </h3>

        <!-- Report controls section for smaller screens -->
        <z-button
          v-tooltip="'View full report'"
          button-type="ghost"
          color="vanilla-400"
          icon="pie-chart"
          size="small"
          class="lg:hidden"
          @click="navigateToReportPage"
        />

        <!-- Report controls section for larger screens -->
        <div
          :class="allowPinningReports ? 'w-19' : 'w-11'"
          class="relative hidden h-10 lg:block"
          @mouseenter="showReportControls"
        >
          <transition name="slide-fade">
            <div
              v-if="!revealReportControls"
              :key="1"
              class="absolute left-0 top-0 inline-flex h-full w-full items-center justify-end"
            >
              <z-icon icon="more-horizontal" />
            </div>
            <div
              v-else
              :key="2"
              class="absolute left-0 top-0 inline-flex h-full w-full items-center justify-end gap-x-2"
            >
              <z-button
                v-tooltip="'View full report'"
                button-type="ghost"
                color="vanilla-400"
                icon="pie-chart"
                size="small"
                @click="navigateToReportPage"
              />

              <pinnable-reports-list
                v-if="allowPinningReports"
                :current-selection="currentSelection"
                :level="ReportLevel.Owner"
                :owner="owner"
                :pinned-reports="pinnedReports"
                :provider="provider"
                :report-slot="reportSlot"
              >
                <template #menu-trigger="{ toggle }">
                  <z-button
                    button-type="secondary"
                    color="vanilla-400"
                    icon="settings-2"
                    size="x-small"
                    @click="toggle"
                  />
                </template>
              </pinnable-reports-list>
            </div>
          </transition>
        </div>
      </div>
    </template>

    <template v-if="loadingValue.status">
      <!-- Skeleton loader for the case in which the report gets swapped -->
      <div
        v-if="isReportWidgetDataFetch || isReportGettingSwapped"
        class="mx-5 mt-5 h-72 animate-pulse rounded-lg bg-ink-300"
      ></div>

      <!-- Skeleton loader for the case when the report controls change -->
      <code-coverage-table-loading
        v-else-if="isReportControlsChange"
        :is-widget="true"
        :row-count="loaderCount"
        class="hide-scroll"
      />
    </template>

    <code-coverage-table
      v-else-if="coverageList && coverageList.length"
      :selected-sort-filter="selectedSortType"
      :is-widget="true"
      :linked-rows="true"
      :repo-coverage-list="coverageList"
      class="hide-scroll"
      @sort-filter-updated="updateSortTypeHandler"
    />

    <lazy-empty-pinned-code-coverage-table
      v-else
      :subtitle="error ? 'Something went wrong' : 'Not enough data'"
    />
  </chart-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import {
  CompiledPinnedReportT,
  ILoadingValue,
  IReportMetadata,
  LoadingConditions,
  ReportMeta,
  ReportPageT
} from '~/types/reportTypes'
import { RepositoryCoverageReportItem, ReportLevel } from '~/types/types'

/**
 * Component with the markup for code coverage report
 */
@Component({ name: 'PinnedCodeCoverageReport' })
export default class PinnedCodeCoverageReport extends Vue {
  @Prop({ required: true })
  allowPinningReports: boolean

  @Prop()
  coverageList: Array<RepositoryCoverageReportItem>

  @Prop()
  error: boolean

  @Prop({ required: true })
  reportKey: ReportPageT

  @Prop({ required: true })
  label: string

  @Prop({ required: true })
  loadingValue: ILoadingValue

  @Prop({ required: true })
  metadata: IReportMetadata

  @Prop({ required: true })
  owner: string

  @Prop({ required: true })
  pinnedReports: Array<CompiledPinnedReportT>

  @Prop({ required: true })
  provider: string

  @Prop({ required: true })
  reportSlot: number

  ReportLevel = ReportLevel

  revealReportControls = false

  timeoutId: ReturnType<typeof setTimeout>

  get currentSelection(): string {
    const currentSelection = this.metadata?.filter || this.reportKey

    if (this.loadingValue.status || !currentSelection) {
      return ''
    }
    return this.metadata?.filter || this.reportKey
  }

  get helpText(): string {
    const { helpText } = ReportMeta[this.reportKey]
    return helpText ?? ''
  }

  get isReportControlsChange(): boolean {
    return this.loadingValue.condition === LoadingConditions.REPORT_CONTROLS_CHANGE
  }

  get isReportGettingSwapped(): boolean {
    return this.loadingValue.condition === LoadingConditions.REPORT_SWAP
  }

  get isReportWidgetDataFetch(): boolean {
    return this.loadingValue.condition === LoadingConditions.REPORT_WIDGET_DATA_FETCH
  }

  get loaderCount(): number {
    const defaultLoaderCount = 7
    let loaderCountFromStore = null

    if (process.client) {
      loaderCountFromStore = this.$localStore.get(
        `${this.provider}-${this.owner}`,
        'code-coverage-loader-count'
      ) as number
    }

    // Ensure the loader count does not exceed `7` since the report widget shows only max `7` entries
    if (loaderCountFromStore) {
      return loaderCountFromStore > defaultLoaderCount ? defaultLoaderCount : loaderCountFromStore
    }
    return defaultLoaderCount
  }

  get selectedSortType(): string {
    if (this.loadingValue.status) {
      return ''
    }

    return (
      this.$cookies.get(
        `${this.provider}_${this.owner}_pinned-code-coverage-sort-type_${this.reportSlot}`
      ) || ''
    )
  }

  /**
   * Method to hide report controls after a `1s` delay
   * Report controls remain visible if the user comes back before `1s`
   *
   * @returns {void}
   */
  hideReportControls(): void {
    this.timeoutId = setTimeout(() => {
      this.revealReportControls = false
    }, 1000)
  }

  /**
   * Navigate to the code coverage report page
   *
   * @returns {void}
   */
  navigateToReportPage(): void {
    const reportPageUrl = this.$generateRoute(['reports', this.reportKey])
    this.$router.push(reportPageUrl)
  }

  /**
   * Method to reveal report controls after clearing the currently active timer
   *
   * @returns {void}
   */
  showReportControls(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
    this.revealReportControls = true
  }

  /**
   * Method to emit an event by the name `update-report-controls`
   *
   * @param {string}} newSortType
   * @returns {void}
   */
  updateSortTypeHandler(newSortType: string): void {
    // Emit the `update-report-controls` event signifying a change in sort type
    this.$emit('update-report-controls', this.reportSlot, newSortType)
  }
}
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
</style>
