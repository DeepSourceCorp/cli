import { render } from '@testing-library/vue'
import { PublicReportPageWrapper } from '~/components/Reports'
import { cartesian, generateStringProps } from '~/test/utils'
import { ReportPageT } from '~/types/reportTypes'
import { ReportLevel } from '~/types/types'

test('renders PublicReportPageWrapper with all prop options', () => {
  const baseProps = {
    createdAt: 'Jul 25, 2022',
    ownerLogin: 'deepsourcelabs',
    repositoryList: [{ id: 'UmVwb3NpdG9yeTp6dmp2eXo=', name: 'asgard', isPrivate: true }]
  }

  const reportKeyOptions = generateStringProps(
    'reportKey',
    [ReportPageT.OWASP_TOP_10, ReportPageT.SANS_TOP_25, ReportPageT.DISTRIBUTION],
    false
  )

  const levelOptions = generateStringProps(
    'level',
    [ReportLevel.Owner, ReportLevel.Repository, ReportLevel.Enterprise],
    false
  )

  cartesian(reportKeyOptions, levelOptions).forEach((propCombination) => {
    const props = {
      ...baseProps,
      ...propCombination
    }

    const { html } = render(PublicReportPageWrapper, {
      props,
      stubs: {
        ZIcon: true,
        ZButton: true,
        ZMenuSection: true,
        ZMenuItem: true
      }
    })

    expect(html()).toMatchSnapshot(JSON.stringify(props))
  })
})
