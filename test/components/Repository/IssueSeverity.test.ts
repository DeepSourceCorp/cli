import { render } from '@testing-library/vue'
import { IssueSeverityTag } from '~/components/Repository'
import { cartesian, generateStringProps } from '~/test/utils'
import { IssueSeverity } from '~/types/types'
import VTooltip from 'v-tooltip'

test('renders IssueSeverityTag with all prop options', () => {
  const severityOpts = generateStringProps(
    'severity',
    [IssueSeverity.Critical, IssueSeverity.Major, IssueSeverity.Minor],
    false
  )

  cartesian(severityOpts).forEach((propCombination) => {
    const { html } = render(
      IssueSeverityTag,
      {
        props: propCombination
      },
      (vue) => {
        vue.use(VTooltip)
      }
    )

    expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
  })
})
