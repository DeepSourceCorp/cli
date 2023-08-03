import { render } from '@testing-library/vue'
import ZAccordion from '@/components/zeal/ZAccordion'
import ZAccordionItem from '@/components/zeal/ZAccordionItem'
import ZStepper from '@/components/zeal/ZStepper'
import ZStep from '@/components/zeal/ZStep'

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
