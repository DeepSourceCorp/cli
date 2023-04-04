import { render } from '@testing-library/vue'

import TimelineItemV2 from '~/components/Common/TimelineItemV2.vue'
import { cartesian, generateStringProps } from '~/test/utils'

describe('[[ TimelineItemV2 ]]', () => {
  it('renders a timeline item with different list style types', () => {
    const listStyleOptions = generateStringProps('listStyleType', ['circle', 'disc'], false)

    cartesian(listStyleOptions).forEach((propsData, idx) => {
      const { html } = render(TimelineItemV2, {
        propsData,
        slots: {
          default: `Timeline item ${idx + 1}`
        }
      })

      expect(html()).toMatchSnapshot(JSON.stringify(propsData))
    })
  })
})
