import { IdentityProvider, VerifiableDomain } from '~/types/types'

export const VERIFIABLE_DOMAIN_MOCK: VerifiableDomain = {
  id: '12345',
  domainName: 'https://deepsource.io',
  verified: true
}

export const IDENTIY_PROVIDER_MOCK: IdentityProvider = {
  id: '12345',
  domain: VERIFIABLE_DOMAIN_MOCK,
  isScimAuthTokenSet: false,
  isScimEnabled: false,
  provider: 'GH',
  xmlMetadataUrl: 'https://gh.co/sso'
}
