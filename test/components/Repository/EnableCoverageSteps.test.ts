import { render } from '@testing-library/vue'
import { ZAccordion, ZAccordionItem, ZStepper, ZStep } from '@deepsource/zeal'

import { EnableCoverageSteps } from '~/components/Repository'

test('renders EnableCoverageSteps with all prop options', () => {
  const props = { dsn: 'http://6f7d439568e64460a5e0a31967314288@localhost:3000' }

  const { html } = render(EnableCoverageSteps, {
    props,
    stubs: {
      ZAccordion,
      ZAccordionItem,
      ZStepper,
      ZStep,
      ZIcon: true,
      ZSelect: true,
      ZOption: true,
      unstyledCopyButton: true
    }
  })

  expect(html()).toMatchSnapshot(JSON.stringify(props))
})
