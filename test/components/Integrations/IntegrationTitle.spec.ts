import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'

import IntegrationTitle from '~/components/Integrations/IntegrationTitle.vue'
import { cartesian, generateBooleanProps } from '~/test/utils'

describe('[[ IntegrationTitle ]]', () => {
  test('renders the integration logo along with the name', () => {
    const baseProps = {
      logo: 'https://static.deepsource.io/integration_logos/slack.svg',
      name: 'Slack'
    }

    const pendingOptions = generateBooleanProps('pending')

    cartesian(pendingOptions).forEach((propCombination) => {
      const props = {
        ...baseProps,
        ...propCombination
      }

      const { html } = render(IntegrationTitle, {
        props,
        stubs: {
          LogoContainer: true,
          ZIcon: true
        }
      })

      expect(html()).toMatchSnapshot(JSON.stringify(props))
    })
  })
})
