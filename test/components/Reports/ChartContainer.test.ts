import { render } from '@testing-library/vue'

import { ChartContainer } from '~/components/Reports'
import { cartesian, generateBooleanProps } from '~/test/utils'

describe('[[ ChartContainer ]]', () => {
  test('renders chart container with all prop options', () => {
    const chartPresentOptions = generateBooleanProps('chartPresent', false)
    const isWidgetOptions = generateBooleanProps('isWidget', false)

    cartesian(chartPresentOptions, isWidgetOptions).forEach((propsData) => {
      const { html } = render(ChartContainer, {
        propsData,
        slots: {
          'report-header': '<h2>Report header</h2>',
          'report-stats': '<p>Report stats</p>',
          'report-controls': '<p>Report controls</p>'
        }
      })

      expect(html()).toMatchSnapshot(JSON.stringify(propsData))
    })
  })
})
