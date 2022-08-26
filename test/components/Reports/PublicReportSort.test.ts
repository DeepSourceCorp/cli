import { render } from '@testing-library/vue'
import { PublicReportSort } from '~/components/Reports'
import { cartesian, generateStringProps } from '~/test/utils'

test('renders PublicReportSort with all prop options', () => {
  const sortOptions = generateStringProps(
    'selectedSortFilter',
    ['', 'first-created', 'last-created'],
    false
  )

  cartesian(sortOptions).forEach((propCombination) => {
    const props = {
      ...propCombination
    }

    const { html } = render(PublicReportSort, {
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
