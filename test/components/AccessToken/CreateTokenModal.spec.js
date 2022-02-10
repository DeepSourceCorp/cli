import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import { shallowMount } from '@vue/test-utils'

import { AccessTokenExpirationStatus } from '~/types/types'

import CreateTokenModal from '~/components/AccessToken/CreateTokenModal.vue'
import { focusDirective } from '~/plugins/helpers/directives.client'

describe('[[ CreateTokenModal ]]', () => {
  test('Renders CreateTokenModal', () => {
    Date.now = jest.fn(() => new Date(Date.UTC(2055, 1, 14)).valueOf())

    const { html } = render(
      CreateTokenModal,
      {
        stubs: {
          ZModal: true,
          ZSelect: true,
          ZOption: true,
          ZIcon: true,
          ZAlert: true,
          ZButton: true,
          ZInput: true,
          CopyButton: true
        }
      },
      (vue) => {
        vue.directive('focus', focusDirective)
      }
    )

    expect(html()).toMatchSnapshot()
  })

  test('Save token triggers create and refetch', async () => {
    const wrapper = shallowMount(CreateTokenModal)

    expect(wrapper.vm.generatedTokenExpiry).toBe('')

    const payload = {
      id: 'this-is-a-mock-access-token',
      description: 'test',
      expiresAt: '2999-02-07T09:08:54.520Z',
      expirationStatus: AccessTokenExpirationStatus.Active,
      token: '0b200e81-9180-4cee-abdc-ff090c22d7fe'
    }

    wrapper.vm.createUserAccessToken = jest.fn(() => {
      return new Promise((resolve) => resolve(payload))
    })

    wrapper.setData({ expiry: 120, label: 'HELLO WORLD' })

    await wrapper.vm.saveToken()

    expect(wrapper.emitted('refetch'))

    expect(wrapper.vm.createUserAccessToken.mock.calls.length).toBe(1)
    expect(wrapper.vm.createUserAccessToken.mock.calls[0][0]).toMatchObject({
      description: 'HELLO WORLD',
      expiryDays: 120
    })
  })

  test('Save generatedTokenExpiry getter', () => {
    const wrapper = shallowMount(CreateTokenModal)
    const payload = {
      id: 'this-is-a-mock-access-token',
      description: 'test',
      expiresAt: '2022-02-07T09:08:54.520Z',
      expirationStatus: AccessTokenExpirationStatus.Active,
      token: '0b200e81-9180-4cee-abdc-ff090c22d7fe'
    }

    wrapper.vm.generatedToken = payload
    expect(wrapper.vm.generatedTokenExpiry).toBe('Feb 7, 2022')
  })

  test('closeModal emits close', () => {
    const wrapper = shallowMount(CreateTokenModal)
    wrapper.vm.closeModal()
    expect(wrapper.emitted('close'))
  })
})
