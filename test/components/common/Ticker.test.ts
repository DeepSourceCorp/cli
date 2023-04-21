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
  trendPositive: true,
  showBg: false,
  isPercent: false,
  trendHint: 'since last commit',
  trendDirection: 'up',
  icon: 'triangle-up',
  trendValue: 275
}

describe('[[ Ticker ]]', () => {
  test('renders `Ticker` with all props', () => {
    const trendPositiveOptions = generateBooleanProps('trendPositive')
    const showBgOptions = generateBooleanProps('showBg')

    const trendDirectionOptions = generateStringProps('trendDirection', ['up', 'down'])
    const iconOptions = generateStringProps('icon', ['triangle-up', 'triangle-down'])

    cartesian(trendPositiveOptions, showBgOptions, trendDirectionOptions, iconOptions).forEach(
      (propCombination) => {
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
      }
    )
  })

  test('renders `Ticker` with different value options', () => {
    const isPercentOptions = generateBooleanProps('isPercent')

    const trendValueOptions = generateGenericProps('trendValue', ['275', 275, 0])

    cartesian(isPercentOptions, trendValueOptions).forEach((propCombination) => {
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
