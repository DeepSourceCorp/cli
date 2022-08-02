import { render } from '@testing-library/vue'
import MetaDataItem from '~/components/History/Runs/MetaDataItem.vue'

test('renders MetaDataItem with all prop options', () => {
  const props = {
    icon: 'antipattern',
    label: 'Antipattern'
  }

  const { html } = render(MetaDataItem, {
    props,
    stubs: {
      ZIcon: true
    }
  })

  expect(html()).toMatchSnapshot(JSON.stringify(props))
})
