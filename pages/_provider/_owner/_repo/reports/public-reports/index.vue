<template>
  <!-- * TODO: convert common parts (with owner level) to separate component  -->
  <div class="max-w-3xl">
    <page-title :title="publicReportMeta.title" class="flex-col md:flex-row gap-y-4">
      <template slot="description">
        <p class="text-vanilla-400 mt-2 text-sm">{{ publicReportMeta.description }}</p>
      </template>

      <template slot="actions">
        <z-button
          v-show="showCtaAndControls"
          icon="share"
          label="Share a report"
          size="small"
          @click="isMutateReportModalOpen = true"
        />
      </template>
    </page-title>
    <div v-show="showCtaAndControls" class="flex gap-x-2 justify-between mb-5">
      <public-report-sort v-model="sort" @updateSortFilter="handleSortChange" />
      <z-input
        v-model="q"
        :show-border="false"
        size="small"
        icon="search"
        background-color="ink-300"
        placeholder="Search by report label"
        @debounceInput="fetchPublicReportList"
      >
        <template slot="left">
          <z-icon icon="search" size="small" class="ml-1.5" />
        </template>
        <template slot="right">
          <z-icon v-show="q" icon="x" size="small" class="cursor-pointer" @click="clearSearch" />
        </template>
      </z-input>
    </div>

    <template v-if="reportsListLoading">
      <div class="space-y-3">
        <div
          v-for="idx in 5"
          :key="idx"
          class="relative z-0 rounded-md h-20 bg-ink-300 animate-pulse"
        ></div>
      </div>
    </template>

    <div v-else-if="reportsList.length" class="space-y-3">
      <public-report-card
        v-for="report in reportsList"
        :key="report.reportId"
        v-bind="report"
        @edit="triggerEdit"
        @delete="triggerDelete"
      />
    </div>

    <lazy-empty-state
      v-else-if="q.length"
      :title="`No results found for ${q}.`"
      :webp-image-path="require('~/assets/images/ui-states/directory/empty-search.webp')"
      :png-image-path="require('~/assets/images/ui-states/directory/empty-search.png')"
      class="border border-dashed rounded-lg border-ink-200 py-20"
    />
    <lazy-empty-state
      v-else
      title="No public reports found"
      subtitle="You have not created any public report for this repository yet."
      class="border border-dashed rounded-lg border-ink-200 py-20"
    >
      <template slot="action">
        <div class="flex justify-around">
          <z-button
            icon="file-pie-chart"
            label="Create a report"
            size="small"
            @click="isMutateReportModalOpen = true"
          />
        </div>
      </template>
    </lazy-empty-state>

    <div v-if="totalPageCount > 1" class="flex justify-center text-sm my-6">
      <z-pagination
        :page="currentPage"
        :total-pages="totalPageCount"
        :total-visible="5"
        @selected="updatePageNum"
      />
    </div>

    <portal to="modal">
      <mutate-report-modal
        v-if="isMutateReportModalOpen"
        :edit-mode="editMode"
        :level="ReportLevel.Repository"
        :is-restricted-old="reportToEdit.isRestricted"
        :report-keys-old="reportToEdit.reportKeys"
        :share-historical-data-old="reportToEdit.shareHistoricalData"
        :report-label-old="reportToEdit.label"
        :report-id-old="reportToEdit.reportId"
        :save-loading="reportSaveLoading"
        @close="triggerModalClose"
        @create-report="createPublicReport"
        @edit-report="updatePublicReport"
      />

      <report-delete-confirm
        v-if="showConfirmDelete"
        :report-label="reportLabelToDelete"
        :is-loading="deleteLoading"
        @close-confirm="showConfirmDelete = false"
        @delete-report="deletePublicReport"
      />
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZInput, ZButton, ZPagination, ZConfirm } from '@deepsourcelabs/zeal'
import PublicReportMixin from '~/mixins/publicReportMixin'
import { ReportLevel } from '~/types/types'

/**
 * Public Report page at repository settings level
 */
@Component({
  layout: 'repository',
  components: { ZIcon, ZInput, ZButton, ZPagination, ZConfirm }
})
export default class RepoPublicReports extends mixins(PublicReportMixin) {
  ReportLevel = ReportLevel
}
</script>
