import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'

import IntegrationInstalledOn from '~/components/Integrations/IntegrationInstalledOn.vue'
import { cartesian, generateStringProps } from '~/test/utils'

describe('[[ IntegrationInstalledOn ]]', () => {
  test('renders the integration installed on section', () => {
    const enabledOnOptions = generateStringProps('installedOn', ['deepsourcelabs'])

    cartesian(enabledOnOptions).forEach((props) => {
      const { html } = render(IntegrationInstalledOn, {
        props,
        stubs: {
          Notice: true
        }
      })

      expect(html()).toMatchSnapshot(JSON.stringify(props))
    })
  })
})
