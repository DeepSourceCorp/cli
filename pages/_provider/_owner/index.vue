<template>
  <div class="p-4 space-y-4">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      <recently-active-repo-list
        :class="
          steps.length && completion < 100
            ? 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-5'
            : 'col-span-full'
        "
      ></recently-active-repo-list>
      <template v-if="steps.length && completion < 100 && allowAccountSetupCard">
        <account-setup-card :completion="completion" />
      </template>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <template v-if="isLoading">
        <div v-for="ii in 4" :key="ii" class="bg-ink-300 animate-pulse h-98"></div>
      </template>

      <template v-else-if="canViewPinnedReports">
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
            :owner="$route.params.owner"
            :provider="$route.params.provider"
            :pinned-reports="pinnedReports"
            :report-slot="reportSlot"
            class="h-full"
            @update-report-controls="
              (reportSlotFromEmit, reportControlValueFromEmit) =>
                updateReportControls(
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
import { ZIcon, ZTag } from '@deepsourcelabs/zeal'
import { Component, mixins } from 'nuxt-property-decorator'
import { DocumentNode } from 'graphql'

import { RecentlyActiveRepoList, AccountSetupCard } from '@/components/TeamHome'

import { OwnerIssuesGraph, OwnerAutofixGraph } from '@/components/Graphs'

import CodeCoverageReportGQLQuery from '~/apollo/queries/reports/codeCoverageReport.gql'
import OwnerPinnedReportsGQLQuery from '~/apollo/queries/owner/pinnedReports.gql'
import PinnedReportDataGQLQuery from '~/apollo/queries/reports/pinnedReportData.gql'

import UpdateOwnerPinnedReportsGQLMutation from '~/apollo/mutations/owner/updateOwnerPinnedReports.gql'

import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import ActiveUserMixin, { DashboardContext } from '~/mixins/activeUserMixin'

import { AppFeatures, TeamPerms } from '~/types/permTypes'
import { PinnedReport, PinnedReportInput, ReportLevel, VcsProviderChoices } from '~/types/types'
import {
  CompiledPinnedReportT,
  DateRangeOptionT,
  ILoadingValue,
  IssueDistributionT,
  LoadingConditions,
  ReportPageT
} from '~/types/reportTypes'

import ReportMap from '~/reports'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { dateRangeOptions, getDateRange, getFilterText, getFilterType } from '~/utils/reports'

// Shape of the GQL query args corresponding to chart based reports
interface IChartReportQueryArgs {
  level: ReportLevel
  objectId: string
  key: string
  startDate: string
  endDate: string
}

// Shape of the GQL query args corresponding to `code-coverage` report
interface ICodeCoverageReportQueryArgs {
  login: string
  provider: VcsProviderChoices
  first?: number
  offset?: number
  sort?: string
}

interface IFetchOwnerPinnedReportsArgs {
  refetchReportsList?: boolean
  refetchReportData?: boolean
}

interface SetupStep {
  completed: boolean
  shortcode: string
  display_name: string
  description: string
  link?: string
  actionLabel?: string
}

@Component({
  components: {
    RecentlyActiveRepoList,
    AccountSetupCard,
    OwnerIssuesGraph,
    OwnerAutofixGraph,
    ZIcon,
    ZTag
  },
  middleware: ['validateProvider', 'perm'],
  meta: {
    auth: {
      teamPerms: [TeamPerms.VIEW_TEAM_HOME]
    }
  },
  layout: 'dashboard'
})
export default class TeamHome extends mixins(OwnerDetailMixin, ActiveUserMixin) {
  compiledPinnedReports = [] as Array<CompiledPinnedReportT>
  dateRangeOptions: Record<string, DateRangeOptionT> = dateRangeOptions
  isLoading = false
  loadingValues: Array<ILoadingValue> = new Array(4).fill({ condition: null, status: false })
  ownerId = ''

  /**
   * The fetch hook
   * Fetch account setup status information and the list of pinned reports
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    const { owner, provider } = this.$route.params
    const args = { login: owner, provider }

    await Promise.all([
      this.fetchAccountSetupStatus(args),

      // Fetch the list of report keys pinned at the owner level
      this.fetchOwnerPinnedReports(),

      // Fetch `viewer` information
      this.fetchActiveUser()
    ])

    this.isLoading = false
  }

  head(): Record<string, string> {
    return {
      title: `DeepSource`
    }
  }

  /**
   * The `created` hook
   * Determine if the skeleton loader is to be displayed
   *
   * @returns {void}
   */
  created(): void {
    setTimeout(() => {
      if (this.$fetchState.pending) {
        this.isLoading = true
      }
    }, 300)
  }

  /**
   * The `mounted` hook
   * Set the active context in cookies and bind event bus listeners
   *
   * @returns {void}
   */
  mounted(): void {
    const { owner, provider } = this.$route.params
    this.setActiveContextCookie(provider, owner)

    this.$root.$on('update-pinned-reports', this.updateOwnerPinnedReports)
  }

  /**
   * The `beforeDestroy` hook
   * Unbind event bus listeners
   *
   * @returns {void}
   */
  beforeDestroy(): void {
    this.$root.$off('update-pinned-reports', this.updateOwnerPinnedReports)
  }

  get allowAccountSetupCard(): boolean {
    const context = this.activeDashboardContext as DashboardContext
    return ['ADMIN', 'MEMBER'].includes(context.role)
  }

  // Only ADMINs have the ability to swap the currently pinned report
  get allowPinningReports(): boolean {
    // Keep the menu hidden by default until the perms are fetched
    if (this.$fetchState.pending) {
      return false
    }
    return this.$gateKeeper.team(TeamPerms.PIN_REPORTS, this.teamPerms.permission)
  }

  // Only `ADMIN` and `MEMBER` can view reports
  get canViewPinnedReports(): boolean {
    return this.$gateKeeper.team(TeamPerms.VIEW_REPORTS, this.teamPerms.permission)
  }

  get showAutofixGraph(): boolean {
    const { provider } = this.$route.params
    return this.$gateKeeper.provider(AppFeatures.AUTOFIX, provider)
  }

  get steps(): Array<SetupStep> {
    return (this.owner.accountSetupStatus as Array<SetupStep>).map((step) => {
      return step as SetupStep
    })
  }

  get completion(): number {
    const completed = this.steps.filter((step) => step.completed).length
    return Math.round((completed / this.steps.length) * 100)
  }

  get pinnedReports(): Array<PinnedReport> {
    return this.compiledPinnedReports.map(({ key, metadata }: CompiledPinnedReportT) => {
      // Prevent supplying metadata filter text to the `updateOwnerPinnedReports` GQL mutation
      const metadataEntry = metadata ? { filter: metadata.filter } : null
      return { key, metadata: metadataEntry }
    })
  }

  /**
   * Method to fetch the list of report keys pinned at the owner level
   *
   * @param {IFetchOwnerPinnedReportsArgs} args
   * @returns {Promise<void>}
   */
  async fetchOwnerPinnedReports(refetchArgs: IFetchOwnerPinnedReportsArgs = {}): Promise<void> {
    const { refetchReportsList = false, refetchReportData = false } =
      refetchArgs as IFetchOwnerPinnedReportsArgs

    const { owner: login, provider } = this.$route.params
    const args = { login, provider: this.$providerMetaMap[provider].value }

    const DocNodeMap = {
      codeCoverage: CodeCoverageReportGQLQuery,
      pinnedReportData: PinnedReportDataGQLQuery
    } as Record<string, DocumentNode>

    const response = await this.$fetchGraphqlData(
      OwnerPinnedReportsGQLQuery,
      args,
      refetchReportsList
    )

    this.ownerId = response.data.owner.id
    const { pinnedReports } = response.data.owner.setting as { pinnedReports: Array<PinnedReport> }

    this.compiledPinnedReports = await Promise.all(
      pinnedReports.map((report, reportSlot) => {
        const { query, componentName, handleResponse } = ReportMap[report.key as ReportPageT]

        // TODO: Dynamically import GQL queries
        const queryArgs = this.getQueryArgs(report?.metadata?.filter || report.key, reportSlot)
        const queryDocNode = DocNodeMap[query]

        return this.$fetchGraphqlData(queryDocNode, queryArgs, refetchReportData)
          .then((response: GraphqlQueryResponse) => {
            const filterText = getFilterText(report.metadata?.filter)

            // Remove the report key prefix from the `filter`
            // `issue-distribution-category` -> `category`
            const filterType = getFilterType(report.metadata?.filter)
            const handledResponse = handleResponse(response, filterType as IssueDistributionT)

            // Combine report metadata and the response from the corresponding GQL query
            const metadata = report.metadata ? { ...report.metadata, text: filterText } : null

            const compiledPinnedReport = {
              ...report,
              metadata,
              ...handledResponse,
              componentName
            } as Record<string, unknown>

            return compiledPinnedReport
          })
          .catch((err: Error) => {
            this.$logErrorAndToast(err)
          })
      })
    )

    // Reset the `loadingValues` array
    this.loadingValues = this.getLoadingValues()
  }

  /**
   * Method to compute loading values for a given report slot
   *
   * @param {LoadingConditions} [condition]
   * @param {boolean} [status]
   * @param {number} [reportSlot]
   * @returns {Array<ILoadingValue>}
   */
  getLoadingValues(
    condition?: LoadingConditions | null,
    status?: boolean,
    reportSlot?: number
  ): Array<ILoadingValue> {
    if (typeof reportSlot === 'number' && Number.isFinite(reportSlot) && condition && status) {
      const loadingValues = [...this.loadingValues]
      loadingValues[reportSlot] = {
        condition,
        status
      }

      return loadingValues
    }

    return new Array(4).fill({ condition: null, status: false })
  }

  /**
   * Method to construct the cookie identifier based on the given report info
   *
   * @param {CompiledPinnedReportT} reportItem
   * @param {number} reportSlot
   * @returns {string}
   */
  getCookieIdentifier(reportItem: CompiledPinnedReportT, reportSlot: number): string {
    const { key, metadata } = reportItem
    const reportType = metadata?.filter || key

    const { provider, owner } = this.$route.params

    const cookieIdentifier =
      key === ReportPageT.CODE_COVERAGE
        ? `${provider}_${owner}_pinned-code-coverage-sort-type_${reportSlot}`
        : `${provider}_${owner}_${reportType}_date-range-filter_${reportSlot}`

    return cookieIdentifier
  }

  /**
   * Method to compute the args to be supplied based on the query
   *
   * @param {string} reportType
   * @param {number} reportSlot
   * @returns {ICodeCoverageReportQueryArgs | IChartReportQueryArgs}
   */
  getQueryArgs(
    reportType: string,
    reportSlot: number
  ): ICodeCoverageReportQueryArgs | IChartReportQueryArgs {
    const reportKey = [ReportPageT.DISTRIBUTION, ReportPageT.ISSUES_PREVENTED].some((key) =>
      reportType.startsWith(key)
    )
      ? reportType.split('-').slice(0, -1).join('-') // `issue-distribution-analyzer` -> `issue-distribution`
      : reportType

    const { provider, owner: login } = this.$route.params

    if (reportType === ReportPageT.CODE_COVERAGE) {
      const args: ICodeCoverageReportQueryArgs = {
        login,
        provider: this.$providerMetaMap[provider].value,
        first: 7
      }

      const sortType = this.$cookies.get(
        `${provider}_${login}_pinned-code-coverage-sort-type_${reportSlot}`
      )
      if (sortType) {
        args.sort = sortType
      }

      return args
    }

    // Date range filter persisted in cookies
    const persistedDateRangeFilter = this.$cookies.get(
      `${provider}_${login}_${reportType}_date-range-filter_${reportSlot}`
    )

    const dateRangeFilter = persistedDateRangeFilter || Object.keys(this.dateRangeOptions)[2] // Fallback to `3m`
    const { startDate, endDate } = getDateRange(dateRangeFilter)

    const args: IChartReportQueryArgs = {
      level: ReportLevel.Owner,
      objectId: this.ownerId,
      key: reportKey,
      startDate,
      endDate
    }
    return args
  }

  /**
   * Update owner pinned reports
   *
   * @returns {Promise<void>}
   */
  async updateOwnerPinnedReports(
    pinnedReports: Array<PinnedReportInput>,
    reportSlotFromEmit?: number
  ): Promise<void> {
    try {
      // Set the loading state corresponding to the report slot in scope to `true`
      this.loadingValues = this.getLoadingValues(
        LoadingConditions.REPORT_SWAP,
        true,
        reportSlotFromEmit
      )

      const args = { ownerId: this.ownerId, pinnedReports }

      // Trigger the `updateOwnerPinnedReports` GQL mutation
      await this.$applyGraphqlMutation(UpdateOwnerPinnedReportsGQLMutation, { input: args })

      // Re-fetch the list of pinned reports at the owner level
      await this.fetchOwnerPinnedReports({ refetchReportsList: true })
    } catch (err) {
      this.$logErrorAndToast(err as Error)
    }
  }

  /**
   * Handler for the `update-report-controls` event
   *
   * @param {CompiledPinnedReportT} reportItem
   * @param {number} reportSlot
   * @param {number} [reportSlotFromEmit]
   * @param {string} [reportControlValueFromEmit]
   * @returns {Promise<void>}
   */
  async updateReportControls(
    reportItem: CompiledPinnedReportT,
    reportSlot: number,
    reportSlotFromEmit?: number,
    reportControlValueFromEmit?: string
  ): Promise<void> {
    // Set the loading state corresponding to the report slot in scope to `true`
    this.loadingValues = this.getLoadingValues(
      LoadingConditions.REPORT_CONTROLS_CHANGE,
      true,
      reportSlotFromEmit
    )

    const cookieIdentifier = this.getCookieIdentifier(reportItem, reportSlot) || ''

    // Code coverage report can have `reportControlValueFromEmit` set to an empty string
    // when the filters are cleared
    if (
      reportControlValueFromEmit ||
      (reportItem.key === ReportPageT.CODE_COVERAGE && reportControlValueFromEmit === '')
    ) {
      this.$cookies.set(cookieIdentifier, reportControlValueFromEmit)
    }

    await this.fetchOwnerPinnedReports()
  }
}
</script>
