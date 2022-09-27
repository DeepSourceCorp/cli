import { render } from '@testing-library/vue'
import { ComplianceStatus } from '~/components/Reports'
import { cartesian, generateBooleanProps } from '~/test/utils'

test('renders ComplianceStatus with all prop options', () => {
  const compliancePassedOptions = generateBooleanProps('compliancePassed')

  cartesian(compliancePassedOptions).forEach((propCombination) => {
    const { html } = render(ComplianceStatus, {
      props: propCombination
    })

    expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
  })
})
