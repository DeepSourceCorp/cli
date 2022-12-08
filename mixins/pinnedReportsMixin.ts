import { Component, mixins } from 'nuxt-property-decorator'

import { DocumentNode } from 'graphql'
import ReportMap from '~/reports'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import {
  CompiledPinnedReportT,
  DateRangeOptionT,
  ILoadingValue,
  IssueDistributionT,
  LoadingConditions,
  ReportPageT
} from '~/types/reportTypes'
import {
  Owner,
  PinnedReport,
  PinnedReportInput,
  ReportLevel,
  Repository,
  VcsProviderChoices
} from '~/types/types'
import { dateRangeOptions, getDateRange, getFilterText, getFilterType } from '~/utils/reports'

import OwnerPinnedReportsGQLQuery from '~/apollo/queries/owner/pinnedReports.gql'
import CodeCoverageReportGQLQuery from '~/apollo/queries/reports/codeCoverageReport.gql'
import PinnedReportDataGQLQuery from '~/apollo/queries/reports/pinnedReportData.gql'
import RepositoryPinnedReportsGQLQuery from '~/apollo/queries/repository/pinnedReports.gql'

import UpdateOwnerPinnedReportsGQLMutation from '~/apollo/mutations/owner/updateOwnerPinnedReports.gql'
import UpdateRepositoryPinnedReportsGQLMutation from '~/apollo/mutations/repository/updateRepositoryPinnedReports.gql'
import RoleAccessMixin from './roleAccessMixin'

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
  level: ReportLevel
  login: string
  provider: VcsProviderChoices
  first?: number
  offset?: number
  sort?: string
}

interface IFetchPinnedReportsArgs {
  level: ReportLevel
  refetchReportsList?: boolean
  refetchReportData?: boolean
}

/**
 * Mixin compiling the common logic for pinned reports at the owner and repository level
 */
@Component({ name: 'PinnedReportsMixin' })
export default class PinnedReportsMixin extends mixins(RoleAccessMixin) {
  compiledPinnedReports = [] as Array<CompiledPinnedReportT>
  dateRangeOptions: Record<string, DateRangeOptionT> = dateRangeOptions
  loadingValues: Array<ILoadingValue> = new Array(4).fill({ condition: null, status: false })
  objectId = ''

  get pinnedReports(): Array<PinnedReport> {
    return this.compiledPinnedReports.map(({ key, metadata }: CompiledPinnedReportT) => {
      // Prevent supplying metadata filter text to the `updateRepositoryPinnedReports` GQL mutation
      const metadataEntry = metadata ? { filter: metadata.filter } : null
      return { key, metadata: metadataEntry }
    })
  }

  /**
   * Method to fetch the list of report keys pinned at the owner level
   *
   * @param {IFetchPinnedReportsArgs} args
   * @returns {Promise<void>}
   */
  async fetchPinnedReports(options: IFetchPinnedReportsArgs): Promise<void> {
    const { level, refetchReportsList = false, refetchReportData = false } = options

    // Compile the args based on the level
    const args = this.getFetchPinnedReportsArgs(level)

    const DocNodeMap = {
      codeCoverage: CodeCoverageReportGQLQuery,
      pinnedReportData: PinnedReportDataGQLQuery
    } as Record<string, DocumentNode>

    const gqlQueryMap = {
      [ReportLevel.Owner]: OwnerPinnedReportsGQLQuery,
      [ReportLevel.Repository]: RepositoryPinnedReportsGQLQuery
    } as Record<ReportLevel, DocumentNode>

    // Trigger the GQL query based on the level
    const gqlQuery = gqlQueryMap[level]
    const response = await this.$fetchGraphqlData(gqlQuery, args, refetchReportsList)

    const responseMap = {
      [ReportLevel.Owner]: response?.data?.owner,
      [ReportLevel.Repository]: response?.data?.repository
    } as Record<ReportLevel, Owner | Repository>

    // Owner/Repository ID
    this.objectId = responseMap[level]?.id

    // Owner/Repository setting
    const setting = responseMap[level]?.setting as {
      pinnedReports: Array<PinnedReport>
    }

    this.compiledPinnedReports = await Promise.all(
      setting?.pinnedReports.map((report, reportSlot) => {
        const { query, componentName, handleResponse } = ReportMap[report.key as ReportPageT]

        // TODO: Dynamically import GQL queries
        const queryArgs = this.getQueryArgs(
          level,
          report?.metadata?.filter || report.key,
          reportSlot
        )
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
   * Method to construct the cookie identifier based on the given report info
   *
   * @param {ReportLevel} level
   * @param {string} reportType
   * @param {number} reportSlot
   * @returns {string}
   */
  getCookieIdentifier(level: ReportLevel, reportType: string, reportSlot: number): string {
    const { owner, provider, repo } = this.$route.params

    if (reportType === ReportPageT.CODE_COVERAGE) {
      return `${provider}_${owner}_pinned-code-coverage-sort-type_${reportSlot}`
    }

    const repoKey = level === ReportLevel.Repository ? `_${repo}` : ''
    return `${provider}_${owner}${repoKey}_${reportType}_date-range-filter_${reportSlot}`
  }

  /**
   * Method to compile args for `pinnedReports` GQL query
   *
   * @param {ReportLevel} level
   * @returns {Record<string, unknown>}
   */
  getFetchPinnedReportsArgs(level: ReportLevel): Record<string, unknown> {
    const { owner, provider: providerFromRouteParam, repo } = this.$route.params

    const provider = this.$providerMetaMap[providerFromRouteParam].value

    const argsMap = {
      [ReportLevel.Owner]: {
        login: owner,
        provider
      },
      [ReportLevel.Repository]: {
        name: repo,
        owner,
        provider
      }
    } as Partial<Record<ReportLevel, Record<string, unknown>>>

    return argsMap[level] as Record<string, unknown>
  }

  /**
   * Method to compute loading values for a given report slot
   *
   * @param {LoadingConditions | null} [condition]
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
   * Method to compute the args to be supplied based on the query
   *
   * @param {string} reportType
   * @param {number} reportSlot
   * @returns {IChartReportQueryArgs}
   */
  getQueryArgs(
    level: ReportLevel,
    reportType: string,
    reportSlot: number
  ): IChartReportQueryArgs | ICodeCoverageReportQueryArgs {
    const reportKey = [ReportPageT.DISTRIBUTION, ReportPageT.ISSUES_PREVENTED].some((key) =>
      reportType.startsWith(key)
    )
      ? reportType.split('-').slice(0, -1).join('-') // `issue-distribution-analyzer` -> `issue-distribution`
      : reportType

    const { owner, provider } = this.$route.params

    const cookieIdentifier = this.getCookieIdentifier(level, reportType, reportSlot)

    if (reportType === ReportPageT.CODE_COVERAGE) {
      const args: ICodeCoverageReportQueryArgs = {
        level,
        login: owner,
        provider: this.$providerMetaMap[provider].value,
        first: 7
      }

      const sortType = this.$cookies.get(cookieIdentifier)
      if (sortType) {
        args.sort = sortType
      }

      return args
    }

    // Date range filter persisted in cookies
    const persistedDateRangeFilter = this.$cookies.get(cookieIdentifier)

    const dateRangeFilter = persistedDateRangeFilter || Object.keys(this.dateRangeOptions)[2] // Fallback to `3m`
    const { startDate, endDate } = getDateRange(dateRangeFilter)

    const args: IChartReportQueryArgs = {
      level,
      objectId: this.objectId,
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
  async updatePinnedReports(
    level: ReportLevel,
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

      const args = { pinnedReports } as {
        ownerId?: string
        repositoryId?: string
        pinnedReports: Array<PinnedReport>
      }

      // Determine the key based on the level
      const objectIdKey = level === ReportLevel.Owner ? 'ownerId' : 'repositoryId'
      args[objectIdKey] = this.objectId

      const gqlMutationMap = {
        [ReportLevel.Owner]: UpdateOwnerPinnedReportsGQLMutation,
        [ReportLevel.Repository]: UpdateRepositoryPinnedReportsGQLMutation
      } as Record<ReportLevel, DocumentNode>

      // Trigger the GQL mutation based on the level
      const gqlMutation = gqlMutationMap[level]
      await this.$applyGraphqlMutation(gqlMutation, { input: args })

      // Re-fetch the list of pinned reports at the owner level
      await this.fetchPinnedReports({ level, refetchReportsList: true })
    } catch (err) {
      this.$logErrorAndToast(err as Error)
    }
  }

  /**
   * Handler for the `update-report-controls` event
   *
   * @param {ReportLevel} level
   * @param {CompiledPinnedReportT} reportItem
   * @param {number} reportSlot
   * @param {number} [reportSlotFromEmit]
   * @param {string} [reportControlValueFromEmit]
   * @returns {Promise<void>}
   */
  async updateReportControls(
    level: ReportLevel,
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

    const cookieIdentifier =
      this.getCookieIdentifier(level, reportItem?.metadata?.filter || reportItem.key, reportSlot) ||
      ''

    if (
      reportControlValueFromEmit ||
      (reportItem.key === ReportPageT.CODE_COVERAGE && reportControlValueFromEmit === '')
    ) {
      this.$cookies.set(cookieIdentifier, reportControlValueFromEmit)
    }

    await this.fetchPinnedReports({ level })
  }
}
