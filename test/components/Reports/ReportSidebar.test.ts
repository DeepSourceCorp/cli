import { render } from '@testing-library/vue'
import { RouterLinkStub, shallowMount } from '@vue/test-utils'

import { ReportsSidebar } from '~/components/Reports'
import { mocksGenerator } from '~/test/mocks'

import { cartesian, generateBooleanProps, generateGenericProps } from '~/test/utils'
import { ReportPageT } from '~/types/reportTypes'
import { ReportLevel } from '~/types/types'

interface ReportsSidebarT extends Vue {
  hiddenReports: Array<ReportPageT>

  showReport: (reportKey: ReportPageT) => boolean
}

describe('[[ ReportsSidebar ]]', () => {
  const stubs = {
    ZIcon: true,
    ZTab: true,
    ZDivider: true,
    NuxtLink: RouterLinkStub
  }
  test('renders ReportsSidebar with all prop options', () => {
    const levelOptions = generateGenericProps(
      'level',
      [ReportLevel.Owner, ReportLevel.Repository, ReportLevel.Enterprise],
      false
    )

    const showPublicReportsOptions = generateBooleanProps('showPublicReports', false)

    const hiddenReportsOptions = generateGenericProps('showPublicReports', [
      [ReportPageT.CODE_COVERAGE, ReportPageT.OWASP_TOP_10],
      [ReportPageT.CODE_COVERAGE]
    ])

    cartesian(levelOptions, showPublicReportsOptions, hiddenReportsOptions).forEach(
      (propCombination) => {
        const { html } = render(ReportsSidebar, {
          props: {
            ...propCombination
          },
          stubs,
          mocks: mocksGenerator()
        })

        expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
      }
    )
  })

  test('ReportsSidebar showReport method when hidden reports is empty', () => {
    const wrapper = shallowMount(ReportsSidebar, {
      propsData: {
        level: ReportLevel.Repository,
        hiddenReports: [],
        showPublicReports: false
      },
      stubs: {
        ZIcon: true,
        ZTab: true,
        ZDivider: true,
        NuxtLink: RouterLinkStub
      },
      mocks: mocksGenerator()
    })

    const vm = wrapper.vm as ReportsSidebarT

    expect(vm.showReport(ReportPageT.OWASP_TOP_10)).toBe(true)
    expect(vm.showReport(ReportPageT.SANS_TOP_25)).toBe(true)
    expect(vm.showReport(ReportPageT.DISTRIBUTION)).toBe(true)
    expect(vm.showReport(ReportPageT.CODE_COVERAGE)).toBe(true)
  })

  test('ReportsSidebar showReport method when code-coverage is hidden', () => {
    const wrapper = shallowMount(ReportsSidebar, {
      propsData: {
        level: ReportLevel.Repository,
        hiddenReports: [ReportPageT.CODE_COVERAGE],
        showPublicReports: false
      },
      stubs: {
        ZIcon: true,
        ZTab: true,
        ZDivider: true,
        NuxtLink: RouterLinkStub
      },
      mocks: mocksGenerator()
    })

    const vm = wrapper.vm as ReportsSidebarT

    expect(vm.showReport(ReportPageT.OWASP_TOP_10)).toBe(true)
    expect(vm.showReport(ReportPageT.SANS_TOP_25)).toBe(true)
    expect(vm.showReport(ReportPageT.DISTRIBUTION)).toBe(true)
    expect(vm.showReport(ReportPageT.CODE_COVERAGE)).toBe(false)
  })
})
