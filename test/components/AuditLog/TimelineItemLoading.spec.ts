import { render } from '@testing-library/vue'

import TimelineItemLoading from '~/components/AuditLog/TimelineItemLoading.vue'

describe('[[ TimelineItemLoading ]]', () => {
  it('renders the timeline item loading state', () => {
    const { html } = render(TimelineItemLoading)

    expect(html()).toMatchSnapshot()
  })
})
