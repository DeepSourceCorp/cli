import { render } from '@testing-library/vue'
import { OccurrenceTags } from '~/components/Reports'
import VTooltip from 'floating-vue'

test('renders OccurrenceTags with all prop options', () => {
  const props = {
    high: 1,
    medium: 2,
    low: 3,
    total: 6
  }

  const { html } = render(
    OccurrenceTags,
    {
      props,
      stubs: {
        ZTag: true
      }
    },
    (vue) => {
      vue.use(VTooltip)
    }
  )

  expect(html()).toMatchSnapshot(JSON.stringify(props))
})
