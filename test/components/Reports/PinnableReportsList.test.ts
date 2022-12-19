import { ZMenu } from '@deepsource/zeal'
import { render } from '@testing-library/vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import VTooltip from 'floating-vue'

import PinnableReportsList from '~/components/Reports/PinnableReportsList.vue'
import { IPinnableReportItem, ReportMetadataFilterT, ReportPageT } from '~/types/reportTypes'
import { ReportLevel } from '~/types/types'

interface IPinnableReportsList extends Vue {
  // Data properties
  collapsibleHeaderAnimations: Record<ReportPageT, string>

  // Computed properties
  complianceItems: Array<IPinnableReportItem>
  cookieIdentifier: string
  insightsItems: Array<IPinnableReportItem>

  // Methods
  closeMenu: () => void
  isCurrentlyPinnedReport: (reportItem: IPinnableReportItem) => boolean
  expandCurrentlySelectedCollapsible: () => void
  menuToggleHandler(isOpen: boolean): void
  updateCollapsibleMetadata(reportItem: IPinnableReportItem, isOpen: boolean): void
  updatePinnedReport: (reportItem: IPinnableReportItem) => void
}

describe('[[ PinnableReportsList ]]', () => {
  const baseProps = {
    currentSelection: 'issue-distribution-analyzer',
    level: ReportLevel.Owner,
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
    reportSlot: 1
  }

  const mocks = {
    $cookies: {
      remove: jest.fn()
    },
    $emit: jest.fn()
  }

  const stubs = {
    ZButton: true,
    ZIcon: true,
    ZMenu, // Use original `ZMenu` component being the container
    ZMenuSection: true,
    ZTag: true
  }

  // Returns a Wrapper that contains the rendered Vue component
  const getInstance = (props = {}) => {
    const localVue = createLocalVue()
    localVue.use(VTooltip)

    const { vm } = shallowMount(PinnableReportsList, {
      mocks,
      propsData: { ...baseProps, ...props },
      stubs,
      localVue
    })

    return vm as IPinnableReportsList
  }

  test('renders the list of pinnable reports as menu items', () => {
    const { html } = render(
      PinnableReportsList,
      {
        mocks,
        propsData: { ...baseProps },
        stubs
      },
      (vue) => {
        vue.use(VTooltip)
      }
    )

    expect(html()).toMatchSnapshot()
  })

  test('`cookieIdentifier` returns the appropriate format for distribution-based reports', () => {
    const instance = getInstance()

    const { owner, pinnedReports, provider, reportSlot } = baseProps

    // Grab the current report item
    const reportItem = pinnedReports[reportSlot]

    // Cookie identifier has the convention `provider_owner_reportType_date-range-filter_report-slot`
    // Distribution-based reports have `metadata` with the `filter` type
    expect(instance.cookieIdentifier).toBe(
      `${provider}_${owner}_${
        reportItem.metadata?.filter as ReportMetadataFilterT
      }_date-range-filter_${reportSlot}`
    )
  })

  test('`cookieIdentifier` returns the appropriate format for compliance-based reports', () => {
    // Specify the current selection as `owasp-top-10` report
    // It comes at slot `3` as part of `baseProps`
    const reportSlot = 3
    const instance = getInstance({ currentSelection: 'owasp-top-10', reportSlot })

    const { owner, pinnedReports, provider } = baseProps

    // Grab the current report item
    const reportItem = pinnedReports[reportSlot]

    // Cookie identifier has the convention `provider_owner_reportType_date-range-filter_report-slot`
    // Compliance-based reports has `metadata` specified as `null`
    expect(instance.cookieIdentifier).toBe(
      `${provider}_${owner}_${reportItem.key}_date-range-filter_${reportSlot}`
    )
  })

  test('`cookieIdentifier` returns the appropriate format for code-coverage report', () => {
    // `code-coverage` report comes at slot `2` as part of `baseProps`
    const reportSlot = 2
    const instance = getInstance({ currentSelection: 'code-coverage', reportSlot })

    const { owner, provider } = baseProps

    // For `code-coverage` report, it is `provider_owner_pinned-code-coverage_sort-type_report-slot`
    expect(instance.cookieIdentifier).toBe(
      `${provider}_${owner}_pinned-code-coverage-sort-type_${reportSlot}`
    )
  })

  test('`isCurrentlyPinnedReport` method returns the status regarding the current match on supplying a distribution-based report', () => {
    const instance = getInstance()

    const reportKey = ReportPageT.DISTRIBUTION

    // Find the entry corresponding to `issue-distribution` from `insightsItem`
    const reportItem = instance.insightsItems.find(
      ({ key }) => key === reportKey
    ) as IPinnableReportItem

    const pinnedStatus = instance.isCurrentlyPinnedReport(reportItem)
    expect(pinnedStatus).toBe(true)
  })

  test('`isCurrentlyPinnedReport` method returns the status regarding the current match on supplying a compliance-based report', () => {
    // Specify the current selection as `owasp-top-10` report
    // It comes at slot `3` as part of `baseProps`
    const instance = getInstance({ currentSelection: 'owasp-top-10', reportSlot: 3 })

    const reportKey = ReportPageT.OWASP_TOP_10

    // Find the entry corresponding to `owasp-top-10` from `complianceItem`
    const reportItem = instance.complianceItems.find(
      ({ key }) => key === reportKey
    ) as IPinnableReportItem

    const pinnedStatus = instance.isCurrentlyPinnedReport(reportItem)
    expect(pinnedStatus).toBe(true)
  })

  test('`menuToggleHandler` method returns early if the menu is getting closed', () => {
    const instance = getInstance()

    // Set spy
    instance.expandCurrentlySelectedCollapsible = jest.fn()

    // Invoke the `menuToggleHandler` method supplying `isOpen` as `false`
    instance.menuToggleHandler(false)

    // Assertion
    expect(instance.expandCurrentlySelectedCollapsible).not.toBeCalled()
  })

  test('`menuToggleHandler` method resets chevron animations and expands the currently selected collapsible', () => {
    const instance = getInstance()

    // Set spy
    instance.expandCurrentlySelectedCollapsible = jest.fn()

    // Initial value for `collapsibleHeaderAnimations`
    const initialCollapsibleHeaderAnimations = {
      [ReportPageT.DISTRIBUTION]: '',
      [ReportPageT.ISSUES_PREVENTED]: ''
    }

    // Invoke the `menuToggleHandler` method supplying `isOpen` as `true`
    instance.menuToggleHandler(true)

    // Assertions
    expect(instance.collapsibleHeaderAnimations).toEqual(initialCollapsibleHeaderAnimations)
    expect(instance.expandCurrentlySelectedCollapsible).toBeCalled()
  })

  test('`updatePinnedReport` method returns early if the report item supplied matches current selection', () => {
    // `currentSelection` defaults to `issue-distribution-analyzer`
    const instance = getInstance()

    // Set spy
    instance.closeMenu = jest.fn()

    const reportKey = ReportPageT.DISTRIBUTION

    // Find the entry corresponding to `issue-distribution` from `insightsItem`
    const reportItem = instance.insightsItems.find(
      ({ key }) => key === reportKey
    ) as IPinnableReportItem

    // Invoke the `updatePinnedReport` method
    instance.updatePinnedReport({
      ...reportItem,
      metadata: reportItem.metadataItems?.[0] // `By Analyzer`
    } as IPinnableReportItem)

    // Assertions
    expect(instance.closeMenu).toBeCalled()
    expect(mocks.$cookies.remove).not.toBeCalled()
    expect(mocks.$emit).not.toBeCalled()
  })

  test('`updatePinnedReport` emits an event by the name `update-pinned-reports` supplying the updated `pinnedReports` array', () => {
    // `currentSelection` defaults to `issue-distribution-analyzer`
    const instance = getInstance()

    // Set spy
    instance.closeMenu = jest.fn()

    const newReportKey = ReportPageT.DISTRIBUTION
    const oldReportKey = ReportPageT.OWASP_TOP_10

    // Find the entry corresponding to `issue-distribution` from `insightsItem`
    const oldReportItem = instance.insightsItems.find(
      ({ key }) => key === newReportKey
    ) as IPinnableReportItem

    // Find the entry corresponding to `owasp-top-10` from `complianceItem`
    const newReportItem = instance.complianceItems.find(
      ({ key }) => key === oldReportKey
    ) as IPinnableReportItem

    // Invoke the `updatePinnedReport` method
    instance.updatePinnedReport(newReportItem)

    // Assert for the `closeMenu` method invocation
    expect(instance.closeMenu).toBeCalled()

    const { owner, provider, reportSlot } = baseProps

    expect(mocks.$cookies.remove).toBeCalledWith(
      `${provider}_${owner}_${
        oldReportItem.metadataItems?.[0]?.filter as ReportMetadataFilterT
      }_date-range-filter_${reportSlot}` // `By Analyzer`
    )

    const { key, metadata } = newReportItem

    const newPinnedReports = [...baseProps.pinnedReports]
    newPinnedReports[reportSlot] = { key, metadata }
    expect(mocks.$emit).toBeCalledWith(
      'update-pinned-reports',
      newPinnedReports,
      baseProps.reportSlot
    )
  })
})
