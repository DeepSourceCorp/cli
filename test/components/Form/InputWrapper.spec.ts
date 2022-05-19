import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'

import InputWrapper from '~/components/Form/InputWrapper.vue'
import { cartesian, generateBooleanProps, generateStringProps } from '~/test/utils'

describe('[[ InputWrapper ]]', () => {
  test('renders `InputWrapper` with all prop options', () => {
    const baseProps = {
      label: 'Test label',
      description: 'Test description',
      inputId: 'test-input-id'
    }

    const removeYPaddingOptions = generateBooleanProps('removeYPadding', false)
    const cascadeInputOptions = generateBooleanProps('cascadeInput', false)

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

    cartesian(
      removeYPaddingOptions,
      cascadeInputOptions,
      inputWidthOptions,
      customGridClassOptions
    ).forEach((propCombination) => {
      const props = {
        ...baseProps,
        ...propCombination
      }
      const { html } = render(InputWrapper, {
        props
      })

      expect(html()).toMatchSnapshot(JSON.stringify(props))
    })
  })
})
