import { render } from '@testing-library/vue'
import { ReportDeleteConfirm } from '~/components/Reports'

test('renders ComplianceStats with all prop options', () => {
  const props = {
    reportLabel: 'Sample Report'
  }

  const { html } = render(ReportDeleteConfirm, {
    props,
    stubs: {
      ZButton: true,
      ZConfirm: true
    }
  })

  expect(html()).toMatchSnapshot(JSON.stringify(props))
})
