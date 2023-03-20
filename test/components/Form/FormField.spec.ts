import { render } from '@testing-library/vue'

import FormField from '~/components/Form/FormField.vue'
import { cartesian, generateBooleanProps } from '~/test/utils'

describe('[[ FormField ]]', () => {
  const baseProps = {
    id: 'test-id',
    label: 'test-label'
  }

  const stubs = {
    ZIcon: true
  }

  it('renders a form field with an error block based on the condition', () => {
    const errConditionOptions = generateBooleanProps('errCondition', false)

    cartesian(errConditionOptions).forEach((propCombination) => {
      const { html } = render(FormField, { propsData: { ...baseProps, ...propCombination }, stubs })

      expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
    })
  })
})
