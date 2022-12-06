import { Component, mixins } from 'nuxt-property-decorator'
import { IssueDistribution, ReportLevel } from '~/types/types'
import { GraphqlQueryResponse } from '~/types/apolloTypes'
import { Dataset, IssueDistributionT, ReportPageT } from '~/types/reportTypes'

import ReportMixin from './reportMixin'

import { analyzerDistribution } from '@/apollo/queries/reports/analyzerDistribution.gql'
import { categoryDistribution } from '@/apollo/queries/reports/categoryDistribution.gql'
import { getMaxDigitDistributionHistoricalValues } from '~/utils/reports'

/**
 * Mixin for distribution report utilities
 */
@Component({})
export default class DistributionReportMixin extends mixins(ReportMixin) {
  public activeFilter: IssueDistributionT = this.getActiveFilter()

  public distributionStats: Array<IssueDistribution> = []
  public analyzerDataset: Array<Dataset> = []
  public categoryDataset: Array<Dataset> = []

  get shouldChartBeShown(): boolean {
    return !(
      this.historicalValuesLoading ||
      this.labels.length < 2 ||
      this.issueDistributionData.length === 0
    )
  }

  /**
   * Fetch and return distribution stats of a report.
   *
   * @param {ReportPageT} reportKey
   * @param {ReportLevel} level
   * @param {string} objectId
   * @param {string} distributionType
   */
  public async fetchDistributionStats(
    reportKey: ReportPageT,
    level: ReportLevel,
    objectId: string,
    distributionType: IssueDistributionT
  ) {
    this.distributionStatsLoading = true

    const distributionQuery =
      distributionType === IssueDistributionT.ANALYZER ? analyzerDistribution : categoryDistribution

    try {
      const response = (await this.$fetchGraphqlData(distributionQuery, {
        reportKey,
        level,
        objectId
      })) as GraphqlQueryResponse

      return (
        distributionType === IssueDistributionT.ANALYZER
          ? response.data.issueDistributionByAnalyzer
          : response.data.issueDistributionByCategory
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
   * Get the active filter from query params falling back to the value `category`
   *
   * @returns {IssueDistributionT}
   */
  getActiveFilter(): IssueDistributionT {
    if (
      Object.values(IssueDistributionT).includes(this.$route.query.filter as IssueDistributionT)
    ) {
      return this.$route.query.filter as IssueDistributionT
    }

    return IssueDistributionT.CATEGORY
  }

  /**
   * Set historical values for each distribution type
   *
   * @return void
   */
  public setDistributionChartData(): void {
    const analyzerValues = this.historicalValues.values.analyzer

    if (analyzerValues) {
      this.analyzerDataset = Object.keys(analyzerValues).map((analyzer) => {
        return { name: analyzer, chartType: 'bar', values: analyzerValues[analyzer] }
      })
    }

    const categoryValues = this.historicalValues.values.category

    if (categoryValues) {
      this.categoryDataset = Object.keys(categoryValues).map((category) => {
        return { name: category, chartType: 'bar', values: categoryValues[category] }
      })
    }
  }

  get issueDistributionData(): Array<Dataset> {
    return this.activeFilter === IssueDistributionT.CATEGORY
      ? this.categoryDataset
      : this.analyzerDataset
  }

  get currentVal(): number {
    return this.report?.currentValue ?? 0
  }

  get maxDigitHistoricValues(): number {
    return getMaxDigitDistributionHistoricalValues(this.activeFilter, this.historicalValues)
  }

  get reportRerenderKey(): string {
    return `${this.activeFilter}-${this.dateRangeFilter}-${this.maxBarClip}-${this.issueDistributionData.length}`
  }
}
