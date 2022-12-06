<template>
  <chart-container :is-widget="true" class="pt-4 pb-0.5" @mouseleave.native="hideReportControls">
    <template #report-header>
      <div class="inline-flex items-center justify-between w-full">
        <div
          v-if="loadingValue.status && isReportGettingSwapped"
          class="h-5 w-56 animate-pulse bg-ink-300"
        ></div>

        <h3 v-else class="inline-flex items-center gap-x-2 text-vanilla-100 text-sm font-normal">
          {{ label }}

          <z-icon
            v-if="helpText"
            v-tooltip="{ content: helpText, delay: { show: 0, hide: 100 } }"
            icon="help"
            color="vanilla-400"
            class="hidden lg:inline stroke-1.5 transition-opacity duration-75 flex-shrink-0"
          />
        </h3>

        <!-- Report controls section for smaller screens -->
        <z-button
          v-tooltip="'View full report'"
          :to="$generateRoute(['reports', reportKey])"
          button-type="ghost"
          color="vanilla-400"
          icon="pie-chart"
          size="small"
          class="lg:hidden"
        />

        <!-- Report controls section for larger screens -->
        <div
          :class="allowPinningReports ? 'w-19' : 'w-11'"
          class="hidden lg:block h-10 relative"
          @mouseenter="showReportControls"
        >
          <transition name="slide-fade">
            <div
              v-if="!revealReportControls"
              :key="1"
              class="w-full h-full inline-flex items-center justify-end absolute top-0 left-0"
            >
              <z-icon icon="more-horizontal" />
            </div>
            <div
              v-else
              :key="2"
              class="w-full h-full inline-flex items-center justify-end gap-x-2 absolute top-0 left-0"
            >
              <z-button
                v-tooltip="'View full report'"
                :to="$generateRoute(['reports', reportKey])"
                button-type="ghost"
                color="vanilla-400"
                icon="pie-chart"
                size="small"
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
        v-if="isReportGettingSwapped"
        class="h-72 mx-5 mt-5 rounded-lg bg-ink-300 animate-pulse"
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

    <lazy-empty-pinned-code-coverage-table v-else />
  </chart-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { ZButton, ZIcon } from '@deepsourcelabs/zeal'

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
@Component({ name: 'PinnedCodeCoverageReport', components: { ZButton, ZIcon } })
export default class PinnedCodeCoverageReport extends Vue {
  @Prop({ required: true })
  allowPinningReports: boolean

  @Prop({ required: true })
  coverageList: Array<RepositoryCoverageReportItem>

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

  get loaderCount(): number {
    let loaderCountFromStore = null

    if (process.client) {
      loaderCountFromStore = this.$localStore.get(
        `${this.provider}-${this.owner}`,
        'code-coverage-loader-count'
      ) as number
    }

    return loaderCountFromStore ?? 7
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
