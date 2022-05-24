import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import { RouterLinkStub } from '@vue/test-utils'

import IntegrationCard from '~/components/Integrations/IntegrationCard.vue'
import { cartesian, generateBooleanProps } from '~/test/utils'

describe('[[ IntegrationCard ]]', () => {
  test('renders the integration logo along with the name', () => {
    const baseProps = {
      shortcode: 'slack',
      name: 'Slack',
      logo: 'https://static.deepsource.io/integration_logos/slack.svg',
      installed: true
    }

    const showInstallationStatusOptions = generateBooleanProps('showInstallationStatus')

    cartesian(showInstallationStatusOptions).forEach((propCombination) => {
      const props = {
        ...baseProps,
        ...propCombination
      }

      const { html } = render(IntegrationCard, {
        mocks: {
          $generateRoute: () => '/gh/Test-Org-Dev/cli-prompts-test/settings/integrations/slack'
        },
        props,
        stubs: {
          NuxtLink: RouterLinkStub,
          ZTag: true
        }
      })

      expect(html()).toMatchSnapshot(JSON.stringify(props))
    })
  })
})
