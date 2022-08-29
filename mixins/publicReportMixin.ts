import { Component, mixins } from 'nuxt-property-decorator'

import { GraphqlQueryResponse, GraphqlMutationResponse } from '~/types/apolloTypes'

import { publicReportListRepo } from '@/apollo/queries/repository/publicReportListRepo.gql'
import { publicReportListOwner } from '@/apollo/queries/owner/publicReportListOwner.gql'
import { publicReportBase } from '@/apollo/queries/reports/publicReportBase.gql'
import { publicReportBaseReport } from '@/apollo/queries/reports/publicReportBaseReport.gql'
import { publicReportRecentStats } from '@/apollo/queries/reports/publicReportRecentStats.gql'
import { publicReportCategoryDistribution } from '@/apollo/queries/reports/publicReportCategoryDistribution.gql'
import { publicReportAnalyzerDistribution } from '@/apollo/queries/reports/publicReportAnalyzerDistribution.gql'
import { publicReportComplianceIssues } from '@/apollo/queries/reports/publicReportComplianceIssues.gql'
import { publicReportHistoricValues } from '@/apollo/queries/reports/publicReportHistoricalValues.gql'

import { createPublicReport } from '@/apollo/mutations/reports/createPublicReport.gql'
import { updatePublicReport } from '@/apollo/mutations/reports/updatePublicReport.gql'
import { deletePublicReport } from '@/apollo/mutations/reports/deletePublicReport.gql'
import { verifyPasswordForPublicReport } from '@/apollo/mutations/reports/verifyPasswordForPublicReport.gql'

import ReportMixin from './reportMixin'
import PaginationMixin from './paginationMixin'

import {
  ComplianceIssue,
  CreatePublicReportInput,
  IssueDistribution,
  PublicReport,
  PublicReportBaseReportQueryVariables,
  PublicReportComplianceIssuesQueryVariables,
  PublicReportRecentStatsQueryVariables,
  RecentStat,
  Report,
  ReportSource,
  UpdatePublicReportInput,
  VerifyPasswordForPublicReportInput
} from '~/types/types'
import {
  HistoricalValues,
  IssueDistributionT,
  PublicReportErrors,
  ReportMeta,
  ReportMetaProperties,
  ReportPageT,
  ReportSortT,
  ReportToEditT
} from '~/types/reportTypes'
import dayjs from 'dayjs'
import { getDateFromXAgo } from '~/utils/date'
import { resolveNodes } from '~/utils/array'
import MetaMixin from './metaMixin'

const EMPTY_REPORT: ReportToEditT = {
  reportId: '',
  isRestricted: false,
  reportKeys: [],
  shareHistoricalData: false,
  label: '',
  source: ReportSource.SourceAll,
  sourcedRepositories: []
}

/**
 * Mixin for reports queries and utilities
 */
@Component({})
export default class PublicReportMixin extends mixins(ReportMixin, PaginationMixin, MetaMixin) {
  public isMutateReportModalOpen = false
  public errorMessage: PublicReportErrors | null = null

  public q = ''
  public sort: ReportSortT | '' = ''
  public reportsListLoading = false
  public reportsList: Array<PublicReport> = []
  public perPageCount = 10
  public editMode = false
  public reportSaveLoading = false
  public reportToEdit: ReportToEditT = EMPTY_REPORT

  public showConfirmDelete = false
  public reportIdToDelete = ''
  public reportLabelToDelete = ''
  public deleteLoading = false

  public submitPasswordLoading = false

  /**
   * Handler method to clear search query and refetch public report list
   *
   * @returns void
   */
  public async clearSearch() {
    this.q = ''
    this.currentPage = 1
    await this.fetchPublicReportList()
  }

  /**
   * Handler method to refetch reports when the sort type changes
   *
   * @returns {Promise<void>}
   */
  public async handleSortChange(): Promise<void> {
    this.currentPage = 1
    await this.fetchPublicReportList(false)
  }

  /**
   * Handler method to open report delete confirm modal and
   * set data for the report to be deleted
   *
   * @param reportId string
   * @param label string
   */
  public triggerDelete(reportId: string, label: string) {
    this.showConfirmDelete = true
    this.reportLabelToDelete = label
    this.reportIdToDelete = reportId
  }

  /**
   * Handler method to open mutate report modal in edit mode and
   * set data for the report to be edited
   *
   * @param reportId string
   */
  public triggerEdit(reportId: string) {
    this.editMode = true

    const report = this.reportsList.find((report) => report.reportId === reportId)
    if (report) {
      this.reportToEdit = report
    } else {
      this.reportToEdit = EMPTY_REPORT
    }

    this.isMutateReportModalOpen = true
  }

  /**
   * Handler method to close mutate report modal, turn off edit mode and
   * reset reportToEdit to initial values
   * @returns void
   */
  public triggerModalClose() {
    this.isMutateReportModalOpen = false
    this.editMode = false
    this.reportToEdit = EMPTY_REPORT
  }

  public get publicReportMeta() {
    return ReportMeta[ReportPageT.PUBLIC_REPORTS]
  }

  public get showCtaAndControls(): boolean {
    return (
      this.reportsList.length > 0 || this.q !== '' || this.sort !== '' || this.reportsListLoading
    )
  }

  /**
   * Set metadata title and description for public view of public reports
   *
   * @param reportName string
   * @param ownerLogin string
   */
  public setPageMetaData(reportName: ReportMetaProperties['title'], ownerLogin: string) {
    this.metaTitle = `${reportName} — ${ownerLogin}`
    this.metaDescription = `${reportName} report for ${ownerLogin}, generated by DeepSource.`
  }

  // ----- queries -----

  /**
   * Fetch and set list of public reports
   *
   * @param refetch boolean
   * @returns {Promise<void>}
   */
  public async fetchPublicReportList(refetch = true, query?: string): Promise<void> {
    // !Note Update route when moving to new Team Layout
    const ownerPublicReportsRoute = 'provider-owner-settings-reports-public-reports'
    const repoPublicReportsRoute = 'provider-owner-repo-reports-public-reports'

    if (
      this.$route.name !== ownerPublicReportsRoute &&
      this.$route.name !== repoPublicReportsRoute
    ) {
      return
    }

    const first = this.perPageCount
    const offset = this.queryOffset
    const sort = this.sort
    const searchQuery = query ?? this.q

    if (this.$route.name === ownerPublicReportsRoute) {
      this.reportsListLoading = true

      const { provider, owner: login } = this.$route.params

      try {
        const response = (await this.$fetchGraphqlData(
          publicReportListOwner,
          {
            login,
            provider: this.$providerMetaMap[provider].value,
            first,
            offset,
            sort,
            q: searchQuery
          },
          refetch
        )) as GraphqlQueryResponse

        this.totalCount = response.data.owner?.publicReports?.totalCount ?? 0
        this.reportsList = resolveNodes(response.data.owner?.publicReports) as Array<PublicReport>
      } catch (e) {
        this.$logErrorAndToast(
          e as Error,
          'Unable to fetch public reports. Please contact support.'
        )
      } finally {
        this.reportsListLoading = false
      }
    } else if (this.$route.name === repoPublicReportsRoute) {
      this.reportsListLoading = true

      const { provider, owner, repo } = this.$route.params

      try {
        const response = (await this.$fetchGraphqlData(
          publicReportListRepo,
          {
            name: repo,
            owner,
            provider: this.$providerMetaMap[provider].value,
            first,
            offset,
            sort,
            q: searchQuery
          },
          refetch
        )) as GraphqlQueryResponse

        this.totalCount = response.data.repository?.publicReports?.totalCount ?? 0
        this.reportsList = resolveNodes(
          response.data.repository?.publicReports
        ) as Array<PublicReport>
      } catch (e) {
        this.$logErrorAndToast(
          e as Error,
          'Unable to fetch public reports. Please contact support.'
        )
      } finally {
        this.reportsListLoading = false
      }
    }
  }

  /**
   * Fetch basic details of a public report
   *
   * @param reportId string
   * @param token string
   * @returns {Promise<PublicReport | void>}
   */
  public async fetchPublicReportBase(
    reportId: string,
    token?: string,
    refetch?: boolean
  ): Promise<PublicReport | void> {
    this.submitPasswordLoading = true

    try {
      const response = (await this.$fetchGraphqlData(
        publicReportBase,
        {
          reportId,
          token
        },
        refetch
      )) as GraphqlQueryResponse

      if (response.data.publicReport?.id) {
        this.errorMessage = null
      }

      return response.data.publicReport as PublicReport
    } catch (e) {
      const message = (e as Error).message.replace('GraphQL error: ', '')
      if (message === PublicReportErrors.AUTH_REQUIRED) {
        this.errorMessage = PublicReportErrors.AUTH_REQUIRED
      }

      switch (message) {
        case PublicReportErrors.AUTH_REQUIRED:
          this.errorMessage = PublicReportErrors.AUTH_REQUIRED
          break
        case PublicReportErrors.INVALID_TOKEN:
          this.errorMessage = PublicReportErrors.INVALID_TOKEN
          break
        default:
          this.$logErrorAndToast(e as Error, 'Unable to verify password. Please contact support.')
          break
      }
    } finally {
      this.submitPasswordLoading = false
    }
  }

  /**
   * Fetch recent stats for a report inside public report
   *
   * @param args {PublicReportBaseReportQueryVariables}
   *
   * @return {Promise<void>}
   */
  public async fetchPublicReportBaseReport(
    args: PublicReportBaseReportQueryVariables
  ): Promise<void> {
    this.reportsDataLoading = true
    try {
      const response = (await this.$fetchGraphqlData(
        publicReportBaseReport,
        args
      )) as GraphqlQueryResponse

      this.report = response.data.publicReport?.report as Report
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'Unable to fetch report details. Please contact support.')
    } finally {
      this.reportsDataLoading = false
    }
  }

  /**
   * Fetch recent stats for a report inside public report
   *
   * @param args {PublicReportRecentStatsQueryVariables}
   *
   * @return {Promise<void>}
   */
  public async fetchPublicReportRecentStats(
    args: PublicReportRecentStatsQueryVariables
  ): Promise<void> {
    this.recentStatsLoading = true

    try {
      const response = (await this.$fetchGraphqlData(
        publicReportRecentStats,
        args
      )) as GraphqlQueryResponse

      this.recentStats = response.data.publicReport?.report?.recentStats as Array<RecentStat>
    } catch (e) {
      this.$logErrorAndToast(
        e as Error,
        'Unable to fetch recent stats of report, please contact support.'
      )
    } finally {
      this.recentStatsLoading = false
    }
  }

  /**
   * Fetch and return distribution stats of a public report.
   * @param {string} reportId
   * @param {IssueDistributionT} distributionType
   * @param {string} token
   *
   * @returns {Promise<IssueDistribution[]>}
   */
  public async fetchPublicReportDistributionStats(
    reportId: string,
    distributionType: IssueDistributionT,
    token?: string
  ): Promise<IssueDistribution[]> {
    this.distributionStatsLoading = true

    const distributionQuery =
      distributionType === IssueDistributionT.ANALYZER
        ? publicReportAnalyzerDistribution
        : publicReportCategoryDistribution

    try {
      const response = (await this.$fetchGraphqlData(distributionQuery, {
        reportId,
        token
      })) as GraphqlQueryResponse

      return (
        distributionType === IssueDistributionT.ANALYZER
          ? response.data.publicReport?.issueDistributionByAnalyzer
          : response.data.publicReport?.issueDistributionByCategory
      ) as Array<IssueDistribution>
    } catch (e) {
      this.$logErrorAndToast(
        e as Error,
        'Unable to fetch issue distribution, please contact support.'
      )
    } finally {
      this.distributionStatsLoading = false
    }
    return []
  }

  /**
   * Fetch recent stats for a report inside public report
   *
   * @param args {PublicReportComplianceIssuesQueryVariables}
   *
   * @return {Promise<void>}
   */
  public async fetchPublicReportComplianceIssues(
    args: PublicReportComplianceIssuesQueryVariables
  ): Promise<void> {
    this.complianceIssuesLoading = true
    try {
      const response = (await this.$fetchGraphqlData(
        publicReportComplianceIssues,
        args
      )) as GraphqlQueryResponse

      this.complianceIssueList = response.data.publicReport
        ?.complianceIssues as Array<ComplianceIssue>
    } catch (e) {
      this.$logErrorAndToast(
        e as Error,
        'Unable to fetch security issues list, please contact support.'
      )
    } finally {
      this.complianceIssuesLoading = false
    }
  }

  /**
   * Fetch historical values of a report and trigger label preparation.
   *
   * @param reportId string
   * @param reportKey string
   * @param token string
   *
   * @return {Promise<void>}
   */
  public async fetchPublicReportHistoricalValues(
    reportId: string,
    reportKey: string,
    token?: string
  ): Promise<void> {
    const defaultDateRangeFilter = this.$cookies.get('reports-default-daterange-filter')

    if (this.dateRangeFilter !== defaultDateRangeFilter) {
      this.$cookies.set('reports-default-daterange-filter', this.dateRangeFilter)
    }

    const activeDateRangeFilter = this.dateRangeOptions[this.dateRangeFilter]

    const endDate = dayjs().format('YYYY-MM-DD')

    const startDate = getDateFromXAgo(
      endDate,
      activeDateRangeFilter.durationType,
      activeDateRangeFilter.count,
      'YYYY-MM-DD'
    )
    if (reportId && reportKey && startDate && endDate) {
      this.historicalValuesLoading = true
      try {
        const response = (await this.$fetchGraphqlData(publicReportHistoricValues, {
          reportId,
          reportKey,
          token,
          startDate,
          endDate
        })) as GraphqlQueryResponse
        this.historicalValues = (await response.data.publicReport?.report
          ?.historicalValues) as HistoricalValues

        // Only setting labels in mixin cause they are common accross every page.
        // Datasets are not.
        this.labels = this.prepareLabels(this.historicalValues, startDate, endDate)
      } catch (e) {
        this.$logErrorAndToast(
          e as Error,
          'Unable to fetch historical data of report, please contact support.'
        )
      } finally {
        this.historicalValuesLoading = false
      }
    }
  }

  // ----- mutations -----

  /**
   * Mutation to create new public report
   *
   * @param newReportArgs CreatePublicReportInput
   * @param callback () => void
   *
   * @return {Promise<void>}
   */
  public async createPublicReport(
    newReportArgs: CreatePublicReportInput,
    callback?: () => void
  ): Promise<void> {
    this.reportSaveLoading = true
    try {
      const response = (await this.$applyGraphqlMutation(createPublicReport, {
        input: newReportArgs
      })) as GraphqlMutationResponse

      const newReport = response.data?.createPublicReport?.report

      if (newReport && newReport.reportId) {
        callback?.()
        this.$toast.success('Report successfully created.')
        await this.fetchPublicReportList()
        window.open(`/report/${newReport.reportId}`)
      }
    } catch (e) {
      this.$logErrorAndToast(e as Error, "Can't create a report. Please contact support.")
    } finally {
      this.reportSaveLoading = false
    }
  }

  /**
   * Mutation to delete a public report
   *
   * @param callback () => void
   *
   * @return {Promise<void>}
   */
  public async deletePublicReport(callback?: () => void): Promise<void> {
    this.deleteLoading = true

    try {
      const response = (await this.$applyGraphqlMutation(deletePublicReport, {
        input: { reportId: this.reportIdToDelete }
      })) as GraphqlMutationResponse

      const res = response.data?.deletePublicReport
      if (res && res.ok) {
        if (this.reportsList.length === 1 && this.currentPage > 1) {
          this.currentPage = this.currentPage - 1
        }
        await this.fetchPublicReportList()
        this.$toast.success('Report deleted succesfully')
        callback?.()
      }
    } catch (e) {
      const message = (e as Error).message.replace('GraphQL error: ', '')

      // If a user is trying to delete a report, but right before that someone else deletes the report,
      // it'll send back a 404, because the erportsList won't have been updated for the current user.
      // So we just give them a success message because the report was already deleted.
      if (message === PublicReportErrors.DOES_NOT_EXIST) {
        callback?.()
        this.$toast.success('Report deleted succesfully')
        await this.fetchPublicReportList()
      } else {
        this.$logErrorAndToast(e as Error, 'Unable to delete report. Please contact support')
      }
    } finally {
      this.deleteLoading = false
    }
  }

  /**
   * Mutation to update a public report
   *
   * @param editReportArgs UpdatePublicReportInput
   * @param callback () => void
   *
   * @return {Promise<void>}
   */
  public async updatePublicReport(
    editReportArgs: UpdatePublicReportInput,
    callback?: () => void
  ): Promise<void> {
    this.reportSaveLoading = true

    try {
      const response = (await this.$applyGraphqlMutation(updatePublicReport, {
        input: editReportArgs
      })) as GraphqlMutationResponse

      const updatedReport = response.data?.updatePublicReport

      if (updatedReport && updatedReport.publicReport?.reportId) {
        callback?.()
        const label = updatedReport.publicReport.label ?? ''
        this.$toast.success(`${label} has been updated.`)
        await this.fetchPublicReportList()
      }
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'Unable to update the report. Please contact support.')
    } finally {
      this.reportSaveLoading = false
    }
  }

  /**
   * Mutation to verify password for a public report
   *
   * @param input VerifyPasswordForPublicReportInput
   *
   * @return {Promise<string>}
   */
  public async verifyPasswordForPublicReport(
    input: VerifyPasswordForPublicReportInput
  ): Promise<string> {
    this.submitPasswordLoading = true

    try {
      const response = (await this.$applyGraphqlMutation(verifyPasswordForPublicReport, {
        input
      })) as GraphqlMutationResponse

      const token = response.data?.verifyPasswordForPublicReport?.token

      if (token) {
        this.errorMessage = null
      }

      return token as string
    } catch (e) {
      const message = (e as Error).message.replace('GraphQL error: ', '')

      // Not asssigning message to errorMessage directly cause need to match enum types
      switch (message) {
        case PublicReportErrors.INVALID_PASSWORD:
          this.errorMessage = PublicReportErrors.INVALID_PASSWORD
          break
        case PublicReportErrors.DOES_NOT_EXIST:
          this.errorMessage = PublicReportErrors.DOES_NOT_EXIST
          break
        default:
          this.$logErrorAndToast(e as Error, 'Unable to verify password. Please contact support.')
          break
      }
    } finally {
      this.submitPasswordLoading = false
    }
    return ''
  }
}
