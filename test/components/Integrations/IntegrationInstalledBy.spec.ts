import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'

import IntegrationInstalledBy from '~/components/Integrations/IntegrationInstalledBy.vue'
import { cartesian, generateStringProps } from '~/test/utils'

describe('[[ IntegrationInstalledBy ]]', () => {
  test('renders the integration installed by', () => {
    const enabledOnOptions = generateStringProps('enabledOn', ['Jun 20, 2022'], false)
    const avatarOptions = generateStringProps(
      'avatar',
      ['https://deepsource.io/example.png'],
      false
    )
    const userNameOptions = generateStringProps('userName', ['awalvie'], false)

    cartesian(enabledOnOptions, avatarOptions, userNameOptions).forEach((props) => {
      const { html } = render(IntegrationInstalledBy, {
        props,
        stubs: {
          ZAvatar: true
        }
      })

      expect(html()).toMatchSnapshot(JSON.stringify(props))
    })
  })
})
