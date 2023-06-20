import { render } from '@testing-library/vue'

import IntegrationInfo from '~/components/Integrations/IntegrationInfo.vue'
import { cartesian, generateBooleanProps } from '~/test/utils'

describe('[[ IntegrationInfo ]]', () => {
  test('renders a neutral alert widget with the title and description', () => {
    const baseProps = {
      description: 'Test description'
    }

    const dismissibleOptions = generateBooleanProps('dismissible', false)

    cartesian(dismissibleOptions).forEach((propCombination) => {
      const propsData = {
        ...baseProps,
        ...propCombination
      }

      const { html } = render(IntegrationInfo, {
        propsData
      })
      expect(html()).toMatchSnapshot(JSON.stringify(propsData))
    })
  })
})
