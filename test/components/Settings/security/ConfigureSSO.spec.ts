import { render } from '@testing-library/vue'
import { shallowMount } from '@vue/test-utils'

import ConfigureSSO from '~/components/Settings/Security/ConfigureSSO.vue'

import { focusDirective } from '~/plugins/helpers/directives.client'
import { VERIFIABLE_DOMAIN_MOCK } from './__mocks__/verifiableDomain.mock'

interface ConfigureSSOT extends Vue {
  xmlMetadataUrl: string
  closeModal: (close?: () => void) => void
}

describe('[[ ConfigureSSO ]]', () => {
  const baseProps = { verifiableDomain: VERIFIABLE_DOMAIN_MOCK }
  const stubs = { ZButton: true, ZIcon: true, ZInput: true, ZModal: true }

  test('renders correctly with all props', () => {
    const { html } = render(
      ConfigureSSO,
      {
        props: {
          ...baseProps
        },
        stubs
      },
      (vue) => {
        vue.directive('focus', focusDirective)
      }
    )

    expect(html()).toMatchSnapshot()
  })

  test('renders correctly without all props', () => {
    const { html } = render(ConfigureSSO, {
      props: {
        ...baseProps,
        verifiableDomain: null
      },
      stubs
    })

    expect(html()).toMatchSnapshot()
  })

  test('`closeModal` is called successfully', () => {
    const wrapper = shallowMount(ConfigureSSO, {
      propsData: { ...baseProps },
      stubs
    })

    const vm = wrapper.vm as ConfigureSSOT
    vm.xmlMetadataUrl = 'https://deepsource.io'

    const close = jest.fn()
    vm.closeModal(close)

    expect(close).toBeTruthy()
    expect(close).toHaveBeenCalled()
  })
})
