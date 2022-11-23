<template>
  <div class="max-w-3xl">
    <page-title
      :title="publicReportMeta.title"
      :description="publicReportMeta.description"
      class="flex-col md:flex-row gap-y-4 mb-3"
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
        <span class="break-words">No results found for the given search.</span>
      </template>
      <template #subtitle> Please try changing your search query. </template>
    </lazy-empty-state>

    <lazy-empty-state
      v-else
      title="No public reports found"
      subtitle="No public report has been created for this team yet."
      class="border border-dashed rounded-lg border-ink-200 py-20"
    >
      <template v-if="hasEditAccess" slot="action">
        <div class="flex justify-around">
          <z-button
            icon="share"
            label="Share a report"
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
      <mutate-owner-report-modal
        v-if="isMutateReportModalOpen"
        :edit-mode="editMode"
        :owner-login="$route.params.owner"
        :vcs-provider="$route.params.provider"
        :level="ReportLevel.Owner"
        :is-restricted-old="reportToEdit.isRestricted"
        :report-keys-old="reportToEdit.reportKeys"
        :share-historical-data-old="reportToEdit.shareHistoricalData"
        :report-label-old="reportToEdit.label"
        :report-id-old="reportToEdit.reportId"
        :report-source-old="reportToEdit.source"
        :source-repo-count-old="sourceRepoCountOld"
        :save-loading="reportSaveLoading"
        @close="triggerModalClose"
        @create-report="createPublicReport"
        @edit-report="updateOwnerPublicReport"
      />

      <report-delete-confirm
        v-if="showConfirmDelete"
        :report-label="reportLabelToDelete"
        :is-loading="deleteLoading"
        @close-confirm="showConfirmDelete = false"
        @delete-report="deletePublicReport"
      />

      <create-report-success
        v-if="showCreateSuccessModal"
        v-bind="newReportCreated"
        :password="newReportCreatedPassword"
        :edit-mode="createSuccessModalEditMode"
        @close="triggerSuccessModalClose"
      />
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZInput, ZButton, ZPagination, ZConfirm } from '@deepsourcelabs/zeal'

import PublicReportMixin from '~/mixins/publicReportMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'

import {
  ReportLevel,
  UpdatePublicReportInput,
  UpdatePublicReportSourcedRepositoriesInput
} from '~/types/types'
import { TeamPerms } from '~/types/permTypes'

import { updateOwnerPublicReport } from '@/apollo/mutations/reports/updateOwnerPublicReport.gql'
import { GraphqlMutationResponse } from '~/types/apollo-graphql-types'

/**
 * Public Report page at team settings level
 */
@Component({
  layout: 'dashboard',
  components: { ZIcon, ZInput, ZButton, ZPagination, ZConfirm },
  middleware: ['perm'],
  meta: {
    auth: {
      strict: true,
      repoPerms: [TeamPerms.VIEW_PUBLIC_REPORTS]
    }
  }
})
export default class OwnerPublicReports extends mixins(PublicReportMixin, RoleAccessMixin) {
  ReportLevel = ReportLevel

  /**
   * Fetch hook for the public report pages
   */
  async fetch(): Promise<void> {
    await this.fetchPublicReportList()
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
   * @param {UpdatePublicReportSourcedRepositoriesInput} addReposArgs
   * @param {UpdatePublicReportSourcedRepositoriesInput} removeReposArgs
   * @param {Callback} callback - callback function called if report is successfully updated
   * @returns {Promise<void>}
   */
  async updateOwnerPublicReport(
    editReportArgs: UpdatePublicReportInput,
    addReposArgs: UpdatePublicReportSourcedRepositoriesInput,
    removeReposArgs: UpdatePublicReportSourcedRepositoriesInput,
    callback?: () => void
  ): Promise<void> {
    this.reportSaveLoading = true

    try {
      const response = (await this.$applyGraphqlMutation(updateOwnerPublicReport, {
        updateInput: editReportArgs,
        addReposInput: addReposArgs,
        removeReposInput: removeReposArgs
      })) as GraphqlMutationResponse

      const updatedReport = response.data?.updatePublicReport

      if (updatedReport?.publicReport?.reportId && updatedReport?.publicReport?.label) {
        callback?.()

        this.newReportCreated = updatedReport.publicReport
        this.newReportCreatedPassword = editReportArgs.password ?? ''
        this.createSuccessModalEditMode = true

        // Adding delay to match closing of previous modal
        setTimeout(() => {
          this.showCreateSuccessModal = true
        }, 400)

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

  get hasEditAccess(): boolean {
    return this.$gateKeeper.team(TeamPerms.UPDATE_PUBLIC_REPORTS, this.teamPerms.permission)
  }

  get sourceRepoCountOld(): number {
    return this.reportToEdit.sourcedRepositories?.totalCount ?? 0
  }
}
</script>
