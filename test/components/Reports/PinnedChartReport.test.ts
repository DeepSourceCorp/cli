import { render } from '@testing-library/vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import VTooltip from 'floating-vue'

import { ChartContainer } from '~/components/Reports'
import PinnedChartReport from '~/components/Reports/PinnedChartReport.vue'
import {
  cartesian,
  generateBooleanProps,
  generateGenericProps,
  generateStringProps
} from '~/test/utils'
import { LoadingConditions } from '~/types/reportTypes'
import { ReportLevel } from '~/types/types'

interface IPinnedChartReport extends Vue {
  // Data properties
  dateRangeFilter: string
  revealReportControls: boolean
  timeoutId: ReturnType<typeof setTimeout>

  // Methods
  hideReportControls: () => void
  showReportControls: () => void
  updateDateRangeHandler: (newDateRange: string) => void
}

describe('[[ PinnedChartReport ]]', () => {
  beforeEach(() => {
    // Set spies
    jest.spyOn(global, 'clearTimeout')
    jest.spyOn(global, 'setTimeout')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const complianceChartProps = {
    allowPinningReports: true,
    compliancePassing: false,
    datasets: [{ name: 'Active Issues', values: [1, 2, 4, 12, 19, 19, 14, 4, 4, 7, 3, 3, 3, 3] }],
    historicalValues: {
      labels: [
        '2022-07-25',
        '2022-08-01',
        '2022-08-08',
        '2022-08-15',
        '2022-08-22',
        '2022-08-29',
        '2022-09-05',
        '2022-09-12',
        '2022-09-19',
        '2022-09-26',
        '2022-10-03',
        '2022-10-10',
        '2022-10-17',
        '2022-10-24'
      ],
      values: { count: [1, 2, 4, 12, 19, 19, 14, 4, 4, 7, 3, 3, 3, 3] }
    },
    loadingValue: { condition: null, status: false },
    label: 'SANS Top 25',
    metadata: null,
    owner: 'deepsourcelabs',
    pinnedReports: [
      { key: 'sans-top-25', metadata: null },
      { key: 'issue-distribution', metadata: { filter: 'issue-distribution-analyzer' } },
      { key: 'code-coverage', metadata: null },
      { key: 'owasp-top-10', metadata: null }
    ],
    provider: 'gh',
    reportKey: 'sans-top-25',
    reportSlot: 0,
    value: 1,
    valueLabel: 'ACTIVE ISSUES'
  }

  const mocks = {
    $cookies: {
      get: jest.fn()
    },
    $emit: jest.fn(),
    $generateRoute: jest.fn()
  }

  const stubs = {
    DateRangePicker: true,
    ChartContainer, // Use original `ChartContainer` component being the container
    ChartStat: true,
    ComplianceStatus: true,
    LazyEmptyChart: true,
    PinnableReportsList: true,
    ReportChartLegend: true,
    ZButton: true,
    ZChart: true,
    ZIcon: true,
    ZTag: true
  }

  // Returns a Wrapper that contains the rendered Vue component
  const getInstance = (props = {}) => {
    const localVue = createLocalVue()
    localVue.use(VTooltip)

    const { vm } = shallowMount(PinnedChartReport, {
      mocks,
      propsData: { ...complianceChartProps, level: ReportLevel.Owner, ...props },
      stubs,
      localVue
    })

    return vm as IPinnedChartReport
  }

  // Helper to generate `loadingValue` prop combination
  const getLoadingValueOptions = () => {
    const propCombination = generateGenericProps(
      'loadingValue',
      [
        { condition: null, status: false },
        { condition: LoadingConditions.REPORT_SWAP, status: true }
      ],
      false
    )

    return propCombination
  }

  test('renders a compliance based pinned report widget', () => {
    const allowPinningReportsOptions = generateBooleanProps('allowPinningReports', false)
    const compliancePassingOptions = generateBooleanProps('compliancePassing', false)
    const levelOptions = generateStringProps('level', [ReportLevel.Owner, ReportLevel.Repository])

    const loadingValueOptions = getLoadingValueOptions()

    cartesian(
      allowPinningReportsOptions,
      compliancePassingOptions,
      levelOptions,
      loadingValueOptions
    ).forEach((propCombination) => {
      const { html } = render(
        PinnedChartReport,
        {
          mocks,
          propsData: { ...complianceChartProps, ...propCombination },
          stubs
        },
        (vue) => {
          vue.use(VTooltip)
        }
      )

      expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
    })
  })

  test('renders a distribution based pinned report widget', () => {
    const allowPinningReportsOptions = generateBooleanProps('allowPinningReports', false)
    const compliancePassingOptions = generateBooleanProps('compliancePassing', false)
    const levelOptions = generateStringProps('level', [ReportLevel.Owner, ReportLevel.Repository])
    const loadingValueOptions = getLoadingValueOptions()

    const distributionChartProps = {
      allowPinningReports: true,
      datasets: [
        {
          name: 'docker',
          chartType: 'bar',
          values: [12, 16, 1, 0, 4, 14, 1, 5, 2, 12, 14, 14, 14, 14]
        },
        {
          name: 'python',
          chartType: 'bar',
          values: [3, 5, 11, 16, 3, 13, 8, 5, 19, 2, 16, 16, 16, 16]
        },
        {
          name: 'test-coverage',
          chartType: 'bar',
          values: [9, 6, 8, 2, 11, 5, 15, 12, 2, 5, 4, 4, 4, 4]
        }
      ],
      historicalValues: {
        labels: [
          '2022-07-25',
          '2022-08-01',
          '2022-08-08',
          '2022-08-15',
          '2022-08-22',
          '2022-08-29',
          '2022-09-05',
          '2022-09-12',
          '2022-09-19',
          '2022-09-26',
          '2022-10-03',
          '2022-10-10',
          '2022-10-17',
          '2022-10-24'
        ],
        values: {
          analyzer: {
            docker: [12, 16, 1, 0, 4, 14, 1, 5, 2, 12, 14, 14, 14, 14],
            python: [3, 5, 11, 16, 3, 13, 8, 5, 19, 2, 16, 16, 16, 16],
            'test-coverage': [9, 6, 8, 2, 11, 5, 15, 12, 2, 5, 4, 4, 4, 4]
          },
          category: {
            antipattern: [10, 13, 9, 13, 0, 17, 10, 18, 3, 5, 9, 9, 9, 9],
            'bug-risk': [18, 4, 13, 1, 10, 3, 4, 19, 1, 6, 4, 4, 4, 4],
            coverage: [9, 0, 10, 2, 3, 14, 5, 12, 11, 19, 7, 7, 7, 7],
            doc: [5, 11, 18, 17, 8, 1, 5, 19, 13, 0, 12, 12, 12, 12],
            performance: [5, 18, 3, 16, 4, 6, 18, 17, 17, 10, 13, 13, 13, 13],
            security: [18, 1, 1, 18, 1, 3, 18, 17, 5, 13, 15, 15, 15, 15],
            style: [7, 9, 9, 7, 11, 8, 3, 14, 0, 0, 17, 17, 17, 17],
            typecheck: [4, 18, 4, 5, 18, 16, 3, 17, 2, 10, 19, 19, 19, 19]
          }
        }
      },
      reportKey: 'issue-distribution',
      label: 'Issue Distribution',
      metadata: { filter: 'issue-distribution-analyzer', text: 'BY ANALYZER' },
      owner: 'deepsourcelabs',
      pinnedReports: [
        { key: 'sans-top-25', metadata: null },
        { key: 'issue-distribution', metadata: { filter: 'issue-distribution-analyzer' } },
        { key: 'code-coverage', metadata: null },
        { key: 'owasp-top-10', metadata: null }
      ],
      provider: 'gh',
      reportSlot: 1,
      value: 93,
      valueLabel: 'ACTIVE ISSUES'
    }

    cartesian(
      allowPinningReportsOptions,
      compliancePassingOptions,
      levelOptions,
      loadingValueOptions
    ).forEach((propCombination) => {
      const { html } = render(
        PinnedChartReport,
        {
          mocks,
          propsData: { ...distributionChartProps, ...propCombination },
          stubs
        },
        (vue) => {
          vue.use(VTooltip)
        }
      )

      expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
    })
  })

  test('`showReportControls` method sets `revealReportControls` data property to `true` after clearing the timer', () => {
    const instance = getInstance({ revealReportControls: true })

    // Invoke the `hideReportControls` method to initialize the timer
    instance.hideReportControls()

    instance.showReportControls()

    // Assertions
    expect(clearTimeout).toBeCalled()
    expect(instance.revealReportControls).toBe(true)
  })

  test('`showReportControls` method sets `revealReportControls` data property to `true` with no timer in scope', () => {
    const instance = getInstance()

    // Invoke the `showReportControls` method
    instance.showReportControls()

    // Assertions
    expect(clearTimeout).not.toBeCalled()
    expect(instance.revealReportControls).toBe(true)
  })

  test('`hideReportControls` method sets `revealReportControls` data property to `false` after `1s`', () => {
    // Replaces the original implementation of `setTimeout()` and other timer functions
    jest.useFakeTimers()

    const instance = getInstance()

    // Invoke the `showReportControls` method since `hideReportControls` depends on it
    instance.showReportControls()

    instance.hideReportControls()

    expect(setTimeout).toBeCalled()

    // Fast-forward until all timers have been executed
    jest.runAllTimers()

    expect(instance.revealReportControls).toBe(false)
  })

  test('`updateDateRangeHandler` method emits an event by the name `update-report-controls` supplying the report slot and the new date range', () => {
    const instance = getInstance()

    const newDateRange = '12m'

    // Invoke the `updateDateRangeHandler` method
    instance.updateDateRangeHandler(newDateRange)

    // Assertions
    expect(mocks.$emit).toBeCalledWith(
      'update-report-controls',
      complianceChartProps.reportSlot,
      newDateRange
    )
  })
})
