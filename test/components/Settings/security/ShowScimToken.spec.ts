import { render } from '@testing-library/vue'

import ShowScimToken from '~/components/Settings/Security/ShowScimToken.vue'
import { focusDirective } from '~/plugins/helpers/directives.client'

describe('[[ ShowScimToken ]]', () => {
  test('renders correctly with all props', async () => {
    const { html } = await render(
      ShowScimToken,
      {
        props: { token: 'abc', teamName: 'lol' },
        stubs: { ZAlert: true, ZButton: true, ZIcon: true, ZInput: true, ZModal: true }
      },
      (vue) => {
        vue.directive('focus', focusDirective)
      }
    )

    expect(html()).toMatchSnapshot()
  })
})
