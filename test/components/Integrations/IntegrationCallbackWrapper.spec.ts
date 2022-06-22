import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'

import IntegrationCallbackWrapper from '~/components/Integrations/IntegrationCallbackWrapper.vue'
import { cartesian, generateBooleanProps, generateStringProps } from '~/test/utils'

describe('[[ IntegrationCallbackWrapper ]]', () => {
  test('renders the integration callback wrapper', () => {
    const integrationLogo = generateStringProps(
      'integrationLogo',
      ['https://deepsource.io/example.png'],
      false
    )
    const installingOn = generateStringProps('installingOn', ['https://deepsource.io/example.png'])
    const isInstalling = generateBooleanProps('isInstalling')
    const primaryDisabled = generateBooleanProps('primaryDisabled')

    cartesian(integrationLogo, installingOn, isInstalling, primaryDisabled).forEach((props) => {
      const { html } = render(IntegrationCallbackWrapper, {
        props,
        stubs: {
          Notice: true,
          LogoContainer: true,
          ZButton: true
        }
      })

      expect(html()).toMatchSnapshot(JSON.stringify(props))
    })
  })
})
