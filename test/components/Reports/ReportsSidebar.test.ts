import { render } from '@testing-library/vue'
import { RouterLinkStub, shallowMount } from '@vue/test-utils'

import { ReportsSidebar } from '~/components/Reports'
import { mocksGenerator } from '~/test/mocks'

import { cartesian, generateBooleanProps, generateGenericProps } from '~/test/utils'
import { ReportPageT } from '~/types/reportTypes'
import { ReportLevel } from '~/types/types'

interface ReportsSidebarT extends Vue {
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

    cartesian(levelOptions, showPublicReportsOptions).forEach((propCombination) => {
      const { html } = render(ReportsSidebar, {
        props: {
          ...propCombination
        },
        stubs,
        mocks: mocksGenerator()
      })

      expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
    })
  })
})
