import { render } from '@testing-library/vue'
import { PriorityTypeBadge } from '~/components/IssuePriority'
import { cartesian, generateStringProps } from '~/test/utils'
import VTooltip from 'v-tooltip'

test('renders PriorityTypeBadge with all prop options', () => {
  const priorityOptions = generateStringProps('priority', ['high', 'medium', 'low', 'noop'], false)

  cartesian(priorityOptions).forEach((propCombination) => {
    const props = {
      ...propCombination
    }

    const { html } = render(
      PriorityTypeBadge,
      {
        props,
        stubs: {
          ZIcon: true,
          ZButton: true,
          ZMenuSection: true,
          ZMenuItem: true
        }
      },
      (vue) => {
        vue.use(VTooltip)
      }
    )

    expect(html()).toMatchSnapshot(JSON.stringify(props))
  })
})
