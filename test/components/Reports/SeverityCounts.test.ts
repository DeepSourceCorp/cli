import { render } from '@testing-library/vue'
import { SeverityCounts } from '~/components/Reports'

test('renders SeverityCounts with all prop options', () => {
  const props = {
    high: 1,
    low: 2,
    medium: 0
  }

  const { html } = render(SeverityCounts, {
    props,
    stubs: {
      ZIcon: true
    }
  })

  expect(html()).toMatchSnapshot(JSON.stringify(props))
})
