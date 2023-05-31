import { render } from '@testing-library/vue'
import { shallowMount } from '@vue/test-utils'

import ConfirmDeleteIdP from '~/components/Settings/Security/ConfirmDeleteIdP.vue'

import { focusDirective } from '~/plugins/helpers/directives.client'

import { ACTIVE_USER_DETAIL } from '~/test/store/user/__mocks__/active.mock'
import { cartesian, generateBooleanProps } from '~/test/utils'

interface ConfirmDeleteIdPT extends Vue {
  userEmail: string
  deletionValid: boolean
  emitDelete: (close: () => void) => void
}

describe('[[ ConfirmDeleteIdP ]]', () => {
  const baseProps = { viewer: ACTIVE_USER_DETAIL, isDeleting: false }
  const stubs = { ZButton: true, ZIcon: true, ZInput: true, ZModal: true }
  const mocks = {
    $emit: jest.fn()
  }

  test('renders correctly with all props', () => {
    const isDeletingOptions = generateBooleanProps('isDeleting', false)

    cartesian(isDeletingOptions).forEach((propCombo) => {
      const { html } = render(
        ConfirmDeleteIdP,
        {
          props: {
            ...baseProps,
            ...propCombo
          },
          stubs
        },
        (vue) => {
          vue.directive('focus', focusDirective)
        }
      )

      expect(html()).toMatchSnapshot()
    })
  })

  test('`closeModal` is called successfully', () => {
    const wrapper = shallowMount(ConfirmDeleteIdP, {
      propsData: { ...baseProps },
      stubs,
      mocks
    })

    const vm = wrapper.vm as ConfirmDeleteIdPT
    vm.userEmail = baseProps.viewer.email

    const close = jest.fn()
    vm.emitDelete(close)

    expect(mocks.$emit).toBeCalledWith('delete-idp', { close })
  })
})
