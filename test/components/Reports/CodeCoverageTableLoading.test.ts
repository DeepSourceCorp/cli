import { render } from '@testing-library/vue'

import { CodeCoverageTableLoading } from '~/components/Reports'
import { cartesian, generateBooleanProps } from '~/test/utils'

describe('[[ CodeCoverageTableLoading ]]', () => {
  test('renders code coverage table in loading state with all prop options', () => {
    const isWidgetOptions = generateBooleanProps('isWidget', false)

    cartesian(isWidgetOptions).forEach((propCombination) => {
      const { html } = render(CodeCoverageTableLoading, {
        propsData: { ...propCombination },
        stubs: {
          ZIcon: true,
          ZButton: true
        }
      })

      expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
    })
  })
})
