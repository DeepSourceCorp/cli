<template>
  <z-menu
    ref="menu-container"
    :placement="expandToTop ? 'top' : 'bottom'"
    direction="left"
    size="base"
    width="base"
    items-z-class="z-50"
    @menu-toggle="menuToggleHandler"
  >
    <template #trigger="{ toggle }">
      <z-button
        v-tooltip="'Change report'"
        button-type="ghost"
        color="vanilla-400"
        icon="settings-2"
        size="small"
        @click="toggle"
      />
    </template>

    <template #body>
      <z-menu-section
        v-for="(section, sectionIdx) in reportsList"
        :key="section.title"
        :divider="false"
        :class="sectionIdx === 0 ? 'pt-2 pb-3' : 'pb-2'"
        class="text-vanilla-400 overflow-x-auto hide-scroll"
      >
        <!-- Not using the `title` prop for `ZMenuSection` since there is no way to override the text color -->
        <h6
          :class="{ 'mt-1': sectionIdx === 0 }"
          class="text-slate px-2.5 mb-2 tracking-wider font-semibold text-xs"
        >
          {{ section.title }}
        </h6>

        <template v-if="section.type === ReportType.Compliance">
          <div
            v-for="item in section.items"
            :key="item.key"
            :disabled="isCurrentlyPinnedReport(item)"
            class="flex items-center font-medium px-2.5 py-2 hover:bg-ink-200 cursor-pointer"
            :class="{ 'justify-between': isCurrentlyPinnedReport(item) }"
            @click="updatePinnedReport(item)"
          >
            <template v-if="currentSelection">
              <span :class="{ 'text-vanilla-100': isCurrentlyPinnedReport(item) }">
                {{ item.label }}
              </span>

              <z-icon v-if="isCurrentlyPinnedReport(item)" icon="check" color="vanilla-100" />
            </template>

            <template v-else>
              {{ item.label }}
            </template>
          </div>
        </template>

        <template v-else>
          <template v-for="(item, idx) in section.items">
            <div
              v-if="item.type === PinnableReportType.DISTRIBUTION"
              :key="idx"
              :show-borders="false"
              :class="collapsibleVisibilityStatus[item.key] ? 'pt-2 pb-0' : 'py-2'"
              class="px-2.5 outline-none"
            >
              <div class="w-full text-vanilla-400">
                <!-- Title -->
                <div
                  class="flex items-center transition-all duration-700 ease-in-out group cursor-pointer"
                  @click="updateCollapsibleMetadata(item)"
                >
                  <span class="flex-1 font-medium">{{ item.label }}</span>
                  <z-icon
                    icon="chevron-down"
                    class="transform transition-all ease-in-out group stroke-1.5 group-hover:text-vanilla-200"
                    :class="collapsibleHeaderAnimations[item.key]"
                  />
                </div>

                <!-- Items -->
                <div
                  v-if="collapsibleVisibilityStatus[item.key]"
                  class="overflow-hidden text-sm leading-6 duration-300 ease-in-out transition-max-height max-h-52"
                >
                  <!-- Requires a container `div` with padding on left for the lines on the left to show up -->
                  <div class="pt-2 pl-4 nested-group">
                    <div
                      v-for="metadataItem in item.metadataItems"
                      :key="metadataItem.filter"
                      role="button"
                      class="flex items-center px-1.5 py-2 gap-2 font-medium text-sm text-vanilla-400 hover:bg-ink-200 rounded-sm nested-group-item relative cursor-pointer"
                      :class="{
                        'justify-between cursor-not-allowed': isCurrentlyPinnedReport({
                          ...item,
                          metadata: metadataItem
                        })
                      }"
                      @click="updatePinnedReport({ ...item, metadata: metadataItem })"
                    >
                      <span
                        :class="{
                          'text-vanilla-100': isCurrentlyPinnedReport({
                            ...item,
                            metadata: metadataItem
                          })
                        }"
                      >
                        {{ metadataItem.text }}
                      </span>

                      <z-icon
                        v-if="isCurrentlyPinnedReport({ ...item, metadata: metadataItem })"
                        icon="check"
                        color="vanilla-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-else-if="item.type === PinnableReportType.NON_DISTRIBUTION"
              :key="idx"
              :disabled="isCurrentlyPinnedReport(item)"
              class="flex items-center font-medium px-2.5 py-2 hover:bg-ink-200 cursor-pointer"
              :class="{ 'justify-between': isCurrentlyPinnedReport(item) }"
              @click="updatePinnedReport(item)"
            >
              <span
                :class="{
                  'text-vanilla-100': isCurrentlyPinnedReport(item)
                }"
              >
                {{ item.label }}
              </span>

              <z-icon v-if="isCurrentlyPinnedReport(item)" icon="check" color="vanilla-100" />
            </div>
          </template>
        </template>
      </z-menu-section>
    </template>
  </z-menu>
</template>

<script lang="ts">
import { ZButton, ZIcon, ZMenu, ZMenuItem, ZMenuSection, ZTag } from '@deepsource/zeal'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import {
  IPinnableReportItem,
  PinnableReportType,
  ReportMeta,
  ReportPageT
} from '~/types/reportTypes'
import { PinnedReport, ReportLevel, ReportType } from '~/types/types'

interface IReportsList {
  title: 'SECURITY' | 'INSIGHTS'
  type: ReportType
  items: Array<IPinnableReportItem>
}

interface IZMenu extends Vue {
  close(): () => void
}

/**
 * Pinnable reports list as menu items
 */
@Component({
  name: 'PinnableReportsList',
  components: { ZButton, ZIcon, ZMenu, ZMenuItem, ZMenuSection, ZTag }
})
export default class PinnableReportsList extends Vue {
  @Prop({ required: true })
  currentSelection: string

  @Prop({ required: true })
  level: ReportLevel

  @Prop({ required: true })
  owner: string

  @Prop({ required: true })
  pinnedReports: Array<PinnedReport>

  @Prop({ required: true })
  provider: string

  @Prop({ required: false })
  repoName: string

  @Prop({ required: true })
  reportSlot: number

  collapsibleHeaderAnimations = {
    [ReportPageT.DISTRIBUTION]: '',
    [ReportPageT.ISSUES_PREVENTED]: ''
  } as Record<ReportPageT, string>

  collapsibleVisibilityStatus = {
    [ReportPageT.DISTRIBUTION]: false,
    [ReportPageT.ISSUES_PREVENTED]: false
  } as Record<ReportPageT, boolean>

  PinnableReportType = PinnableReportType
  ReportType = ReportType

  get complianceItems(): Array<IPinnableReportItem> {
    const complianceItems = Object.keys(ReportMeta)
      .filter((reportKey) => {
        const { level, type } = ReportMeta[reportKey as ReportPageT]
        return level.includes(this.level) && type === ReportType.Compliance
      })
      .map((reportKey) => {
        const { pinnableType, title } = ReportMeta[reportKey as ReportPageT]

        return {
          key: reportKey,
          label: title,
          metadata: null,
          type: pinnableType // `compliance`
        } as IPinnableReportItem
      })

    return complianceItems
  }

  // Cookie identifiers go by the convention `provider_owner_cookieIdentifier`
  get cookieIdentifier(): string {
    const reportItem = this.pinnedReports[this.reportSlot]

    // For `code-coverage` report, it is `provider_owner_pinned-code-coverage_sort-type_report-slot`
    if (reportItem?.key === ReportPageT.CODE_COVERAGE) {
      return `${this.provider}_${this.owner}_pinned-code-coverage-sort-type_${this.reportSlot}`
    }

    // Cookie identifier has the convention `provider_owner_repo_reportType_date-range-filter_report-slot`
    // Distribution-based reports have `metadata` with the `filter` type
    // `issue-distribution-analyzer`, `issues-prevented-category`
    // Cookie identifier naming falls back to report keys for other reports
    const reportType = reportItem?.metadata?.filter || reportItem?.key
    return (
      `${this.provider}_${this.owner}${
        this.level === ReportLevel.Repository ? `_${this.repoName}` : ''
      }_${reportType}_date-range-filter_${this.reportSlot}` || ''
    )
  }

  get expandToTop(): boolean {
    return this.reportSlot > 1
  }

  get insightsItems(): Array<IPinnableReportItem> {
    const insightsItems = Object.keys(ReportMeta)
      .filter((reportKey) => {
        const { level, type } = ReportMeta[reportKey as ReportPageT]
        return level.includes(this.level) && type === ReportType.Insight
      })
      .map((reportKey) => {
        const { metadataItems, pinnableType, title } = ReportMeta[reportKey as ReportPageT]
        const metadata = metadataItems ? { metadataItems } : { metadata: null }

        const item = {
          key: reportKey,
          label: title,
          type: pinnableType, // `distribution` & `non-distribution`
          ...metadata
        } as IPinnableReportItem

        return item
      })

    return insightsItems
  }

  get reportsList(): Array<IReportsList> {
    const reportsList = [
      { title: 'SECURITY', type: ReportType.Compliance, items: [...this.complianceItems] },
      { title: 'INSIGHTS', type: ReportType.Insight, items: [...this.insightsItems] }
    ] as Array<IReportsList>

    return reportsList
  }

  /**
   * The `mounted` hook
   *
   * @returns {void}
   */
  mounted(): void {
    // Expand the corresponding collapsible with the selected item `By Analyzer/Category`
    this.expandCurrentlySelectedCollapsible()
  }

  /**
   * Method to close the menu
   *
   * @returns {void}
   */
  closeMenu(): void {
    const menuContainer = this.$refs['menu-container'] as IZMenu
    menuContainer.close()
  }

  /**
   * Method to update the collapsible visibility status if it matches the current selection
   *
   * @returns {void}
   */
  expandCurrentlySelectedCollapsible(): void {
    this.insightsItems.forEach((item) => {
      if (item.type === PinnableReportType.DISTRIBUTION) {
        const isCurrentlyPinned = this.isCurrentlyPinnedReport(item as IPinnableReportItem)

        this.collapsibleVisibilityStatus[item.key] = isCurrentlyPinned
        this.collapsibleHeaderAnimations[item.key] = isCurrentlyPinned ? 'rotate-180' : 'rotate-0'
      }
    })
  }

  /**
   * Method that determines if a given report item matches the current selection
   *
   * @param {IPinnableReportItem} reportItem
   * @returns {boolean}
   */
  isCurrentlyPinnedReport(reportItem: IPinnableReportItem): boolean {
    // `metadata` is `null` for a few report types
    if (reportItem.metadata) {
      return reportItem.metadata.filter === this.currentSelection
    }

    // Distribution-based report items have `metadataItems` associated with them
    // Determine the accordion item open status with the report key in this case
    if (reportItem.metadataItems) {
      return this.currentSelection.startsWith(reportItem.key)
    }

    return reportItem.key === this.currentSelection
  }

  /**
   * Handler method for menu toggle event emitted by `ZMenu`
   * Reset collapsible chevron animations and expand the collapsible matching the current selection
   *
   * @param {boolean} isOpen
   * @returns {void}
   */
  menuToggleHandler(isOpen: boolean): void {
    if (!isOpen) {
      return
    }

    // Reset collapsible chevron animations regardless of the component getting destroyed
    Object.keys(this.collapsibleHeaderAnimations).forEach((key) => {
      this.collapsibleHeaderAnimations[key as ReportPageT] = ''
    })

    // Expand the corresponding collapsible with the selected item `By Analyzer/Category`
    this.expandCurrentlySelectedCollapsible()
  }

  /**
   * Method to update the map determines the collapsible header animations and visibility
   *
   * @param {IPinnableReportItem} reportItem
   * @returns {void}
   */
  updateCollapsibleMetadata(reportItem: IPinnableReportItem): void {
    this.collapsibleHeaderAnimations[reportItem.key] = this.collapsibleVisibilityStatus[
      reportItem.key
    ]
      ? 'animate-reverse-half-spin rotate-0'
      : 'animate-first-half-spin rotate-180'

    const collapsibleIsOpen = !this.collapsibleVisibilityStatus[reportItem.key]

    this.collapsibleVisibilityStatus[reportItem.key] = collapsibleIsOpen

    // Collapse all others if the current collapsible in scope is expanded
    Object.keys(this.collapsibleVisibilityStatus).forEach((key) => {
      if (key !== reportItem.key) {
        const alternativeCollapsibleIsOpen = this.collapsibleVisibilityStatus[key as ReportPageT]

        // Close any other collapsibles that are open
        if (collapsibleIsOpen && alternativeCollapsibleIsOpen) {
          this.collapsibleVisibilityStatus[key as ReportPageT] = !collapsibleIsOpen
          this.collapsibleHeaderAnimations[key as ReportPageT] =
            'animate-reverse-half-spin rotate-0'
        }
      }
    })
  }

  /**
   * Method that emits an event by the name `update-pinned-reports` to the event bus
   * supplying the updated `pinnedReports` array
   *
   * @param {IPinnableReportItem} reportItem
   * @returns {void}
   */
  updatePinnedReport(reportItem: IPinnableReportItem): void {
    this.closeMenu()

    if (this.isCurrentlyPinnedReport(reportItem)) {
      return
    }

    this.$cookies.remove(this.cookieIdentifier)

    const { key, metadata } = reportItem
    const pinnedReports = [...this.pinnedReports]

    pinnedReports[this.reportSlot] = { key, metadata }
    this.$root.$emit('update-pinned-reports', pinnedReports, this.reportSlot)
  }
}
</script>
