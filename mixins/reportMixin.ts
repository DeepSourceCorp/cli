import dayjs from 'dayjs'
import { Component, Vue } from 'nuxt-property-decorator'
import {
  Dataset,
  DateRangeOptionT,
  HistoricalValues,
  IssueDistributionT
} from '~/types/reportTypes'
import { getDateFromXAgo, DurationTypeT, getDateDiffInDays, formatDate } from '~/utils/date'

import { GraphqlQueryResponse } from '~/types/apolloTypes'
import { reportBase } from '@/apollo/queries/reports/reportBase.gql'
import { recentStats } from '@/apollo/queries/reports/recentStats.gql'
import { historicalValues } from '@/apollo/queries/reports/historicalValues.gql'
import { complianceIssues } from '@/apollo/queries/reports/complianceIssues.gql'
import { analyzerDistribution } from '@/apollo/queries/reports/analyzerDistribution.gql'
import { categoryDistribution } from '@/apollo/queries/reports/categoryDistribution.gql'

import {
  ComplianceIssue,
  RecentStat,
  Report,
  ReportLevel,
  Repository,
  IssueDistribution
} from '~/types/types'

/**
 * Mixin for reports queries and utilities
 */
@Component({})
export default class ReportMixin extends Vue {
  public report: Report = {}
  public recentStats: Array<RecentStat> = []
  public historicalValues: HistoricalValues = { labels: [], values: {} }
  public labels: Array<string> = []
  public datasets: Array<Dataset> = []
  public complianceIssueList: Array<ComplianceIssue> = []

  public reportsDataLoading = false
  public historicalValuesLoading = false
  public recentStatsLoading = false
  public distributionStatsLoading = false
  public complianceIssuesLoading = false

  public dateRangeOptions: Record<string, DateRangeOptionT> = {
    '7d': {
      count: 7,
      durationType: DurationTypeT.days
    },
    '4w': {
      count: 4,
      durationType: DurationTypeT.weeks
    },
    '3m': {
      count: 3,
      durationType: DurationTypeT.months
    },
    '6m': {
      count: 6,
      durationType: DurationTypeT.months
    },
    '12m': {
      count: 12,
      durationType: DurationTypeT.months
    }
  }

  public dateRangeFilter =
    this.$cookies.get('reports-default-daterange-filter') ?? Object.keys(this.dateRangeOptions)[0]

  /**
   * Check whether repo details exist and whether they are of the active repo.
   *
   * @param {Repository} repository
   * @returns boolean
   */
  public validateRepoDetails(repository: Repository): boolean {
    const { repo, provider, owner } = this.$route.params

    // if repo id absent, repo details don't exist
    if (!repository.id) {
      return false
    }

    // next, validate if repo details are of current active repo

    // if provider in route is different from repo provider, repo details are of
    // a different repo
    if (this.$providerMetaMap[provider].value !== repository.vcsProvider) {
      return false
    }

    // check if repo full name is correct
    if (repository.fullName !== `${owner}/${repo}`) {
      return false
    }

    return true
  }

  /**
   * Create array of labels by inferring date format type from start and end date.
   *
   * @param {HistoricalValues} historicalValues
   * @param {string} startDate
   * @param {string} endDate
   * @returns {Array<string>}
   */
  prepareLabels(
    historicalValues: HistoricalValues,
    startDate: string,
    endDate: string
  ): Array<string> {
    const dateRange = getDateDiffInDays(endDate, startDate)

    if (Array.isArray(historicalValues.labels) && historicalValues.labels.length) {
      if (dateRange <= 90) {
        return historicalValues.labels.map((label: string) => formatDate(new Date(label), 'DD MMM'))
      } else {
        return historicalValues.labels.map((label: string) => formatDate(new Date(label), 'MMM YY'))
      }
    }

    return []
  }

  /**
   * Generate route to issue page with applied tags
   *
   * @param tag string
   * @returns string
   */
  issueRoute(tag: string): string {
    const route = this.$generateRoute(['issues'])
    return `${route}?category=all&analyzer=all&q=tag:${tag}`
  }

  // ----- queries -----

  /**
   * Fetch basic data of report.
   *
   * @param {ReportLevel} level
   * @param {string} objectId
   * @param {string} key
   */
  public async fetchReportBase(level: ReportLevel, objectId: string, key: string) {
    if (objectId && level && key) {
      this.reportsDataLoading = true

      try {
        const response = (await this.$fetchGraphqlData(reportBase, {
          level,
          objectId,
          key
        })) as GraphqlQueryResponse
        this.report = response.data.report as Report
      } catch (e) {
        this.$logErrorAndToast(
          e as Error,
          'Unable to fetch report details, please contact support.'
        )
      } finally {
        this.reportsDataLoading = false
      }
    }
  }

  /**
   * Fetch and set recent stats of a report.
   *
   * @param {ReportLevel} level
   * @param {string} objectId
   * @param {string} key
   */
  public async fetchRecentStats(level: ReportLevel, objectId: string, key: string) {
    if (objectId && level && key) {
      this.recentStatsLoading = true

      try {
        const response = (await this.$fetchGraphqlData(recentStats, {
          level,
          objectId,
          key
        })) as GraphqlQueryResponse
        this.recentStats = response.data.report?.recentStats as Array<RecentStat>
      } catch (e) {
        this.$logErrorAndToast(
          e as Error,
          'Unable to fetch recent stats of report, please contact support.'
        )
      } finally {
        this.recentStatsLoading = false
      }
    }
  }

  /**
   * Fetch and set compliance issues of a compliance report.
   *
   * @param {ReportLevel} level
   * @param {string} objectId
   * @param {string} reportKey
   */
  public async fetchComplianceIssues(level: ReportLevel, objectId: string, reportKey: string) {
    if (objectId && level && reportKey) {
      this.complianceIssuesLoading = true
      try {
        const response = (await this.$fetchGraphqlData(complianceIssues, {
          level,
          objectId,
          reportKey
        })) as GraphqlQueryResponse

        this.complianceIssueList = response.data.complianceIssues as Array<ComplianceIssue>
      } catch (e) {
        this.$logErrorAndToast(
          e as Error,
          'Unable to fetch security issues list, please contact support.'
        )
      } finally {
        this.complianceIssuesLoading = false
      }
    }
  }

  /**
   * Fetch and return compliance issues of a compliance report.
   *
   * @param {ReportLevel} level
   * @param {string} objectId
   * @param {string} distributionType
   */
  public async fetchDistributionStats(
    level: ReportLevel,
    objectId: string,
    distributionType: IssueDistributionT
  ) {
    this.distributionStatsLoading = true

    const distributionQuery =
      distributionType === IssueDistributionT.ANALYZER ? analyzerDistribution : categoryDistribution

    try {
      const response = (await this.$fetchGraphqlData(distributionQuery, {
        level,
        objectId
      })) as GraphqlQueryResponse

      return (
        distributionType === IssueDistributionT.ANALYZER
          ? response.data.issueDistributionByAnalyzer
          : response.data.issueDistributionByCategory
      ) as Array<IssueDistribution>
    } catch (error) {
      this.$logErrorAndToast(
        error as Error,
        'Unable to fetch issue distribution, please contact support.'
      )
    } finally {
      this.distributionStatsLoading = false
    }
    return []
  }

  /**
   * Fetch historical values of a report and trigger label preparation.
   *
   * @param {ReportLevel} level
   * @param {string} objectId
   * @param {string} key
   */
  public async fetchHistoricalValues(level: ReportLevel, objectId: string, key: string) {
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

    if (objectId && level && key) {
      this.historicalValuesLoading = true
      try {
        const response = (await this.$fetchGraphqlData(historicalValues, {
          level,
          objectId,
          key,
          startDate,
          endDate
        })) as GraphqlQueryResponse
        this.historicalValues = (await response.data.report?.historicalValues) as HistoricalValues

        // Only setting labels in mixin cause they are common accross every page.
        // Datasets are not.
        this.labels = this.prepareLabels(this.historicalValues, startDate, endDate)
      } catch (e) {
        console.log('ERROR', e)
        this.$logErrorAndToast(
          e as Error,
          'Unable to fetch historical data of report, please contact support.'
        )
      } finally {
        this.historicalValuesLoading = false
      }
    }
  }
}
