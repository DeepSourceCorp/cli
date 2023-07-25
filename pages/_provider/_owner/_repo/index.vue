<template>
  <div class="space-y-4 p-4">
    <div class="flex gap-x-4">
      <issue-overview-cards class="flex-grow" />

      <metadata-view v-bind="metadataViewProps" />
    </div>

    <div
      v-if="canViewPinnedReports && pinnedReportsListIsAvailable"
      class="grid grid-cols-1 gap-4 lg:grid-cols-2"
    >
      <div
        v-for="(report, reportSlot) in compiledPinnedReports"
        :key="`${reportSlot}-${reRenderKey}`"
      >
        <div
          v-if="
            loadingValues[reportSlot].condition === LoadingConditions.REPORT_WIDGET_INITIAL_LOAD
          "
          class="pinned-report-widget animate-pulse bg-ink-300"
        ></div>

        <component
          :is="report.componentName"
          v-else
          v-bind="{ ...report, reportKey: report.key }"
          :allow-pinning-reports="allowPinningReports"
          :loading-value="loadingValues[reportSlot]"
          :level="ReportLevel.Repository"
          :owner="$route.params.owner"
          :provider="$route.params.provider"
          :pinned-reports="pinnedReports"
          :repo-name="$route.params.repo"
          :report-slot="reportSlot"
          class="pinned-report-widget"
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
    </div>

    <portal to="modal">
      <metadata-view-mobile
        v-if="showMetadataViewDialog"
        v-bind="metadataViewMobileProps"
        @close="showMetadataViewDialog = false"
      />
    </portal>
  </div>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZDialogGeneric, ZIcon } from '@deepsource/zeal'

import PinnedReportsMixin from '~/mixins/pinnedReportsMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'

import { RepoPerms } from '~/types/permTypes'
import { LoadingConditions, ReportPageT } from '~/types/reportTypes'
import { PinnedReportInput, ReportLevel, Repository } from '~/types/types'

import ReportBaseGQLQuery from '~/apollo/queries/reports/reportBase.gql'

import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { IssueOccurrenceDistributionType } from '~/types/issues'
import { shortenLargeNumber } from '~/utils/string'

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

type MetadataViewPropsT = Partial<Repository> & {
  issuesPrevented: number | string
  loading?: boolean
}

/**
 * Repo home page
 */
@Component({
  components: {
    ZDialogGeneric,
    ZIcon
  },
  layout: 'repository'
})
export default class Overview extends mixins(PinnedReportsMixin, RepoDetailMixin) {
  LoadingConditions = LoadingConditions
  ReportLevel = ReportLevel

  issuesPrevented = 0
  loading = false
  showMetadataViewDialog = false

  timerId: ReturnType<typeof setTimeout>

  /**
   * Fetch hook to fetch all the basic details for a repository
   * @return {Promise<void>}
   */
  async fetch(): Promise<void> {
    try {
      const baseArgs = {
        ...this.baseRouteParams,
        provider: this.$providerMetaMap[this.$route.params.provider].value
      }

      await this.fetchRepoPerms(baseArgs)

      // Fetch pinned reports list only if the user has the required perms
      if (this.canViewPinnedReports) {
        // Fetch the list of report keys pinned at the repository level
        await this.fetchPinnedReports({ level: ReportLevel.Repository })
      }

      await Promise.all([
        this.fetchRepoDetails(baseArgs),
        this.fetchIssueOccurrenceDistributionCounts({
          ...baseArgs,
          distributionType: IssueOccurrenceDistributionType.ISSUE_TYPE
        }),
        this.fetchRepoRunCount({ ...baseArgs, status: 'pend' })
      ])

      const reportBaseResponse: GraphqlQueryResponse = await this.$fetchGraphqlData(
        ReportBaseGQLQuery,
        {
          level: ReportLevel.Repository,
          objectId: this.repository.id,
          key: ReportPageT.ISSUES_PREVENTED
        }
      )

      this.issuesPrevented = reportBaseResponse.data.report?.currentValue as number
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'There was a problem loading this repository.')
    } finally {
      this.loading = false
    }
  }

  created() {
    // This is to prevent showing skeleton loaders if hitting the cache
    // `loading` data property is set to `true` only if `$fetchState.pending` is `true` after `300ms`
    this.timerId = setTimeout(() => {
      if (this.$fetchState.pending) {
        this.loading = true
      }
    }, 300)
  }

  /**
   * The `mounted` hook
   * Bind event bus listeners
   *
   * @returns {void}
   */
  mounted(): void {
    this.$root.$on('update-pinned-reports', this.updatePinnedReportsHandler)
    this.$root.$on('toggle-metadata-view-dialog', this.toggleMetadataViewDialog)
  }

  /**
   * The `beforeDestroy` hook
   * Unbind event bus listeners
   *
   * @returns {void}
   */
  beforeDestroy(): void {
    this.$root.$off('update-pinned-reports', this.updatePinnedReportsHandler)
    this.$root.$on('toggle-metadata-view-dialog', this.toggleMetadataViewDialog)

    clearTimeout(this.timerId)
  }

  get allowPinningReports(): boolean {
    if (this.loading) {
      return false
    }
    return this.$gateKeeper.repo(RepoPerms.PIN_REPORTS, this.repoPerms.permission)
  }

  get canViewPinnedReports(): boolean {
    return this.$gateKeeper.repo(RepoPerms.VIEW_REPORTS, this.repoPerms.permission)
  }

  get metadataViewProps(): MetadataViewPropsT {
    const {
      availableAnalyzers,
      defaultBranchName,
      issueOccurrenceDistributionByIssueType,
      latestAnalysisRun,
      runs
    } = this.repository

    return {
      availableAnalyzers,
      defaultBranchName,
      latestAnalysisRun,
      issueOccurrenceDistributionByIssueType,
      issuesPrevented: shortenLargeNumber(this.issuesPrevented),
      loading: this.loading,
      runs
    }
  }

  get metadataViewMobileProps(): MetadataViewPropsT {
    const {
      availableAnalyzers,
      defaultBranchName,
      isActivated,
      latestAnalysisRun,
      issueOccurrenceDistributionByIssueType,
      runs,
      vcsProvider
    } = this.repository

    return {
      availableAnalyzers,
      defaultBranchName,
      isActivated,
      issueOccurrenceDistributionByIssueType,
      issuesPrevented: shortenLargeNumber(this.issuesPrevented),
      latestAnalysisRun,
      runs,
      vcsProvider
    }
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

  toggleMetadataViewDialog() {
    this.showMetadataViewDialog = !this.showMetadataViewDialog
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
    reportSlotFromEmit: number
  ): Promise<void> {
    await this.updatePinnedReports(ReportLevel.Repository, pinnedReports, reportSlotFromEmit)
  }
}
</script>

<style scoped>
/* Specify fixed height to prevent layout shifts */
@media screen and (min-width: 1025px) {
  .pinned-report-widget {
    height: 406px;
  }
}

/* `iPad Pro` device has the legends appearing towards the bottom */
@media screen and (width: 1024px) {
  .pinned-report-widget {
    height: 442px;
  }
}
</style>
