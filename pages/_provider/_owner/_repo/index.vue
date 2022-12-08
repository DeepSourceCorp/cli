<template>
  <div class="p-4 space-y-4">
    <issue-overview-cards />

    <div v-if="canViewPinnedReports" class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <template v-if="isPinnedReportsLoading">
        <div v-for="ii in 4" :key="ii" class="bg-ink-300 animate-pulse h-98"></div>
      </template>

      <template v-else>
        <div
          v-for="(report, reportSlot) in compiledPinnedReports"
          :key="
            report.metadata
              ? `${report.metadata.filter}-${reportSlot}`
              : `${report.key}-${reportSlot}`
          "
        >
          <component
            v-if="report"
            :is="report.componentName"
            v-bind="{ ...report, reportKey: report.key }"
            :allow-pinning-reports="allowPinningReports"
            :loading-value="loadingValues[reportSlot]"
            :level="ReportLevel.Repository"
            :owner="$route.params.owner"
            :provider="$route.params.provider"
            :pinned-reports="pinnedReports"
            :repo-name="$route.params.repo"
            :report-slot="reportSlot"
            class="h-full"
            @update-report-controls="
              (reportSlotFromEmit, reportControlValueFromEmit) =>
                updateReportControls(
                  ReportLevel.Repository,
                  report,
                  reportSlot,
                  reportSlotFromEmit,
                  reportControlValueFromEmit
                )
            "
          />
        </div>
      </template>
    </div>
  </div>
</template>
<script lang="ts">
// Internals
import { Component, mixins } from 'nuxt-property-decorator'

// Components
import { TransformCard } from '@/components/History'
import { AutofixListItem } from '@/components/Autofix'
import { IssueOverviewCards } from '@/components/RepoOverview'

import PinnedReportsMixin from '~/mixins/pinnedReportsMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import { PinnedReportInput, ReportLevel } from '~/types/types'
import { RepoPerms } from '~/types/permTypes'

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

/**
 * Repo home page
 */
@Component({
  components: {
    IssueOverviewCards,
    TransformCard,
    AutofixListItem
  },
  layout: 'repository'
})
export default class Overview extends mixins(PinnedReportsMixin, RepoDetailMixin) {
  isPinnedReportsLoading = false
  ReportLevel = ReportLevel

  /**
   * The `created` hook
   * Determine if the skeleton loader is to be displayed
   *
   * @returns {void}
   */
  created(): void {
    setTimeout(() => {
      if (this.$fetchState.pending) {
        this.isPinnedReportsLoading = true
      }
    }, 300)
  }

  /**
   * Fetch hook to fetch all the basic details for a repository
   * @return {Promise<void>}
   */
  async fetch(): Promise<void> {
    try {
      await this.fetchBasicRepoDetails(this.baseRouteParams)
      this.fetchRepoDetails(this.baseRouteParams)

      await this.fetchRepoPerms(this.baseRouteParams)

      // Fetch pinned reports list only if the user has the required perms
      if (this.canViewPinnedReports) {
        this.isPinnedReportsLoading = true

        // Fetch the list of report keys pinned at the repository level
        await this.fetchPinnedReports({ level: ReportLevel.Repository })

        this.isPinnedReportsLoading = false
      }
    } catch (e) {
      process.client && this.$toast.danger('There was a problem loading this repository')
    }
  }

  /**
   * The `mounted` hook
   * Bind event bus listeners
   *
   * @returns {void}
   */
  mounted(): void {
    this.$root.$on('update-pinned-reports', this.updatePinnedReportsHandler)
  }

  /**
   * The `beforeDestroy` hook
   * Unbind event bus listeners
   *
   * @returns {void}
   */
  beforeDestroy(): void {
    this.$root.$off('update-pinned-reports', this.updatePinnedReportsHandler)
  }

  get allowPinningReports(): boolean {
    if (this.$fetchState.pending) {
      return false
    }
    return this.$gateKeeper.repo(RepoPerms.PIN_REPORTS, this.repoPerms.permission)
  }

  get canViewPinnedReports(): boolean {
    return this.$gateKeeper.repo(RepoPerms.VIEW_REPORTS, this.repoPerms.permission)
  }

  /**
   * Head hook to add meta details to the page
   * @return {Record<string, string>}
   */
  head(): Record<string, string> {
    const { repo, owner } = this.$route.params
    return {
      title: `${owner}/${repo} • DeepSource`,
      description:
        'DeepSource is an automated code review tool that helps developers automatically find and fix issues in their code.'
    }
  }

  /**
   * Handler method for the `update-pinned-reports` event
   * Invoke the `updatePinnedReports` method as part of the `pinnedReportsMixin`
   *
   * @param {Array<PinnedReportInput>} pinnedReports
   * @param {number} [reportSlotFromEmit]
   */
  async updatePinnedReportsHandler(
    pinnedReports: Array<PinnedReportInput>,
    reportSlotFromEmit?: number
  ): Promise<void> {
    await this.updatePinnedReports(ReportLevel.Repository, pinnedReports, reportSlotFromEmit)
  }
}
</script>
