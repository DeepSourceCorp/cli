import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import { shallowMount } from '@vue/test-utils'

import UnstyledCopyButton from '~/components/UnstyledCopyButton.vue'
import { cartesian, generateBooleanProps } from '~/test/utils'

const baseProps = {
  value: 'text to copy'
}

describe('[[ UnstyledCopyButton ]]', () => {
  const stubs = {
    ZIcon: true
  }

  test('renders `UnstyledCopyButton` with all props', () => {
    const iconOnlyOptions = generateBooleanProps('iconOnly', false)
    const disabledOptions = generateBooleanProps('disabled', false)

    cartesian(iconOnlyOptions, disabledOptions).forEach((propCombination) => {
      const props = {
        ...baseProps,
        ...propCombination
      }

      const { html } = render(UnstyledCopyButton, {
        props,
        stubs
      })
      expect(html()).toMatchSnapshot(JSON.stringify(props))
    })
  })

  test('clicking button copies text to clipboard', async () => {
    const $copyToClipboard = jest.fn()

    const wrapper = shallowMount(UnstyledCopyButton, {
      propsData: baseProps,
      stubs,
      mocks: { $copyToClipboard }
    })

    await wrapper.trigger('click')

    expect($copyToClipboard).toHaveBeenCalledWith(baseProps.value)
  })
})
