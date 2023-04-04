import { render } from '@testing-library/vue'

import TimelineV2 from '~/components/Common/TimelineV2.vue'

describe('[[ TimelineV2 ]]', () => {
  const stubs = {
    TimelineItemV2: true
  }

  const generateTimelineItems = (length = 5) => {
    return Array.from({ length })
      .map((_, idx) => {
        return `<timeline-item-v2>Timeline item ${idx + 1}</timeline-item-v2>`
      })
      .join('')
  }

  it('renders a list of timeline items', () => {
    const { html } = render(TimelineV2, {
      slots: {
        default: generateTimelineItems()
      },
      stubs
    })

    expect(html()).toMatchSnapshot()
  })
})
