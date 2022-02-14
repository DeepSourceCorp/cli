import { render } from '@testing-library/vue'
import { shallowMount } from '@vue/test-utils'
import { PriorityTypeSelect } from '~/components/IssuePriority'
import { cartesian, generateBooleanProps, generateStringProps } from '~/test/utils'

test('renders PriorityTypeSelect with all prop options', () => {
  const priorityOptions = generateStringProps(
    'priority',
    ['high', 'medium', 'low', 'noop', ''],
    false
  )
  const sizeOptions = generateStringProps('size', ['small', 'large', ''], false)
  const verboseTitleOptions = generateBooleanProps('verboseTitle', false)

  cartesian(priorityOptions, sizeOptions, verboseTitleOptions).forEach((propCombination) => {
    const props = {
      ...propCombination
    }

    const { html } = render(PriorityTypeSelect, {
      props,
      stubs: {
        ZIcon: true,
        ZMenuSection: true,
        ZMenuItem: true
      }
    })

    expect(html()).toMatchSnapshot(JSON.stringify(props))
  })
})

test('emits priority changed', () => {
  const wrapper = shallowMount(PriorityTypeSelect, {
    propsData: {
      priority: 'high'
    }
  })

  // @ts-ignore
  wrapper.vm.changePriority('hello')
  expect(wrapper.emitted('priority-changed'))
})
