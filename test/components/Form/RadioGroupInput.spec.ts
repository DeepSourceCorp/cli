import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'

import RadioGroupInput from '~/components/Form/RadioGroupInput.vue'
import { cartesian, generateBooleanProps, generateStringProps } from '~/test/utils'

describe('[[ RadioGroupInput ]]', () => {
  test('renders `RadioGroupInput` with all prop options', () => {
    const baseProps = {
      label: 'Test label',
      description: 'Test description',
      inputId: 'test-input-id',
      options: [
        {
          value: 'Value 1',
          label: 'Label 1'
        },
        {
          value: 'Value 2',
          label: 'Label 2'
        }
      ]
    }

    const disabledOptions = generateBooleanProps('disabled', false)

    const inputWidthOptions = generateStringProps('inputWidth', [
      'xx-small',
      'x-small',
      'small',
      'base',
      'wide'
    ])

    const customGridClassOptions = generateStringProps('customGridClass', [
      '',
      'grid-cols-1 md:grid-cols-4'
    ])

    cartesian(inputWidthOptions, disabledOptions, customGridClassOptions).forEach(
      (propCombination) => {
        const props = {
          ...baseProps,
          ...propCombination
        }
        const { html } = render(RadioGroupInput, {
          props
        })

        expect(html()).toMatchSnapshot(JSON.stringify(props))
      }
    )
  })
})
