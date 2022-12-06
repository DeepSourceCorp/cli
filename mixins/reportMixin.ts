import { Component, Vue } from 'nuxt-property-decorator'
import { Dataset, DateRangeOptionT, HistoricalValues } from '~/types/reportTypes'

import { GraphqlQueryResponse } from '~/types/apolloTypes'
import { reportBase } from '@/apollo/queries/reports/reportBase.gql'
import { recentStats } from '@/apollo/queries/reports/recentStats.gql'
import { historicalValues } from '@/apollo/queries/reports/historicalValues.gql'

import {
  ComplianceIssue,
  ComplianceIssueOccurrence,
  RecentStat,
  Report,
  ReportLevel,
  Repository
} from '~/types/types'

import { roundToSignificantNumber } from '~/utils/number'
import { dateRangeOptions, getDateRange, prepareLabels } from '~/utils/reports'

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
  public complianceIssuesSeverityMap: ComplianceIssueOccurrence = {}

  public reportsDataLoading = false
  public historicalValuesLoading = false
  public recentStatsLoading = false
  public distributionStatsLoading = false
  public complianceIssuesLoading = false

  public dateRangeOptions: Record<string, DateRangeOptionT> = dateRangeOptions

  public dateRangeFilter: string =
    this.$cookies.get('reports-default-daterange-filter') ?? Object.keys(this.dateRangeOptions)[0]

  get maxDigitHistoricValues(): number {
    if (this.historicalValues?.values?.count) {
      return Math.max(...this.historicalValues.values.count)
    }
    return 0
  }

  get maxLineClip() {
    const exaggeratedMax = this.maxDigitHistoricValues * 1.25
    return roundToSignificantNumber(exaggeratedMax, exaggeratedMax.toString().length - 1)
  }

  get maxBarClip() {
    return roundToSignificantNumber(
      this.maxDigitHistoricValues,
      this.maxDigitHistoricValues.toString().length - 1
    )
  }

  get shouldChartBeShown(): boolean {
    return !(this.historicalValuesLoading || this.labels.length < 2 || this.datasets.length === 0)
  }

  get currentVal(): number {
    return this.report?.currentValue ?? 0
  }

  get reportRerenderKey(): string {
    return `${this.dateRangeFilter}-${this.maxDigitHistoricValues}-${this.datasets.length}`
  }

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

    const { startDate, endDate } = getDateRange(this.dateRangeFilter)

    if (objectId && level && key) {
      /**
       * More often than not, we're hitting Apollo cache but historicalValuesLoading
       * still changes everytime, causing flixker of empty-chart.
       * We're adding a manual setTimeout to check if we're hitting cache or not
       * and setting historicalValues accordingly.
       */
      const setTrueTimeout = setTimeout(() => {
        this.historicalValuesLoading = true
      }, 20)
      try {
        const response = (await this.$fetchGraphqlData(historicalValues, {
          level,
          objectId,
          key,
          startDate,
          endDate
        })) as GraphqlQueryResponse
        clearTimeout(setTrueTimeout)
        this.historicalValues = (await response.data.report?.historicalValues) as HistoricalValues

        // Only setting labels in mixin cause they are common accross every page.
        // Datasets are not.
        this.labels = prepareLabels(this.historicalValues.labels, startDate, endDate)
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
}
