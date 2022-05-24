import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'

import EventAlertsSection from '~/components/Integrations/Slack/EventAlertsSection.vue'

describe('[[ EventAlertsSection ]]', () => {
  test('renders the various events that the Slack integration supports', () => {
    const { html } = render(EventAlertsSection, {
      stubs: {
        ZIcon: true
      }
    })

    expect(html()).toMatchSnapshot()
  })
})
