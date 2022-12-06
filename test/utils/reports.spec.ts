import { Dataset, HistoricalValues, IssueDistributionT, ReportPageT } from '~/types/reportTypes'
import {
  getDateRange,
  getFilterText,
  getFilterType,
  getFormattedCodeHealthChartData,
  getMaxDigitDistributionHistoricalValues,
  prepareLabels
} from '~/utils/reports'

describe('[[ reports utils ]]', () => {
  test('`getDateRange` method returns a date range based on the input filter', () => {
    const startDate = '2022-09-04'
    const endDate = '2022-12-03'

    // Make `getDateFromXAgo` method return a specific date
    jest.mock('../../utils/date', () => {
      return {
        ...jest.requireActual('../../utils/date'),
        getDateFromXAgo: jest.fn(() => startDate)
      }
    })

    // Set a mock date
    jest.useFakeTimers('modern').setSystemTime(new Date(endDate))

    const dateRangeFilter = '3m'

    const expectedDateRange = { startDate, endDate }

    const dateRange = getDateRange(dateRangeFilter)
    expect(dateRange).toEqual(expectedDateRange)

    // Cleanup
    jest.useRealTimers().clearAllMocks()
  })

  test('`getFilterType` method returns an empty string for report types without metadata', () => {
    const expectedFilterType = ''

    // skipcq JS-0127
    const filter = undefined // `metadata` doesn't exist, metadata?.filter => `undefined`

    const filterType = getFilterType(filter)
    expect(filterType).toBe(expectedFilterType)
  })

  test('`getFilterType` method returns the filter type for report type with metadata', () => {
    const expectedFilterType = 'analyzer'
    const filterWithPrefix = `${ReportPageT.ISSUES_PREVENTED}-analyzer`

    const filterType = getFilterType(filterWithPrefix)
    expect(filterType).toBe(expectedFilterType)
  })

  test('`getFilterText` method returns an empty string for report types without metadata', () => {
    const expectedFilterText = ''

    // skipcq JS-0127
    const filter = undefined

    const filterText = getFilterText(filter) // `metadata` doesn't exist, metadata?.filter => `undefined`
    expect(filterText).toBe(expectedFilterText)
  })

  test('`getFilterText` method returns the filter text for report type with metadata', () => {
    const expectedFilterText = 'by Analyzer'
    const filterWithPrefix = `${ReportPageT.DISTRIBUTION}-analyzer`

    const filterText = getFilterText(filterWithPrefix)
    expect(filterText).toBe(expectedFilterText)
  })

  test('`getFormattedCodeHealthChartData` method converts the historical values input to the format as expected by the code health trend chart', () => {
    // Historical values input
    const historicalValues = {
      labels: [
        '2021-12-01',
        '2022-01-01',
        '2022-02-01',
        '2022-03-01',
        '2022-04-01',
        '2022-05-01',
        '2022-06-01',
        '2022-07-01',
        '2022-08-01',
        '2022-09-01',
        '2022-10-01',
        '2022-11-01',
        '2022-12-01'
      ],
      values: {
        net: [-9, 66, 31, -103, 15, -83, -78, -30, 16, 32, 0, -41, 2],
        active: [247, 325, 281, 262, 300, 201, 217, 272, 284, 282, 298, 258, 23],
        resolved: [256, 259, 250, 365, 285, 284, 295, 302, 268, 250, 298, 299, 21]
      }
    } as unknown as HistoricalValues

    // Expected result
    const formattedCodeHealthChartData: Array<Dataset> = [
      {
        name: 'ISSUES INTRODUCED',
        chartType: 'bar',
        values: [247, 325, 281, 262, 300, 201, 217, 272, 284, 282, 298, 258, 23]
      },
      {
        name: 'ISSUES RESOLVED',
        chartType: 'bar',
        values: [-256, -259, -250, -365, -285, -284, -295, -302, -268, -250, -298, -299, -21]
      },
      {
        name: 'NET NEW ISSUES',
        chartType: 'line',
        values: [-9, 66, 31, -103, 15, -83, -78, -30, 16, 32, 0, -41, 2]
      }
    ]

    // Assertion
    expect(getFormattedCodeHealthChartData(historicalValues)).toEqual(formattedCodeHealthChartData)
  })

  test('`getMaxDigitDistributionHistoricalValues` returns `0` as the max value if `currentActiveDistribution` is falsy', () => {
    const historicalValues = {
      labels: [],
      values: {
        analyzer: undefined, // skipcq JS-0127
        category: undefined // skipcq JS-0127
      }
    } as unknown as HistoricalValues

    const maxDistributionHistoricalValue = getMaxDigitDistributionHistoricalValues(
      IssueDistributionT.ANALYZER,
      historicalValues
    )
    expect(maxDistributionHistoricalValue).toBe(0)
  })

  test('`getMaxDigitDistributionHistoricalValues` method computes the maximum distribution value among the current active distribution entries`', () => {
    // Max value after comparing the sum of values at the same index for `CATEGORY` distribution entries
    const MAX_DISTRIBUTION_HISTORICAL_VALUE_CATEGORY = 133

    const historicalValues = {
      labels: [
        '2022-08-29',
        '2022-09-05',
        '2022-09-12',
        '2022-09-19',
        '2022-09-26',
        '2022-10-03',
        '2022-10-10',
        '2022-10-17',
        '2022-10-24',
        '2022-10-31',
        '2022-11-07',
        '2022-11-14',
        '2022-11-21',
        '2022-11-28'
      ],
      values: {
        analyzer: {
          docker: [14, 1, 5, 2, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14],
          python: [13, 8, 5, 19, 2, 16, 16, 16, 16, 16, 16, 16, 16, 16],
          'test-coverage': [5, 15, 12, 2, 5, 4, 4, 4, 4, 4, 4, 4, 4, 4]
        },
        category: {
          antipattern: [17, 10, 18, 3, 5, 9, 9, 9, 9, 9, 9, 9, 9, 9],
          'bug-risk': [3, 4, 19, 1, 6, 4, 4, 4, 4, 4, 4, 4, 4, 4],
          coverage: [14, 5, 12, 11, 19, 7, 7, 7, 7, 7, 7, 7, 7, 7],
          doc: [1, 5, 19, 13, 0, 12, 12, 12, 12, 12, 12, 12, 12, 12],
          performance: [6, 18, 17, 17, 10, 13, 13, 13, 13, 13, 13, 13, 13, 13],
          security: [3, 18, 17, 5, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15],
          style: [8, 3, 14, 0, 0, 17, 17, 17, 17, 17, 17, 17, 17, 17],
          typecheck: [16, 3, 17, 2, 10, 19, 19, 19, 19, 19, 19, 19, 19, 19]
        }
      }
    } as unknown as HistoricalValues

    const maxDistributionHistoricalValue = getMaxDigitDistributionHistoricalValues(
      IssueDistributionT.CATEGORY,
      historicalValues
    )
    expect(maxDistributionHistoricalValue).toBe(MAX_DISTRIBUTION_HISTORICAL_VALUE_CATEGORY)
  })

  test('`prepareLabels` method returns an empty array if the input labels is not an array or if it is an empty array', () => {
    const labels = [] as Array<string>

    const startDate = '2021-12-03'
    const endDate = '2022-12-03'

    const newLabels = prepareLabels(labels, startDate, endDate)
    expect(newLabels).toEqual(labels)
  })

  test('`prepareLabels` method returns an array of labels by inferring date format type from start and end date', () => {
    const labels = [
      '2022-08-29',
      '2022-09-05',
      '2022-09-12',
      '2022-09-19',
      '2022-09-26',
      '2022-10-03',
      '2022-10-10',
      '2022-10-17',
      '2022-10-24',
      '2022-10-31',
      '2022-11-07',
      '2022-11-14',
      '2022-11-21',
      '2022-11-28'
    ]

    const startDate = '2022-09-04'
    const endDate = '2022-12-03'

    const formattedLabels = [
      '29 Aug',
      '05 Sep',
      '12 Sep',
      '19 Sep',
      '26 Sep',
      '03 Oct',
      '10 Oct',
      '17 Oct',
      '24 Oct',
      '31 Oct',
      '07 Nov',
      '14 Nov',
      '21 Nov',
      '28 Nov'
    ]

    const newLabels = prepareLabels(labels, startDate, endDate)
    expect(newLabels).toEqual(formattedLabels)
  })

  test('`prepareLabels` method returns an array of labels with the appropriate date format for date ranges beyond 3 months', () => {
    const labels = [
      '2022-08-29',
      '2022-09-05',
      '2022-09-12',
      '2022-09-19',
      '2022-09-26',
      '2022-10-03',
      '2022-10-10',
      '2022-10-17',
      '2022-10-24',
      '2022-10-31',
      '2022-11-07',
      '2022-11-14',
      '2022-11-21',
      '2022-11-28'
    ]

    const startDate = '2022-06-04'
    const endDate = '2022-12-03'

    const formattedLabels = [
      'Aug 2022',
      'Sep 2022',
      'Sep 2022',
      'Sep 2022',
      'Sep 2022',
      'Oct 2022',
      'Oct 2022',
      'Oct 2022',
      'Oct 2022',
      'Oct 2022',
      'Nov 2022',
      'Nov 2022',
      'Nov 2022',
      'Nov 2022'
    ]

    const newLabels = prepareLabels(labels, startDate, endDate)
    expect(newLabels).toEqual(formattedLabels)
  })
})
