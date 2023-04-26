import { render } from '@testing-library/vue'

import EmptyStateCard from '~/components/Common/EmptyStateCard.vue'

describe('[[ EmptyStateCard ]]', () => {
  const propsData = {
    subtitle: 'Test subtitle',
    title: 'Test title'
  }

  const stubs = {
    EmptyStatePicture: true
  }

  test('renders the empty state card pattern', () => {
    const { html } = render(EmptyStateCard, { propsData, stubs })
    expect(html()).toMatchSnapshot()
  })

  test('renders empty state card pattern with content supplied via slots', () => {
    const { html } = render(EmptyStateCard, {
      slots: propsData,
      stubs
    })

    expect(html()).toMatchSnapshot()
  })
})
