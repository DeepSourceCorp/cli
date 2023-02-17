import { render } from '@testing-library/vue'
import VTooltip from 'v-tooltip'

import { IssueCategorySelector } from '~/components/Issue'
import { storeModulesGenerator } from '~/test/mocks'

describe('[[ CategorySelector ]]', () => {
  const stubs = {
    ZIcon: true,
    ZTag: true
  }

  const storeMock = { modules: storeModulesGenerator() }

  test('renders the list of issue category items', () => {
    const { html } = render(IssueCategorySelector, { store: storeMock, stubs }, (vue) => {
      vue.use(VTooltip)
    })

    expect(html()).toMatchSnapshot()
  })
})
