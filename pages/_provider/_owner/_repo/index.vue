<template>
  <div class="space-y-4 p-4">
    <!-- Monorepo overview UI -->
    <monorepo-overview
      v-if="isMonorepo"
      :current-page="currentPage"
      :loading="fetchingSubRepositoryList"
      :owner-login="owner"
      :search-query="searchQuery"
      :show-add-sub-repository-cta="canAddSubRepository"
      :sub-repository-list="subRepositoryList"
      :total-page-count="totalPageCount"
      @toggle-add-sub-repository-modal-visibility="toggleAddSubRepositoryModalVisibility"
      @update-filter="fetchSubRepositories"
    />

    <template v-else>
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
            :owner="owner"
            :provider="provider"
            :pinned-reports="pinnedReports"
            :repo-name="repositoryName"
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
    </template>

    <portal to="modal">
      <metadata-view-mobile
        v-if="showMetadataViewDialog"
        v-bind="metadataViewMobileProps"
        @close="showMetadataViewDialog = false"
      />

      <add-sub-repository-modal
        v-if="showAddSubRepositoryModal"
        :error-msg="addSubRepositoryErrorMsg"
        :monorepo-default-branch="repository.defaultBranchName"
        :monorepo-name="repositoryName"
        :primary-action-loading="addSubRepositoryLoading"
        :show-error="showErrorInAddSubRepositoryModal"
        @close="toggleAddSubRepositoryModalVisibility(false)"
        @primary="addSubRepository"
      />
    </portal>
  </div>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'

import PinnedReportsMixin from '~/mixins/pinnedReportsMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'

import { RepoPerms } from '~/types/permTypes'
import { LoadingConditions, ReportPageT } from '~/types/reportTypes'
import {
  AddSubRepoInput,
  PinnedReportInput,
  ReportLevel,
  Repository,
  RepositoryConnection,
  RepositoryKindChoices
} from '~/types/types'

import ReportBaseGQLQuery from '~/apollo/queries/reports/reportBase.gql'
import subRepositoryListGQLQuery from '~/apollo/queries/repository/subRepositoryList.gql'

import AddSubRepositoryGQLMutation from '~/apollo/mutations/repository/addSubRepo.gql'

import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { IssueOccurrenceDistributionType } from '~/types/issues'

import { resolveNodes } from '~/utils/array'
import { shortenLargeNumber } from '~/utils/string'

import PaginationMixin from '~/mixins/paginationMixin'

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
  layout: 'repository'
})
export default class Overview extends mixins(PaginationMixin, PinnedReportsMixin, RepoDetailMixin) {
  LoadingConditions = LoadingConditions
  ReportLevel = ReportLevel

  issuesPrevented = 0
  perPageCount = 10
  currentPage = 1
  totalCount = 1

  addSubRepositoryLoading = false

  // This is intentionally made `true` initially since the monorepo status is pre-fetched at the layout level
  // and toggling it to `true` afterward will result in the empty state shown at first before the skeleton loaders for the sub repo list
  fetchingSubRepositoryList = true
  loading = false
  showMetadataViewDialog = false
  showAddSubRepositoryModal = false
  showErrorInAddSubRepositoryModal = false

  addSubRepositoryErrorMsg = ''
  searchQuery = ''

  timerId: ReturnType<typeof setTimeout>

  subRepositoryList = [] as Repository[]

  /**
   * Fetch hook to fetch all the basic details for a repository
   * @return {Promise<void>}
   */
  async fetch(): Promise<void> {
    try {
      const baseArgs = {
        ...this.baseRouteParams,
        provider: this.$providerMetaMap[this.provider].value
      }

      if (this.isMonorepo) {
        await this.fetchSubRepositories()
        return
      }

      await Promise.all([this.fetchRepoPerms(baseArgs), this.fetchRepoDetails(baseArgs)])

      // Fetch pinned reports list only if the user has the required perms
      if (this.canViewPinnedReports) {
        // Fetch the list of report keys pinned at the repository level
        await this.fetchPinnedReports({ level: ReportLevel.Repository })
      }

      await Promise.all([
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

  get canAddSubRepository(): boolean {
    return this.$gateKeeper.repo(RepoPerms.ADD_SUB_REPOSITORY, this.repoPerms.permission)
  }

  get canViewPinnedReports(): boolean {
    return this.$gateKeeper.repo(RepoPerms.VIEW_REPORTS, this.repoPerms.permission)
  }

  get isMonorepo() {
    return this.repository.kind === RepositoryKindChoices.Monorepo
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

  get owner(): string {
    return this.$route.params.owner
  }

  get provider(): string {
    return this.$route.params.provider
  }

  get repositoryName(): string {
    return this.$route.params.repo
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

  async addSubRepository({
    branch,
    subRepositoryPath
  }: {
    branch: string
    subRepositoryPath: string
  }): Promise<void> {
    if (!branch || !subRepositoryPath) {
      this.showErrorInAddSubRepositoryModal = true
      this.addSubRepositoryErrorMsg = 'Both fields are required.'
      return
    }

    const args: AddSubRepoInput = {
      defaultBranchName: branch,
      monorepoId:
        this.repoIdMap[
          `${this.$providerMetaMap[this.provider].value}-${this.owner}-${this.$route.params.repo}`
        ],
      path: subRepositoryPath
    }

    this.addSubRepositoryLoading = true

    try {
      const {
        data: { addSubRepo }
      } = await this.$applyGraphqlMutation(AddSubRepositoryGQLMutation, { input: args })

      this.showErrorInAddSubRepositoryModal = false

      this.$router.push(
        this.$generateRoute([(addSubRepo.repository as Repository).name, 'generate-config'], false)
      )

      // Re-fetch the list of sub-repositories
      this.fetchSubRepositories({ refetch: true })
    } catch (err) {
      const error = err as Error
      this.showErrorInAddSubRepositoryModal = true
      this.addSubRepositoryErrorMsg = `${error.message.replace('GraphQL error: ', '')}`

      this.$logErrorAndToast(error)
      this.addSubRepositoryLoading = false
    }
  }

  toggleAddSubRepositoryModalVisibility(visibilityStatus: boolean) {
    if (!visibilityStatus) {
      // Ensure the error message never stays if re-opening the modal
      this.showErrorInAddSubRepositoryModal = false
    }
    this.showAddSubRepositoryModal = visibilityStatus
  }

  async fetchSubRepositories(
    {
      searchQueryFromEmit,
      currentPageFromEmit,
      refetch
    }: {
      searchQueryFromEmit?: string
      currentPageFromEmit?: number
      refetch?: boolean
    } = { refetch: false }
  ) {
    try {
      if (!this.fetchingSubRepositoryList) {
        this.fetchingSubRepositoryList = true
      }

      this.searchQuery = searchQueryFromEmit ?? this.searchQuery
      this.currentPage = currentPageFromEmit ?? this.currentPage

      const provider = this.$providerMetaMap[this.provider].value

      const response: GraphqlQueryResponse = await this.$fetchGraphqlData(
        subRepositoryListGQLQuery,
        {
          provider,
          owner: this.owner,
          name: this.repositoryName,
          name_Icontains: this.searchQuery,
          first: this.perPageCount,
          after: this.$getGQLAfter(this.currentPage, this.perPageCount)
        },
        refetch
      )
      const { subRepos } = response.data.repository as { subRepos: RepositoryConnection }

      this.subRepositoryList = resolveNodes(subRepos)

      this.totalCount = subRepos.totalCount as number
    } catch (err) {
      this.$logErrorAndToast(err as Error)
    } finally {
      this.fetchingSubRepositoryList = false
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

.widget-skeleton-dimensions {
  height: 104px;
}

@media screen and (width: 1024px) {
  .widget-skeleton-dimensions {
    width: 136px;
  }
}

@media screen and (min-width: 1025px) {
  .widget-skeleton-dimensions {
    width: auto;
  }
}
</style>
