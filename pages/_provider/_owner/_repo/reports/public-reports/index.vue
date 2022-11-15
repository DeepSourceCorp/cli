<template>
  <!-- * TODO: convert common parts (with owner level) to separate component  -->
  <div class="max-w-3xl">
    <page-title
      :title="publicReportMeta.title"
      :description="publicReportMeta.description"
      class="flex-col md:flex-row gap-y-4"
    >
      <template v-if="hasEditAccess" #actions>
        <z-button
          v-show="showCtaAndControls"
          icon="share"
          label="Share a report"
          size="small"
          @click="isMutateReportModalOpen = true"
        />
      </template>
    </page-title>
    <div v-show="showCtaAndControls" class="flex gap-x-2 justify-between mb-5 mt-1">
      <public-report-sort v-model="sort" @updateSortFilter="handleSortChange" />
      <z-input
        :value="q"
        :show-border="false"
        size="small"
        icon="search"
        background-color="ink-300"
        placeholder="Search by report label..."
        @debounceInput="(val) => handlePublicReportSearch(val)"
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
        v-bind="report"
        :key="report.reportId"
        :has-edit-access="hasEditAccess"
        @edit="triggerEdit"
        @delete="triggerDelete"
      />
    </div>

    <lazy-empty-state
      v-else-if="q.length"
      :webp-image-path="require('~/assets/images/ui-states/directory/empty-search.webp')"
      :png-image-path="require('~/assets/images/ui-states/directory/empty-search.gif')"
      class="border border-dashed rounded-lg border-ink-200 py-20"
    >
      <template #title>
        <span class="break-words">No results found for '{{ q }}'</span>
      </template>
      <template #subtitle> Please try changing your search query. </template>
    </lazy-empty-state>
    <lazy-empty-state
      v-else
      title="No public reports found"
      subtitle="No public report has been created for this repository yet."
      class="border border-dashed rounded-lg border-ink-200 py-20"
    >
      <template v-if="hasEditAccess" slot="action">
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

import updateRepoPublicReport from '@/apollo/mutations/reports/updateRepoPublicReport.gql'

import PublicReportMixin from '~/mixins/publicReportMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'

import { ReportLevel, UpdatePublicReportInput } from '~/types/types'
import { RepoPerms } from '~/types/permTypes'
import { GraphqlMutationResponse } from '~/types/apollo-graphql-types'

/**
 * Public Report page at repository settings level
 */
@Component({
  layout: 'repository',
  components: { ZIcon, ZInput, ZButton, ZPagination, ZConfirm },
  middleware: ['perm'],
  meta: {
    auth: {
      strict: true,
      repoPerms: [RepoPerms.VIEW_PUBLIC_REPORTS]
    }
  }
})
export default class RepoPublicReports extends mixins(PublicReportMixin, RoleAccessMixin) {
  ReportLevel = ReportLevel

  /**
   * Fetch hook for the public report pages
   */
  async fetch(): Promise<void> {
    await Promise.all([this.fetchRepoPerms(this.baseRouteParams), this.fetchPublicReportList()])
  }

  get hasEditAccess(): boolean {
    return this.$gateKeeper.repo(RepoPerms.UPDATE_PUBLIC_REPORTS, this.repoPerms.permission)
  }

  /**
   * Callback function for the `updateOwnerPublicReport` method
   *
   * @callback Callback
   * @returns {void}
   */

  /**
   * Mutation to update a public report
   *
   * @param {UpdatePublicReportInput} editReportArgs
   * @param {Callback} callback - callback function called if report is successfully updated
   * @return {Promise<void>}
   */
  public async updatePublicReport(
    editReportArgs: UpdatePublicReportInput,
    callback?: () => void
  ): Promise<void> {
    this.reportSaveLoading = true

    try {
      const response = (await this.$applyGraphqlMutation(updateRepoPublicReport, {
        updateInput: editReportArgs
      })) as GraphqlMutationResponse

      const updatedReport = response.data?.updatePublicReport

      if (updatedReport?.publicReport?.reportId && updatedReport?.publicReport?.label) {
        callback?.()
        const label = updatedReport.publicReport.label
        this.$toast.success(`${label} has been updated.`)
        await this.fetchPublicReportList()
      } else {
        this.$toast.danger('Unable to update the report. Please contact support.')
      }
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'Unable to update the report. Please contact support.')
    } finally {
      this.reportSaveLoading = false
    }
  }
}
</script>
