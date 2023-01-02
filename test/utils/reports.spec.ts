import { Dataset, HistoricalValues, IssueDistributionT, ReportPageT } from '~/types/reportTypes'
import {
  getDateRange,
  getFilterText,
  getFilterType,
  getFormattedCodeHealthChartData,
  getFormattedComplianceChartData,
  getFormattedDistributionChartData,
  getFormattedIssuesAutofixedChartData,
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
        bgColor: 'bg-cherry-500',
        name: 'issues introduced',
        chartType: 'bar',
        values: [247, 325, 281, 262, 300, 201, 217, 272, 284, 282, 298, 258, 23]
      },
      {
        bgColor: 'bg-juniper-500',
        name: 'issues resolved',
        chartType: 'bar',
        values: [-256, -259, -250, -365, -285, -284, -295, -302, -268, -250, -298, -299, -21]
      },
      {
        bgColor: 'bg-robin-500',
        name: 'net new issues',
        chartType: 'line',
        values: [-9, 66, 31, -103, 15, -83, -78, -30, 16, 32, 0, -41, 2]
      }
    ]

    // Assertion
    expect(getFormattedCodeHealthChartData(historicalValues)).toEqual<Array<Dataset>>(
      formattedCodeHealthChartData
    )
  })

  test('`getFormattedIssuesAutofixedChartData` method formats dataset for issues autofixed chart correctly', () => {
    // Historical values input
    const historicalValues = {
      labels: [
        '2022-12-08',
        '2022-12-09',
        '2022-12-10',
        '2022-12-11',
        '2022-12-12',
        '2022-12-13',
        '2022-12-14',
        '2022-12-15'
      ],
      values: {
        total: [31, 14, 33, 34, 18, 20, 5, 30],
        pr: [12, 1, 16, 16, 8, 4, 2, 14],
        default_branch: [19, 13, 17, 18, 10, 16, 3, 16]
      }
    } as unknown as HistoricalValues

    // Expected result
    const formattedIssuesAutofixedChartData: Array<Dataset> = [
      {
        name: 'In pull requests',
        values: [12, 1, 16, 16, 8, 4, 2, 14],
        chartType: 'bar',
        bgColor: 'bg-juniper-500'
      },
      {
        name: 'In default branch',
        values: [19, 13, 17, 18, 10, 16, 3, 16],
        chartType: 'bar',
        bgColor: 'bg-juniper-100'
      }
    ]

    // Assertion
    expect(getFormattedIssuesAutofixedChartData(historicalValues)).toEqual<Array<Dataset>>(
      formattedIssuesAutofixedChartData
    )
  })

  test('`getFormattedComplianceChartData` method formats dataset for compliance chart correctly', () => {
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
      values: { count: [19, 18, 12, 11, 19, 8, 5, 3, 4, 8, 9, 9, 9] }
    } as unknown as HistoricalValues

    // Expected result
    const formattedComplianceChartData: Array<Dataset> = [
      {
        name: 'Active Issues',
        values: [19, 18, 12, 11, 19, 8, 5, 3, 4, 8, 9, 9, 9]
      }
    ]

    // Assertion
    expect(getFormattedComplianceChartData(historicalValues)).toEqual<Array<Dataset>>(
      formattedComplianceChartData
    )

    // Create historicalValues which will be incompatible with compliance report
    const historicalValuesWithoutCount = {
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
      values: { randomField: [19, 18, 12, 11, 19, 8, 5, 3, 4, 8, 9, 9, 9] }
    } as unknown as HistoricalValues

    // Assertion
    expect(getFormattedComplianceChartData(historicalValuesWithoutCount)).toEqual<Array<Dataset>>(
      []
    )
  })

  test('`getFormattedDistributionChartData` method formats dataset for distribution chart correctly', () => {
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
        analyzer: {
          docker: [3, 11, 1, 2, 8, 0, 10, 12, 9, 8, 14, 14, 14],
          python: [7, 0, 13, 10, 18, 17, 18, 3, 6, 16, 16, 16, 16],
          'test-coverage': [16, 3, 15, 15, 8, 16, 14, 9, 19, 3, 4, 4, 4]
        },
        category: {
          antipattern: [18, 4, 18, 14, 19, 12, 18, 10, 1, 1, 9, 9, 9],
          'bug-risk': [12, 9, 4, 0, 2, 11, 17, 18, 8, 18, 4, 4, 4],
          coverage: [6, 0, 6, 10, 17, 2, 5, 9, 4, 1, 7, 7, 7],
          doc: [16, 12, 4, 1, 2, 5, 9, 5, 0, 1, 12, 12, 12],
          performance: [6, 9, 3, 19, 15, 2, 13, 5, 0, 8, 13, 13, 13],
          security: [13, 14, 12, 17, 12, 7, 11, 18, 4, 4, 15, 15, 15],
          style: [12, 18, 14, 0, 6, 3, 11, 7, 13, 11, 17, 17, 17],
          typecheck: [0, 18, 9, 15, 5, 11, 17, 4, 6, 17, 19, 19, 19]
        }
      }
    } as unknown as HistoricalValues

    const categoryValues = historicalValues.values.category as Record<string, number[]>
    const analyzerValues = historicalValues.values.analyzer as Record<string, number[]>

    // Expected result
    const formattedCategoryDistributionChartData: Array<Dataset> = [
      {
        name: 'typecheck',
        chartType: 'bar',
        values: [0, 18, 9, 15, 5, 11, 17, 4, 6, 17, 19, 19, 19],
        bgColor: 'bg-robin-600'
      },
      {
        name: 'security',
        chartType: 'bar',
        values: [13, 14, 12, 17, 12, 7, 11, 18, 4, 4, 15, 15, 15],
        bgColor: 'bg-robin-500'
      },
      {
        name: 'style',
        chartType: 'bar',
        values: [12, 18, 14, 0, 6, 3, 11, 7, 13, 11, 17, 17, 17],
        bgColor: 'bg-robin-400'
      },
      {
        name: 'others',
        chartType: 'bar',
        values: [58, 34, 35, 44, 55, 32, 62, 47, 13, 29, 45, 45, 45],
        bgColor: 'bg-robin-200'
      }
    ]

    const categoryOthersDatasetNames: Array<string> = [
      'antipattern',
      'bug-risk',
      'coverage',
      'doc',
      'performance'
    ]

    const formattedAnalyzerDistributionChartData: Array<Dataset> = [
      {
        name: 'python',
        chartType: 'bar',
        values: [7, 0, 13, 10, 18, 17, 18, 3, 6, 16, 16, 16, 16],
        bgColor: 'bg-robin-600'
      },
      {
        name: 'test-coverage',
        chartType: 'bar',
        values: [16, 3, 15, 15, 8, 16, 14, 9, 19, 3, 4, 4, 4],
        bgColor: 'bg-robin-500'
      },
      {
        name: 'docker',
        chartType: 'bar',
        values: [3, 11, 1, 2, 8, 0, 10, 12, 9, 8, 14, 14, 14],
        bgColor: 'bg-robin-400'
      }
    ]

    const analyzerOthersDatasetNames: Array<string> = []

    // Test for analyzer dataset
    expect(getFormattedDistributionChartData(analyzerValues, ReportPageT.DISTRIBUTION)).toEqual<
      [Array<Dataset>, Array<string>]
    >([formattedAnalyzerDistributionChartData, analyzerOthersDatasetNames])

    // Test for category dataset
    expect(getFormattedDistributionChartData(categoryValues, ReportPageT.DISTRIBUTION)).toEqual<
      [Array<Dataset>, Array<string>]
    >([formattedCategoryDistributionChartData, categoryOthersDatasetNames])
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
