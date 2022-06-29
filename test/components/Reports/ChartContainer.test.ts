import { render } from '@testing-library/vue'
import { ChartContainer } from '~/components/Reports'

test('renders ChartContainer', () => {
  const { html } = render(ChartContainer)

  expect(html()).toMatchSnapshot()
})
