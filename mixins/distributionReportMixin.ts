import { Component, mixins } from 'nuxt-property-decorator'
import { IssueDistribution, ReportLevel } from '~/types/types'
import { GraphqlQueryResponse } from '~/types/apolloTypes'
import { Dataset, IssueDistributionT, ReportPageT } from '~/types/reportTypes'

import ReportMixin from './reportMixin'

import { analyzerDistribution } from '@/apollo/queries/reports/analyzerDistribution.gql'
import { categoryDistribution } from '@/apollo/queries/reports/categoryDistribution.gql'

/**
 * Mixin for distribution report utilities
 */
@Component({})
export default class DistributionReportMixin extends mixins(ReportMixin) {
  public activeFilter: IssueDistributionT = IssueDistributionT.CATEGORY
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

  /**
   * Purpose of this getter:
   *
   * If this is the distribution array ->
   * [18, 9, 3, 3, 3, 14, 9, 0, 8, 12]
   * [6, 5, 11, 12, 6, 14, 0, 9, 6, 19]
   * [7, 18, 7, 0, 17, 16, 17, 10, 11, 12]
   *
   * We want sum of all values at the same index, and then find the max of those sums.
   */
  get maxDigitHistoricValues(): number {
    // current active distribution will be a record with each value as an array
    const currentActiveDistribution = (
      this.activeFilter === IssueDistributionT.CATEGORY
        ? this.historicalValues.values.category
        : this.historicalValues.values.analyzer
    ) as Record<string, number[]>

    if (!currentActiveDistribution) {
      return 0
    }

    // We extract values from the record above.
    // Super array is now an array of arrays
    const superArr = Object.values(currentActiveDistribution)

    // The final max value we'll return
    let max = Number.MIN_SAFE_INTEGER

    // Total num of child arrays in super array
    const totalArrays = superArr.length

    // Each child array is of same length, so we find the length of children array
    const childArrLength = superArr[0].length

    /**
     * Now we want to find sum of values at each index across all child arrays
     * i.e. in first iteration of loop below, currentSum will be sum of all elements
     * at index 0 across all child arrays
     */
    for (let i = 0; i < childArrLength; i++) {
      let currentSum = 0

      for (let j = 0; j < totalArrays; j++) {
        // get sum of value at a particular index across all child arrays
        currentSum += superArr[j][i]
      }

      // Check if the sum we just calculated is the biggest sum yet or not
      max = currentSum > max ? currentSum : max
    }

    return max
  }

  get reportRerenderKey(): string {
    return `${this.activeFilter}-${this.dateRangeFilter}-${this.maxBarClip}-${this.issueDistributionData.length}`
  }
}
