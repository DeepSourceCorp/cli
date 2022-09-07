import { render } from '@testing-library/vue'
import { CodeCoverageTableCell } from '~/components/Reports'
import { RouterLinkStub } from '@vue/test-utils'

import { cartesian, generateBooleanProps, generateGenericProps } from '~/test/utils'
import { mocksGenerator } from '~/test/mocks'

test('renders CodeCoverageTableCell with all prop options', () => {
  const valueOptions = generateGenericProps('value', ['', '72.12', 56])
  const isPassingOptions = generateBooleanProps('isPassing')
  const linkedCellOptions = generateBooleanProps('linkedCell', false)

  cartesian(valueOptions, isPassingOptions, linkedCellOptions).forEach((propCombination) => {
    const props = {
      ...propCombination,
      repoName: 'asgard'
    }

    const { html } = render(CodeCoverageTableCell, {
      props,
      stubs: {
        Ticker: true,
        NuxtLink: RouterLinkStub
      },
      mocks: mocksGenerator()
    })

    expect(html()).toMatchSnapshot(JSON.stringify(props))
  })
})
