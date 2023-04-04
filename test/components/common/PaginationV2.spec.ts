import { render } from '@testing-library/vue'

import PaginationV2 from '~/components/Common/PaginationV2.vue'

describe('[[ PaginationV2 ]]', () => {
  const propsData = {
    pageNumber: 1,
    perPageCount: 30,
    totalCount: 250
  }

  const stubs = {
    ZButton: true,
    ZDivider: true,
    ZIcon: true
  }

  it('renders the new pagination pattern', () => {
    const { html } = render(PaginationV2, { propsData, stubs })

    expect(html()).toMatchSnapshot()
  })
})
