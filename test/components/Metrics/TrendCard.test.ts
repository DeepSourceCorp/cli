import { render } from '@testing-library/vue'
import { TrendCard } from '~/components/Metrics'
import { cartesian, generateBooleanProps, generateStringProps } from '~/test/utils'

test('renders TrendCard with all props', () => {
  const baseProps = {
    icon: 'python',
    title: 'Hello World'
  }

  const showBorderOptions = generateBooleanProps('showBorder')
  const roundedCornersOptions = generateBooleanProps('roundedCorners')
  const showAccentOptions = generateBooleanProps('showAccent')
  const colorOptions = generateStringProps('color', ['cherry'])

  cartesian(showBorderOptions, roundedCornersOptions, showAccentOptions, colorOptions).forEach(
    (propCombination) => {
      const props = {
        ...baseProps,
        ...propCombination
      }

      const { html } = render(TrendCard, { props })
      expect(html()).toMatchSnapshot(JSON.stringify(props))
    }
  )
})
