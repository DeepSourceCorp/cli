import dayjs from 'dayjs'

import {
  CodeHealthTrendMeta,
  CodeHealthTrendT,
  Dataset,
  DateRangeOptionT,
  HistoricalValues,
  IssueDistributionT
} from '~/types/reportTypes'
import { DurationTypeT, formatDate, getDateDiffInDays, getDateFromXAgo } from './date'

export const dateRangeOptions = {
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
} as Record<string, DateRangeOptionT>

/**
 * Method to format historical values according to requirements of code health trend chart
 *
 * @param {HistoricalValues} historicalValues
 * @returns {Array<Dataset>}
 */
export const getFormattedCodeHealthChartData = (historicalValues: HistoricalValues) => {
  const codeHealthDatasets: Array<Dataset> = []

  Object.keys(CodeHealthTrendMeta).forEach((trend) => {
    // Extract trend values from historicalValues for a particular trend
    // vis-à-vis active, resolved and net
    let trendValues = historicalValues.values[trend] as Array<number>

    if (Array.isArray(trendValues)) {
      // Convert all resolved issue counts to -ve
      if (trend === CodeHealthTrendT.RESOLVED) {
        trendValues = trendValues.map((trend) => -trend)
      }

      // All other properties for dataset are coming from CodeHealthTrendMeta
      // Only values are being assigned as extracted from historicalValues
      const trendDataset: Dataset = {
        ...CodeHealthTrendMeta[trend as CodeHealthTrendT],
        values: trendValues
      }

      codeHealthDatasets.push(trendDataset)
    }
  })

  return codeHealthDatasets
}

/**
 * Method to compute date range based on the currently applied filter
 *
 * @param {string} dateRangeFilter
 * @returns {Record<string, string>}
 */
export const getDateRange = (dateRangeFilter: string) => {
  const activeDateRangeFilter = dateRangeOptions[dateRangeFilter]

  const endDate = dayjs().format('YYYY-MM-DD')

  const startDate = getDateFromXAgo(
    endDate,
    activeDateRangeFilter.durationType,
    activeDateRangeFilter.count,
    'YYYY-MM-DD'
  )

  return { startDate, endDate }
}

/**
 * Method to extract the filter type from the given filter with report key as the prefix
 * `filter` as part of report metadata is prefixed with the report key for easier comparison
 * For instance, the one corresponding to `issue-distribution` with the category filter
 * would be `{ filter: 'issue-distribution-category' }`. It helps avoid the additional
 * comparison with the report key
 *
 * @param {string} filterWithPrefix
 * @returns {string}
 */
export const getFilterType = (filterWithPrefix: string | undefined): string => {
  // Return an empty string for report types without metadata
  // For instance, compliance (OWASP/SANS)
  if (!filterWithPrefix) {
    return ''
  }

  return filterWithPrefix.split('-').slice(-1).join('')
}

/**
 * Method to extract the filter text from the given filter with report key as the prefix
 *
 * @param {string} filterWithPrefix
 * @returns {string}
 */
export const getFilterText = (filterWithPrefix: string | undefined): string => {
  const filterType = getFilterType(filterWithPrefix)

  if (filterType === '') {
    return ''
  }

  return `by ${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`
}

/**
 * Purpose of this method:
 *
 * If this is the distribution array ->
 * [18, 9, 3, 3, 3, 14, 9, 0, 8, 12]
 * [6, 5, 11, 12, 6, 14, 0, 9, 6, 19]
 * [7, 18, 7, 0, 17, 16, 17, 10, 11, 12]
 *
 * We want sum of all values at the same index, and then find the max of those sums.
 */
export const getMaxDigitDistributionHistoricalValues = (
  filter: IssueDistributionT,
  historicalValues: HistoricalValues
): number => {
  // current active distribution will be a record with each value as an array
  const currentActiveDistribution = (
    filter === IssueDistributionT.CATEGORY
      ? historicalValues.values.category
      : historicalValues.values.analyzer
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

/**
 * Create array of labels by inferring date format type from start and end date.
 *
 * @param {Array<string>} labels
 * @param {string} startDate
 * @param {string} endDate
 * @returns {Array<string>}
 */
export const prepareLabels = (
  labels: Array<string>,
  startDate: string,
  endDate: string
): Array<string> => {
  const dateRange = getDateDiffInDays(endDate, startDate)

  if (Array.isArray(labels) && labels.length) {
    const dateFormat = dateRange <= 90 ? 'DD MMM' : 'MMM YYYY'
    return labels.map((label: string) => formatDate(new Date(label), dateFormat))
  }

  return []
}
