import { render } from '@testing-library/vue'
import { RouterLinkStub } from '@vue/test-utils'
import VTooltip from 'floating-vue'

import { CodeCoverageTableCell } from '~/components/Reports'
import { mocksGenerator } from '~/test/mocks'
import { cartesian, generateBooleanProps, generateGenericProps } from '~/test/utils'

test('renders CodeCoverageTableCell with all prop options', () => {
  const isPassingOptions = generateBooleanProps('isPassing')
  const isWidgetOptions = generateBooleanProps('isWidget')
  const linkedCellOptions = generateBooleanProps('linkedCell', false)
  const valueOptions = generateGenericProps('value', ['', '72.12', 56])

  cartesian(isPassingOptions, isWidgetOptions, linkedCellOptions, valueOptions).forEach(
    (propCombination) => {
      const props = {
        ...propCombination,
        repoName: 'asgard'
      }

      const { html } = render(
        CodeCoverageTableCell,
        {
          props,
          stubs: {
            Ticker: true,
            NuxtLink: RouterLinkStub
          },
          mocks: mocksGenerator()
        },
        (vue) => {
          vue.use(VTooltip)
        }
      )

      expect(html()).toMatchSnapshot(JSON.stringify(props))
    }
  )
})
