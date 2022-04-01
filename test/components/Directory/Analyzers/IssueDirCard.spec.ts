import { render } from '@testing-library/vue'
import { RouterLinkStub } from '@vue/test-utils'
import IssueDirCard from '~/components/Directory/Analyzers/IssueDirCard.vue'

import { BaseCard } from '~/components/History'

const baseProps = {
  issue: {
    title: 'Generic exception caught and silently ignored in a loop',
    shortcode: 'BAN-B112',
    issueType: 'security',
    shortDescriptionRendered:
      '<p>Catching generic exceptions and silently ignoring them in a loop is considered bad practice in general, but also presents a potential security issue. A larger than normal volume of errors from a service can indicate an attempt is being made to disrupt or interfere with it. Thus errors should, at the very least, be logged.</p>\n',
    autofixAvailable: false,
    severity: 'MINOR'
  },
  analyzerUrl: '/directory/analyzers/python',
  issueTypeTitle: 'Security'
}

test('renders IssueDirCard with all prop options', () => {
  const { html } = render(IssueDirCard, {
    props: baseProps,
    stubs: {
      ZIcon: true,
      NuxtLink: RouterLinkStub
    },
    components: { BaseCard }
  })

  expect(html()).toMatchSnapshot('IssueDirCard')
})
