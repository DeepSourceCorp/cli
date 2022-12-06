import { render } from '@testing-library/vue'
import VTooltip from 'floating-vue'

import { ChartStat } from '~/components/Reports'
import { cartesian, generateBooleanProps } from '~/test/utils'

test('renders ComplianceStats with all prop options', () => {
  const baseProps = {
    title: 'Active Issues',
    value: 12
  }

  const loadingOptions = generateBooleanProps('loading', false)

  cartesian(loadingOptions).forEach((propCombination) => {
    const propsData = { ...baseProps, ...propCombination }
    const { html } = render(
      ChartStat,
      {
        propsData
      },
      (vue) => {
        vue.use(VTooltip)
      }
    )

    expect(html()).toMatchSnapshot(JSON.stringify(propsData))
  })
})
