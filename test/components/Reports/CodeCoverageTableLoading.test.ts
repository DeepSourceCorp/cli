import { render } from '@testing-library/vue'
import { CodeCoverageTableLoading } from '~/components/Reports'

test('renders CodeCoverageTable with all prop options', () => {
  const { html } = render(CodeCoverageTableLoading, {
    stubs: {
      ZIcon: true,
      ZButton: true
    }
  })

  expect(html()).toMatchSnapshot()
})
