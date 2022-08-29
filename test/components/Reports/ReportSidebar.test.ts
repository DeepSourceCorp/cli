import { render } from '@testing-library/vue'
import { RouterLinkStub } from '@vue/test-utils'

import { ReportsSidebar } from '~/components/Reports'
import { mocksGenerator } from '~/test/mocks'

import { cartesian, generateBooleanProps, generateGenericProps } from '~/test/utils'
import { ReportLevel } from '~/types/types'

test('renders PublicReportCard with all prop options', () => {
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
      stubs: {
        ZIcon: true,
        ZTab: true,
        ZDivider: true,
        NuxtLink: RouterLinkStub
      },
      mocks: mocksGenerator()
    })

    expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
  })
})
