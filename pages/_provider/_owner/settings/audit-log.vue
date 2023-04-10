<template>
  <div class="flex max-w-2xl flex-col gap-y-3 p-4">
    <div class="space-y-0.5">
      <!-- title -->
      <h2 class="text-lg font-medium text-vanilla-100">Audit log</h2>

      <h3 class="text-base font-normal text-vanilla-400">
        Track activity and changes in your team.
      </h3>
    </div>

    <div class="flex flex-col items-center gap-x-2 gap-y-3 sm:flex-row">
      <z-input
        :value="searchQuery"
        :show-border="false"
        background-color="ink-300"
        placeholder="Search by event name or user..."
        size="small"
        class="flex-grow pl-2 text-sm"
        @debounceInput="updateSearchQueryHandler"
      >
        <template #left>
          <z-icon icon="search" />
        </template>
      </z-input>

      <div class="flex w-full items-center gap-x-2">
        <date-range-picker
          :selected-filter="dateRange"
          :date-range-options="dateRangeOptions"
          class="flex-grow"
          @change="updateDateRangeHandler"
        />

        <export-logs-success-modal
          :loading="exportLogsLoading"
          :show-export-logs-success-modal="showExportLogsSuccessModal"
          :start-date="startDate"
          :end-date="endDate"
          :viewer-email="viewerEmail"
          @primary="exportAuditLogs"
          @close-modal="showExportLogsSuccessModal = false"
        />
      </div>
    </div>

    <z-divider v-if="auditLogItemsCount" margin="m-0" />

    <div v-if="auditLogItemsCount" class="flex items-center justify-between">
      <div class="inline-flex items-center gap-x-3">
        <z-icon icon="list-end" class="flex-shrink-0 self-start" />

        <p
          class="page-context-text max-w-2xs break-words text-sm font-medium leading-5 border-b-vanilla-400 md:max-w-xs lg:max-w-sm"
        >
          {{ pageContextText }}
        </p>
      </div>

      <pagination-v2
        v-model="pageNumber"
        :per-page-count="perPageCount"
        :total-count="totalCount"
        class="hidden md:flex"
        @change="fetchAuditLogItems"
      />
    </div>

    <!-- Timeline -->
    <timeline-v2 v-if="auditLogListLoading" class="ml-1 space-y-2">
      <timeline-item-v2 v-for="item in 4" :key="item">
        <timeline-item-loading />
      </timeline-item-v2>
    </timeline-v2>

    <timeline-v2 v-else-if="auditLogItemsCount" class="ml-1">
      <timeline-item-v2 v-for="log in auditLogItems" :key="log.id">
        <log v-bind="log" />
      </timeline-item-v2>

      <timeline-item-v2 v-if="auditLogItemsCount >= 20" list-style-type="circle">
        <pagination-v2
          v-model="pageNumber"
          :per-page-count="perPageCount"
          :total-count="totalCount"
          class="-mt-1.5 self-start"
          @change="fetchAuditLogItems"
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
import { ZButton, ZDivider, ZIcon, ZInput } from '@deepsource/zeal'
import { Component, mixins } from 'nuxt-property-decorator'

import ExportAuditLogsGQLMutation from '~/apollo/mutations/audit-log/exportAuditLogs.gql'
import TeamLevelAuditLogGQLQuery from '~/apollo/queries/team/auditLog.gql'

import ActiveUserMixin from '~/mixins/activeUserMixin'

import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { TeamPerms } from '~/types/permTypes'
import { DateRangeOptionT } from '~/types/reportTypes'
import { AuditLog, AuditLogConnection, ExportAuditLogsInput, Maybe, Team } from '~/types/types'

import { resolveNodes } from '~/utils/array'
import { formatDate, parseISODate } from '~/utils/date'
import { dateRangeOptions, getDateRange } from '~/utils/reports'

// Refers to the `apollo/queries/team/auditLog.gql` GQL query
interface CustomAuditLogsQuery extends Team {
  fullLogs: Maybe<AuditLogConnection>
}

@Component({
  components: { ZButton, ZDivider, ZIcon, ZInput },
  middleware: ['perm'],
  meta: {
    auth: {
      strict: true,
      teamPerms: [TeamPerms.VIEW_AUDIT_LOG]
    }
  }
})
export default class TeamLevelAuditLog extends mixins(ActiveUserMixin) {
  pageNumber = 1
  perPageCount = 30
  totalCount = 0

  auditLogListLoading = false
  exportLogsLoading = false
  showExportLogsSuccessModal = false

  dateRange = '3m'
  searchQuery = ''
  teamId = ''

  dateRangeOptions: Record<string, DateRangeOptionT> = dateRangeOptions

  auditLogItems = [] as Array<AuditLog>

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

  get startDate() {
    const { startDate } = getDateRange(this.dateRange)
    return formatDate(parseISODate(startDate), 'll')
  }

  get viewerEmail() {
    return this.viewer.email
  }

  async fetch() {
    await this.fetchAuditLogItems()

    if (!this.viewer?.email) {
      await this.fetchActiveUser()
    }
  }

  async fetchAuditLogItems() {
    try {
      this.auditLogListLoading = true

      const provider = this.$providerMetaMap[this.$route.params.provider].value
      const login = this.$route.params.owner

      const { startDate: createdAtGte, endDate: createdAtLte } = getDateRange(this.dateRange)

      const args = {
        provider,
        login,
        first: this.perPageCount,
        after: this.$getGQLAfter(this.pageNumber, this.perPageCount),
        createdAtGte,
        createdAtLte,
        q: this.searchQuery
      }

      const response: GraphqlQueryResponse = await this.$fetchGraphqlData(
        TeamLevelAuditLogGQLQuery,
        args
      )

      this.teamId = response?.data?.team?.id as string

      this.auditLogItems = resolveNodes(
        response?.data?.team?.logs as AuditLogConnection
      ) as Array<AuditLog>

      this.totalCount = (response.data.team as CustomAuditLogsQuery).fullLogs?.totalCount ?? 0
    } catch (err) {
      this.$toast.danger((err as Error).message.replace('Graphql error:', ''))
    } finally {
      this.auditLogListLoading = false
    }
  }

  async exportAuditLogs() {
    try {
      this.exportLogsLoading = true

      const { startDate: createdAtGte, endDate: createdAtLte } = getDateRange(this.dateRange)
      const args: ExportAuditLogsInput = {
        objectId: this.teamId,
        createdAtGte,
        createdAtLte
      }

      const response = await this.$applyGraphqlMutation(ExportAuditLogsGQLMutation, { input: args })
      if (response.data.exportAuditLogs.ok) {
        this.showExportLogsSuccessModal = true
      }
    } catch (err) {
      this.$toast.danger((err as Error).message.replace('GraphQL error: ', ''))
    } finally {
      this.exportLogsLoading = false
    }
  }

  resetPageNumber() {
    this.pageNumber = 1
  }

  async updateDateRangeHandler(newDateRange: string) {
    this.dateRange = newDateRange

    // Set page number back to `1`
    this.resetPageNumber()

    await this.fetchAuditLogItems()
  }
  async updateSearchQueryHandler(newVal: string) {
    this.searchQuery = newVal

    // Set page number back to `1`
    this.resetPageNumber()

    await this.fetchAuditLogItems()
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/css/default.scss';

.page-context-text {
  @include lhCrop(1.125);
}
</style>
