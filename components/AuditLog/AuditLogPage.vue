<template>
  <div class="flex flex-col gap-y-3">
    <div class="space-y-0.5">
      <!-- title -->
      <h2 class="text-lg font-medium text-vanilla-100">Audit log</h2>

      <h3 class="text-base font-normal text-vanilla-400">
        {{ pageTitle }}
      </h3>
    </div>

    <upgrade-feature v-if="!auditLogEnabled" :feature-shortcode="FeatureType.AUDIT_LOG" />

    <div
      class="flex flex-col items-start gap-x-2 gap-y-3 sm:flex-row sm:items-center"
      :class="{ 'opacity-60': !auditLogEnabled }"
    >
      <z-input
        :show-border="false"
        :value="searchQuery"
        :disabled="!auditLogEnabled"
        background-color="ink-300"
        placeholder="Search by event name or user..."
        size="small"
        class="flex-grow pl-2 text-sm"
        @debounceInput="updateSearchQuery"
      >
        <template #left>
          <z-icon icon="search" />
        </template>
      </z-input>

      <div class="flex w-full items-center gap-x-2">
        <date-range-picker
          :date-range-options="dateRangeOptions"
          :selected-filter="dateRange"
          :disabled="!auditLogEnabled"
          class="flex-grow"
          @change="updateDateRange"
        />

        <export-logs-success-modal
          :disabled="!auditLogEnabled || !auditLogItemsCount"
          :loading="exportLogsLoading"
          :end-date="endDate"
          :show-export-logs-success-modal="showExportLogsSuccessModal"
          :start-date="startDate"
          :viewer-email="viewerEmail"
          @primary="$emit('export-logs')"
          @close-modal="$emit('close-export-logs-modal')"
        />
      </div>
    </div>

    <z-divider
      v-if="auditLogItemsCount || !auditLogEnabled"
      margin="m-0"
      :class="{ 'opacity-60': !auditLogEnabled }"
    />

    <div v-if="auditLogItemsCount" class="mb-4 flex h-6 items-center justify-between">
      <div class="inline-flex items-center gap-x-3">
        <z-icon icon="list-end" class="flex-shrink-0 self-start" />

        <p
          class="page-context-text max-w-2xs break-words text-sm font-normal leading-5 text-vanilla-400 border-b-vanilla-400 md:max-w-xs lg:max-w-sm"
        >
          {{ pageContextText }}
        </p>
      </div>

      <pagination-v2
        v-if="showPaginationElement"
        :page-number="pageNumber"
        :per-page-count="perPageCount"
        :total-count="totalCount"
        class="hidden md:flex"
        @change="updatePageNumber"
      />
    </div>

    <!-- Timeline -->
    <timeline-v2 v-if="auditLogListLoading" class="ml-1 space-y-2">
      <timeline-item-v2 v-for="item in 4" :key="item">
        <timeline-item-v2-loading />
      </timeline-item-v2>
    </timeline-v2>

    <!-- Dummy audit log to show when `audit_log` feature is disabled -->
    <dummy-audit-log v-else-if="!auditLogEnabled" class="opacity-40" />

    <!-- Desktop -->
    <timeline-v2 v-else-if="auditLogItemsCount" class="ml-1">
      <timeline-item-v2 v-for="log in auditLogItems" :key="log.id">
        <log v-bind="log" />
      </timeline-item-v2>

      <timeline-item-v2 v-if="showPaginationElement" list-style-type="circle">
        <pagination-v2
          :page-number="pageNumber"
          :per-page-count="perPageCount"
          :total-count="totalCount"
          class="-mt-1.5 self-start"
          @change="updatePageNumber"
        />
      </timeline-item-v2>
    </timeline-v2>

    <lazy-empty-state
      v-else-if="searchQuery"
      :title="`We could not find any logs for “${searchQuery}”`"
      :use-v2="true"
      :webp-image-path="require('~/assets/images/ui-states/directory/empty-search.webp')"
      :png-image-path="require('~/assets/images/ui-states/directory/empty-search.gif')"
      :show-border="true"
      subtitle="
        There are no logs matching your search. Try searching for something different.
      "
      content-width="max-w-sm"
    />

    <lazy-empty-state
      v-else
      title="No Audit logs"
      subtitle="No events have been logged for this account yet. Please check back later!"
      class="rounded-lg border-2 border-dashed border-slate-400 py-20"
    />
  </div>
</template>

<script lang="ts">
import { ZDivider, ZIcon, ZInput } from '@deepsource/zeal'
import { Component, mixins, Prop } from 'nuxt-property-decorator'

import ActiveUserMixin from '~/mixins/activeUserMixin'

import { AuditLog } from '~/types/types'

import { formatDate, parseISODate } from '~/utils/date'
import { dateRangeOptions, getDateRange } from '~/utils/reports'

import { AuditLogLevel } from '~/types/auditLog'
import { FeatureType } from '~/types/features'

@Component({
  name: 'AuditLogPage',
  components: { ZDivider, ZIcon, ZInput }
})
export default class AuditLogPage extends mixins(ActiveUserMixin) {
  @Prop({ default: true, type: Boolean })
  auditLogEnabled: boolean

  @Prop({ required: true, type: Number })
  pageNumber: number

  @Prop({ default: 0, type: Number })
  totalCount: number

  @Prop({ default: false, type: Boolean })
  auditLogListLoading: boolean

  @Prop({ default: false, type: Boolean })
  exportLogsLoading: boolean

  @Prop({ default: false, type: Boolean })
  showExportLogsSuccessModal: boolean

  @Prop({ required: true, type: String })
  dateRange: string

  @Prop({ required: true, type: String })
  level: AuditLogLevel

  @Prop({ required: true, type: String })
  searchQuery: string

  @Prop({ required: true, type: String })
  viewerEmail: string

  @Prop({ required: true, type: Array })
  auditLogItems: Array<AuditLog>

  readonly perPageCount = 30
  readonly FeatureType = FeatureType

  dateRangeOptions = dateRangeOptions

  get auditLogItemsCount() {
    return this.auditLogItems.length
  }

  get endDate() {
    const { endDate } = getDateRange(this.dateRange)
    return formatDate(parseISODate(endDate), 'll')
  }

  get pageContextText() {
    if (this.auditLogListLoading) {
      return 'Searching logs...'
    }

    if (this.searchQuery) {
      return `Logs containing ${this.searchQuery}`
    }

    const { count, durationType } = dateRangeOptions[this.dateRange]
    const dateRangeText = `Last ${count} ${durationType}`

    return `Logs for ${dateRangeText} ${this.startDate} - ${this.endDate}`
  }

  get pageTitle() {
    const pageTitleMap: Record<AuditLogLevel, string> = {
      [AuditLogLevel.Repository]: 'Track activity and changes in your repository.',
      [AuditLogLevel.Team]: 'Track activity and changes in your team.'
    }
    return pageTitleMap[this.level]
  }

  get showPaginationElement() {
    return this.totalCount > this.perPageCount
  }

  get startDate() {
    const { startDate } = getDateRange(this.dateRange)
    return formatDate(parseISODate(startDate), 'll')
  }

  // Filter change handler methods

  updateDateRange(dateRangeFromEmit: string) {
    this.$emit('update-filter', {
      dateRangeFromEmit,
      pageNumberFromEmit: 1 // Reset page number to `1`
    })
  }

  updatePageNumber(pageNumberFromEmit: number) {
    this.$emit('update-filter', {
      pageNumberFromEmit
    })
  }

  updateSearchQuery(searchQueryFromEmit: string) {
    this.$emit('update-filter', {
      searchQueryFromEmit,
      pageNumberFromEmit: 1 // Reset page number to `1`
    })
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/css/default.scss';

.page-context-text {
  @include lhCrop(1.125);
}
</style>
