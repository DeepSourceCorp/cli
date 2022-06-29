import { render } from '@testing-library/vue'
import { ChartStat } from '~/components/Reports'

test('renders ComplianceStats with all prop options', () => {
  const props = {
    title: 'Active Issues',
    value: 12
  }

  const { html } = render(ChartStat, {
    props
  })

  expect(html()).toMatchSnapshot(JSON.stringify(props))
})
