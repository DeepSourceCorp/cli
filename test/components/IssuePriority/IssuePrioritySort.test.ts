import { render } from '@testing-library/vue'
import { IssuePrioritySort } from '~/components/IssuePriority'
import { cartesian, generateStringProps } from '~/test/utils'

test('renders IssuePrioritySort with all prop options', () => {
  const sortOptions = generateStringProps(
    'selectedSortFilter',
    ['', 'increasing-priority', 'decreasing-priority'],
    false
  )

  cartesian(sortOptions).forEach((propCombination) => {
    const props = {
      ...propCombination
    }

    const { html } = render(IssuePrioritySort, {
      props,
      stubs: {
        ZIcon: true,
        ZButton: true,
        ZMenuSection: true,
        ZMenuItem: true
      }
    })

    expect(html()).toMatchSnapshot(JSON.stringify(props))
  })
})
