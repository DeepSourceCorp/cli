import dayjs from 'dayjs'

import {
  CodeHealthTrendMeta,
  CodeHealthTrendT,
  Dataset,
  DateRangeOptionT,
  HistoricalValues,
  IssueDistributionT,
  MAX_INDIVIDUAL_DATASET,
  ReportMeta,
  ReportPageT
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

export const issueCategoryMap: Record<string, Record<'label', string>> = {
  'bug-risk': { label: 'Bug risk' },
  antipattern: { label: 'Anti-pattern' },
  security: { label: 'Security' },
  style: { label: 'Style' },
  performance: { label: 'Performance' },
  doc: { label: 'Documentation' },
  coverage: { label: 'Coverage' },
  typecheck: { label: 'Type check' }
}

/**
 * Method to format historical values according to requirements of code health trend chart
 *
 * @param {HistoricalValues} historicalValues
 * @returns {Array<Dataset>}
 */
export const getFormattedCodeHealthChartData = (
  historicalValues: HistoricalValues
): Array<Dataset> => {
  const codeHealthDatasets: Array<Dataset> = []

  Object.keys(CodeHealthTrendMeta).forEach((trend, index) => {
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
        values: trendValues,
        bgColor: ReportMeta[ReportPageT.CODE_HEALTH_TREND].bgColors?.[index]
      }

      codeHealthDatasets.push(trendDataset)
    }
  })

  return codeHealthDatasets
}

/**
 * Method to format historical values according to requirements of issues autofixed
 *
 * @param {HistoricalValues} historicalValues
 * @returns {Array<Dataset>}
 */
export const getFormattedIssuesAutofixedChartData = (
  historicalValues: HistoricalValues
): Array<Dataset> => {
  const prValues = (historicalValues.values.pr ?? []) as number[]
  const defaultBranchValues = (historicalValues.values.default_branch ?? []) as number[]

  return [
    {
      name: 'In pull requests',
      values: prValues,
      chartType: 'bar',
      bgColor: ReportMeta[ReportPageT.ISSUES_AUTOFIXED].bgColors?.[0]
    },
    {
      name: 'In default branch',
      values: defaultBranchValues,
      chartType: 'bar',
      bgColor: ReportMeta[ReportPageT.ISSUES_AUTOFIXED].bgColors?.[1]
    }
  ]
}

/**
 * Method to format historical values according to requirements of compliance report chart
 *
 * @param {HistoricalValues} historicalValues
 * @returns {Array<Dataset>}
 */
export const getFormattedComplianceChartData = (
  historicalValues: HistoricalValues
): Array<Dataset> => {
  if (Array.isArray(historicalValues.values.count)) {
    return [
      {
        name: 'Active Issues',
        values: historicalValues.values.count
      }
    ]
  }

  return []
}

/**
 * Method to format the dataset according to our need
 *
 * @param {ReportPageT} reportKey
 * @param {Record<string, Array<number>>} historicalValues
 * @returns {Array<Dataset>}
 */
export const getFormattedDistributionChartData = (
  historicalValues: Record<string, Array<number>>,
  reportKey: ReportPageT
): [Array<Dataset>, Array<string>] => {
  const values = Object.assign({}, historicalValues)

  // The threshold till where individual dataset will be shown
  const threshold = MAX_INDIVIDUAL_DATASET

  // Colors for distribution charts
  const distributionChartBgColors = ReportMeta[reportKey].bgColors ?? []

  // The final array of formatted datasets to be returned
  const dataset: Array<Dataset> = []

  // ————————————————— Calculate datasets to be shown individually —————————————————

  // We'll extract the first 3 datset which have the highest cumulative value
  // For this, we'll need a map of keys and their cumulative dataset sum
  // i.e. convert {'python': [8,4,2,1,12,5], 'javascript': [12,5,7,9,13]}
  // to the shape {'python': 32, 'javascript': 46}
  const summedValues: Record<string, number> = {}
  Object.keys(values).forEach((key) => {
    summedValues[key] = values[key].reduce((a, b) => a + b, 0)
  })

  // We now sort the keys of summed values object, based on the cumulative dataset sum associated with those keys.
  // This way, the keys with the most cumulative issues will be added to the formatted dataset.
  Object.keys(summedValues)
    .sort((a, b) => summedValues[b] - summedValues[a])
    .forEach((key, index) => {
      if (index < threshold) {
        dataset.push({
          name: key,
          chartType: 'bar',
          values: values[key],
          bgColor: distributionChartBgColors[index]
        })

        // If a dataset is added, remove it from values object so it isn't repeated
        delete values[key]
      }
    })

  // If no items left in values, we don't need to calculate others values
  if (Object.values(values).length < 1) return [dataset, []]

  // ————————————————— Calculate datasets to be shown summated —————————————————

  // This array will store list of the datatsets that'll be summed up as others
  const othersDatasetNames: Array<string> = []

  // Extracting all values from othersValues to a super array in order to calculate sum
  const superArr = Object.values(values)

  othersDatasetNames.push(...Object.keys(values))

  /**
   * The final array that'll contain position wise sum of values
   *
   * If these are the values in `othersValues` ->
   * [18, 9, 3, 3, 3, 14, 9, 0, 8, 12]
   * [6, 5, 11, 12, 6, 14, 0, 9, 6, 19]
   * [7, 18, 7, 0, 17, 16, 17, 10, 11, 12]
   *
   * We want sum of all values at the same index.
   * i.e. [(18+6+7), (9+5+18), (3+11+7), ...]
   */
  const sumArr = []

  // Total num of child arrays in super array
  const totalArrays = superArr.length

  // Each child array is of same length, so we find the length of children array
  const childArrLength = superArr[0].length

  /**
   * Now we want to find sum of values at each index across all child arrays
   * e.g. in first iteration of loop below, currentSum will be sum of all elements
   * at index 0 across all child arrays
   */
  for (let i = 0; i < childArrLength; i++) {
    let currentSum = 0

    for (let j = 0; j < totalArrays; j++) {
      // get sum of value at a particular index across all child arrays
      currentSum += superArr[j][i]
    }

    // Push the cumulative sum calculated for the particular index
    sumArr.push(currentSum)
  }

  const othersDataset: Dataset = {
    name: 'others',
    chartType: 'bar',
    values: sumArr,
    bgColor: distributionChartBgColors[threshold]
  }

  dataset.push(othersDataset)

  return [dataset, othersDatasetNames]
}

/**
 * Method to compute date range based on the currently applied filter
 *
 * @param {string} dateRangeFilter
 * @returns {Record<string, string>}
 */
export const getDateRange = (dateRangeFilter: string): Record<string, string> => {
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

  // return early if no values present
  if (totalArrays < 1) return 0

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
