import { render } from '@testing-library/vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import VTooltip from 'floating-vue'

import { ChartContainer } from '~/components/Reports'
import PinnedCodeCoverageReport from '~/components/Reports/PinnedCodeCoverageReport.vue'
import { cartesian, generateBooleanProps, generateGenericProps } from '~/test/utils'
import { CoverageSortT, LoadingConditions } from '~/types/reportTypes'

interface IPinnedCodeCoverageReport extends Vue {
  // Data properties
  revealReportControls: boolean
  selectedSortType: string
  timeoutId: ReturnType<typeof setTimeout>

  // Methods
  hideReportControls: () => void
  showReportControls: () => void
  updateSortTypeHandler: (newSortType: string) => void
}

describe('[[ PinnedCodeCoverageReport ]]', () => {
  beforeEach(() => {
    // Set spies
    jest.spyOn(global, 'clearTimeout')
    jest.spyOn(global, 'setTimeout')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const baseProps = {
    allowPinningReports: false,
    coverageList: [
      {
        id: 'UmVwb3NpdG9yeUNvdmVyYWdlUmVwb3J0SXRlbTp6bXhyeWI=',
        name: 'atlas',
        lcvValue: null,
        lcvIsPassing: null,
        bcvValue: null,
        bcvIsPassing: null
      },
      {
        id: 'UmVwb3NpdG9yeUNvdmVyYWdlUmVwb3J0SXRlbTp6Z2tlZHo=',
        name: 'beacon-py',
        lcvValue: null,
        lcvIsPassing: null,
        bcvValue: null,
        bcvIsPassing: null
      },
      {
        id: 'UmVwb3NpdG9yeUNvdmVyYWdlUmVwb3J0SXRlbTp6cXdwZ3o=',
        name: 'bob-cli',
        lcvValue: null,
        lcvIsPassing: null,
        bcvValue: null,
        bcvIsPassing: null
      },
      {
        id: 'UmVwb3NpdG9yeUNvdmVyYWdlUmVwb3J0SXRlbTp6d2phcGI=',
        name: 'demo-go',
        lcvValue: null,
        lcvIsPassing: null,
        bcvValue: null,
        bcvIsPassing: null
      },
      {
        id: 'UmVwb3NpdG9yeUNvdmVyYWdlUmVwb3J0SXRlbTp6ZXBqZWI=',
        name: 'demo-python',
        lcvValue: null,
        lcvIsPassing: null,
        bcvValue: null,
        bcvIsPassing: null
      },
      {
        id: 'UmVwb3NpdG9yeUNvdmVyYWdlUmVwb3J0SXRlbTpib3BtZXo=',
        name: 'git-label-packages',
        lcvValue: null,
        lcvIsPassing: null,
        bcvValue: null,
        bcvIsPassing: null
      },
      {
        id: 'UmVwb3NpdG9yeUNvdmVyYWdlUmVwb3J0SXRlbTp6Z2tsZHo=',
        name: 'marvin-javascript',
        lcvValue: null,
        lcvIsPassing: null,
        bcvValue: null,
        bcvIsPassing: null
      }
    ],
    label: 'Code Coverage',
    loadingValue: { condition: null, status: false },
    metadata: null,
    owner: 'deepsourcelabs',
    pinnedReports: [
      {
        key: 'sans-top-25',
        metadata: null
      },
      {
        key: 'issue-distribution',
        metadata: {
          filter: 'issue-distribution-analyzer'
        }
      },
      {
        key: 'code-coverage',
        metadata: null
      },
      {
        key: 'owasp-top-10',
        metadata: null
      }
    ],
    provider: 'gh',
    reportKey: 'code-coverage',
    reportSlot: 2
  }

  const mocks = {
    $cookies: {
      get: jest.fn()
    },
    $emit: jest.fn(),
    $generateRoute: jest.fn()
  }

  const stubs = {
    ChartContainer, // Use original `ChartContainer` component being the container
    CodeCoverageTable: true,
    CodeCoverageTableLoading: true,
    PinnableReportsList: true,
    ZButton: true,
    ZIcon: true
  }

  // Returns a Wrapper that contains the rendered Vue component
  const getInstance = (props = {}) => {
    const localVue = createLocalVue()
    localVue.use(VTooltip)

    const { vm } = shallowMount(PinnedCodeCoverageReport, {
      mocks,
      propsData: { ...baseProps, ...props },
      stubs,
      localVue
    })

    return vm as IPinnedCodeCoverageReport
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

  test('renders the code coverage pinned report widget', () => {
    const allowPinningReportsOptions = generateBooleanProps('allowPinningReports', false)
    const loadingValueOptions = getLoadingValueOptions()

    cartesian(allowPinningReportsOptions, loadingValueOptions).forEach((propCombination) => {
      const { html } = render(
        PinnedCodeCoverageReport,
        {
          mocks,
          propsData: { ...baseProps, ...propCombination },
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

  test('`updateSortTypeHandler` method emits an event by the name `update-report-controls` supplying the report slot and the new sort type', () => {
    const instance = getInstance()

    const newSortType = CoverageSortT.LCV_ASCENDING

    // Invoke the `updateSortTypeHandler` method
    instance.updateSortTypeHandler(newSortType)

    // Assertions
    expect(mocks.$emit).toBeCalledWith('update-report-controls', baseProps.reportSlot, newSortType)
  })
})
