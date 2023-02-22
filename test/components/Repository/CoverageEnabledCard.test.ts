import { render } from '@testing-library/vue'
import { CoverageEnabledCard } from '~/components/Repository'
import { cartesian, generateBooleanProps } from '~/test/utils'

test('renders CoverageEnabledCard with all prop options', () => {
  const hasTestCoverageOpts = generateBooleanProps('hasTestCoverage')
  const loadingOpts = generateBooleanProps('loading')

  cartesian(hasTestCoverageOpts, loadingOpts).forEach((propCombination) => {
    const { html } = render(CoverageEnabledCard, {
      props: propCombination
    })

    expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
  })
})
