import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import { RouterLinkStub } from '@vue/test-utils'
import VTooltip from 'v-tooltip'

import BreadcrumbContainer from '~/components/Common/BreadcrumbContainer.vue'

const stubs = {
  NuxtLink: RouterLinkStub,
  ZBreadcrumb: true,
  ZBreadcrumbItem: true
}

describe('[[ BreadcrumbContainer ]]', () => {
  test('renders `BreadcrumbContainer`', () => {
    const { html } = render(
      BreadcrumbContainer,
      {
        props: {
          links: [{ label: 'Discover', route: '/discover' }, { label: 'All' }]
        },
        stubs
      },
      (vue) => {
        vue.use(VTooltip)
      }
    )

    expect(html()).toMatchSnapshot()
  })
})
