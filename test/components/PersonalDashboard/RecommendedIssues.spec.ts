import { render } from '@testing-library/vue'

import { RecommendedIssues } from '~/components/PersonalDashboard'
import { storeModulesGenerator } from '~/test/mocks'

describe('[[ RecommendedIssues ]]', () => {
  const stubs = {
    AutofixFileChooser: true,
    IssueListItem: true,
    upgradeAccountModal: true
  }

  const storeMock = {
    modules: storeModulesGenerator()
  }

  test('renders `RecommendedIssues` with all prop combinations', () => {
    const { html } = render(RecommendedIssues, {
      store: storeMock,
      stubs
    })

    expect(html()).toMatchSnapshot()
  })
})
