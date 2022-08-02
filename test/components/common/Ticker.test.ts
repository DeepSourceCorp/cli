import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'

import Ticker from '~/components/Common/Ticker.vue'
import {
  cartesian,
  generateBooleanProps,
  generateGenericProps,
  generateStringProps
} from '~/test/utils'

const baseProps = {
  trendHint: 'since last commit'
}

describe('[[ Ticker ]]', () => {
  test('renders `Ticker` with all props', () => {
    const trendPositiveOptions = generateBooleanProps('trendPositive')
    const isPercentOptions = generateBooleanProps('isPercent')
    const showBgOptions = generateBooleanProps('showBg')

    const trendDirectionOptions = generateStringProps('trendDirection', ['up', 'down'])
    const iconOptions = generateStringProps('icon', ['triangle-up', 'triangle-down'])

    const trendValueOptions = generateGenericProps('trendValue', ['275', 275, 0])

    cartesian(
      trendPositiveOptions,
      isPercentOptions,
      showBgOptions,
      trendDirectionOptions,
      iconOptions,
      trendValueOptions
    ).forEach((propCombination) => {
      const props = {
        ...baseProps,
        ...propCombination
      }

      const { html } = render(Ticker, {
        props,
        stubs: {
          ZIcon: true
        }
      })
      expect(html()).toMatchSnapshot(JSON.stringify(props))
    })
  })
})
