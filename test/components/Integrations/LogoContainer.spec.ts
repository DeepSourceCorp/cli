import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'

import LogoContainer from '~/components/Integrations/LogoContainer.vue'

describe('[[ LogoContainer ]]', () => {
  test('renders the integration logo in a container', () => {
    const { html } = render(LogoContainer, {
      props: {
        logo: 'https://static.deepsource.io/integration_logos/slack.svg'
      },
      stubs: {
        ZIcon: true
      }
    })

    expect(html()).toMatchSnapshot()
  })
})
