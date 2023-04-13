import { render } from '@testing-library/vue'

import TimelineItemV2Loading from '~/components/AuditLog/TimelineItemV2Loading.vue'

describe('[[ TimelineItemV2Loading ]]', () => {
  it('renders the timeline item loading state', () => {
    const { html } = render(TimelineItemV2Loading)

    expect(html()).toMatchSnapshot()
  })
})
