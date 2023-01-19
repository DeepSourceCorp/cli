import { render } from '@testing-library/vue'
import { RouterLinkStub } from '@vue/test-utils'

import FourOFour from '~/components/Errors/FourOFour.vue'

describe('[[ FourOFour ]]', () => {
  const mocks = {
    $route: {
      fullPath: '/gh/deepsourcelabs',
      name: 'provider-owner'
    }
  }

  test('renders `404` error page contents', () => {
    const { html } = render(FourOFour, {
      mocks,
      stubs: {
        NuxtLink: RouterLinkStub,
        ZButton: true
      }
    })

    expect(html()).toMatchSnapshot()
  })
})
