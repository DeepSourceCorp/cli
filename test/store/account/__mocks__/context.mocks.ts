import { ContextModuleState } from '~/store/account/context'
import { Context } from '~/types/types'

/**
 * Context mock
 */
const CONTEXT_MOCK: Context = {
  staticRoot: 'https://static.deepsource.io/',
  apiRoot: 'https://deepsource.io/graphql/',
  websocketUrl: 'wss://sockets.deepsource.io/',
  installationProvidersUrl: '/installation/providers/',
  installationUrls: {
    github: 'https://github.com/apps/deepsource-io/installations/new?state=Ymlmcm9zdA==',
    bitbucket:
      'https://bitbucket.org/site/addons/authorize?addon_key=deepsource&redirect_uri=https://deepsource.io/onboard/bitbucket?state=Ymlmcm9zdA=='
  },
  stripePublishableKey: 'pk_live_mXF3lvStqtkwZqOxPpARlwQ4',
  appEnv: 'production',
  emptyAvatarUrl: 'https://static.deepsource.io/dashboard/images/empty-avatar.svg',
  debug: 'false',
  sentryDsn: 'https://1e2f85138c3e4536b25771d2403021b8@o193009.ingest.sentry.io/5341886',
  userGroupUrl: 'https://deepsource.io/discord/',
  onPrem: 'false',
  deepsourceCloudProduction: 'true',
  githubEnabled: true,
  gitlabEnabled: true,
  bitbucketEnabled: true,
  supportEmail: 'support@deepsource.io',
  isTransformersLicensed: true,
  toOnboard: false,
  plans: {
    'plan-github-education-annual': {
      name: 'Pro',
      slug: 'pro',
      type: 'user',
      mode: 'annual',
      amount: 0,
      min_seats: 1,
      max_seats: 1
    },
    'plan-premium-monthly': {
      name: 'Business',
      slug: 'premium',
      type: 'team',
      mode: 'monthly',
      amount: 30,
      min_seats: 1,
      max_seats: 2000
    },
    'plan-premium-annual': {
      name: 'Business',
      slug: 'premium',
      type: 'team',
      mode: 'annual',
      amount: 288,
      min_seats: 1,
      max_seats: 200
    },
    'plan-starter-monthly': {
      name: 'Starter',
      slug: 'starter',
      type: 'team',
      mode: 'monthly',
      amount: 10,
      min_seats: 1,
      max_seats: 2000
    },
    'plan-starter-annual': {
      name: 'Starter',
      slug: 'starter',
      type: 'team',
      mode: 'annual',
      amount: 96,
      min_seats: 1,
      max_seats: 2000
    }
  }
}

/**
 * Mock -- context factory
 *
 * @see CONTEXT_MOCK
 * @returns {Context}
 */
export const mockContext = (): Context => CONTEXT_MOCK

/**
 * Mock -- context store factory
 *
 * @returns {ContextModuleState}
 */
export const mockContextStore = (): ContextModuleState => ({
  context: mockContext()
})
