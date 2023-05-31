import { render } from '@testing-library/vue'
import { RouterLinkStub, shallowMount } from '@vue/test-utils'

import SsoConfiguration from '~/components/Settings/Security/SsoConfiguration.vue'

import { SSO_SETUP_STATES } from '~/types/cloudSso'
import { IdentityProvider, Maybe, VerifiableDomain } from '~/types/types'

import { IDENTIY_PROVIDER_MOCK, VERIFIABLE_DOMAIN_MOCK } from './__mocks__/verifiableDomain.mock'

interface SsoConfigurationT extends Vue {
  verifyDomain: () => void
}

describe('[[ SsoConfiguration ]]', () => {
  const baseProps = {
    verifiableDomain: null as Maybe<VerifiableDomain>,
    identityProvider: null as Maybe<IdentityProvider>,
    domainName: 'asdf',
    verifyingDomain: false,
    isInProgress: false,
    canSetupSso: true
  }

  const stubs = { ZAlert: true, ZButton: true, ZIcon: true, ZInput: true, NuxtLink: RouterLinkStub }

  test('renders correctly with all SSO setup states', () => {
    const ssoStatesProps: Record<SSO_SETUP_STATES, typeof baseProps> = {
      [SSO_SETUP_STATES.VERIFICATION_IN_PROGRESS]: { ...baseProps, isInProgress: true },
      [SSO_SETUP_STATES.NEED_TO_UPGRADE]: { ...baseProps, canSetupSso: false },
      [SSO_SETUP_STATES.NEEDS_INFORMATION]: { ...baseProps, verifiableDomain: null },
      [SSO_SETUP_STATES.VERIFICATION_COMPLETE]: {
        ...baseProps,
        verifiableDomain: VERIFIABLE_DOMAIN_MOCK
      }
    }
    Object.values(ssoStatesProps).forEach((props) => {
      const { html } = render(SsoConfiguration, {
        props,
        stubs
      })

      expect(html()).toMatchSnapshot()
    })
  })

  test('renders configured IDP data correctly', () => {
    const { html } = render(SsoConfiguration, {
      props: { ...baseProps, identityProvider: IDENTIY_PROVIDER_MOCK },
      stubs
    })

    expect(html()).toMatchSnapshot()
  })

  describe('[[verifyDomain]] method', () => {
    const mocks = { $emit: jest.fn(), $toast: { danger: jest.fn() } }

    const getInstance = (props: Partial<typeof baseProps>) => {
      const { vm } = shallowMount(SsoConfiguration, {
        propsData: { ...baseProps, ...props },
        mocks,
        stubs
      })

      return vm as SsoConfigurationT
    }

    test('emits event successfully', () => {
      const vm = getInstance({})
      vm.verifyDomain()
      expect(mocks.$emit).toBeCalledWith('verify-domain')
    })

    test('throws error successfully', () => {
      const vm = getInstance({ domainName: '' })
      vm.verifyDomain()
      expect(mocks.$toast.danger).toBeCalled()
    })
  })
})
