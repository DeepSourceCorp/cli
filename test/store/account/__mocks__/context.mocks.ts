import { ContextModuleState } from '~/store/account/context'
import { Changelog, Context, StatusOptions } from '~/types/types'

/**
 * Changelog mock
 */
const CHANGELOG_MOCK: Changelog = {
  logEntries: [
    {
      id: '62419d258d8bf53a6d268728',
      title: 'More webhook events, 25+ new issues, and a cyborg duck',
      created: '2022-03-28T11:33:57.450Z',
      labels: [],
      publishedAt: '2022-03-28T11:35:05.582Z',
      status: StatusOptions.Published,
      url: 'https://deepsource.canny.io/changelog/more-webhook-events-25-new-issues-and-a-cyborg-duck'
    },
    {
      id: '622f26905ff16b1280caece3',
      title: 'Issue priority',
      created: '2022-03-14T11:27:12.632Z',
      labels: [
        {
          id: '6195b96597577a1f181a407c',
          name: 'Enterprise'
        },
        {
          id: '6195b9679f97ec150cd70e5a',
          name: 'Cloud'
        }
      ],
      publishedAt: '2022-03-14T11:28:32.819Z',
      status: StatusOptions.Published,
      url: 'https://deepsource.canny.io/changelog/issue-priority'
    },
    {
      id: '620a4d00d6d41432c91bcba5',
      title: 'New Transformer — gofumpt',
      created: '2022-02-14T12:37:20.474Z',
      labels: [
        {
          id: '6195b96597577a1f181a407c',
          name: 'Enterprise'
        },
        {
          id: '6195b9679f97ec150cd70e5a',
          name: 'Cloud'
        },
        {
          id: '6195bf7ee1335128cb27785a',
          name: 'Transformer'
        }
      ],
      publishedAt: '2022-02-22T07:55:38.160Z',
      status: StatusOptions.Published,
      url: 'https://deepsource.canny.io/changelog/new-transformer-gofumpt'
    },
    {
      id: '620a4a38fbdc291ec62eacc3',
      title: 'Terraform Analyzer: 25 new issues',
      created: '2022-02-14T12:25:28.328Z',
      labels: [
        {
          id: '6195b96597577a1f181a407c',
          name: 'Enterprise'
        },
        {
          id: '6195b9679f97ec150cd70e5a',
          name: 'Cloud'
        }
      ],
      publishedAt: '2022-02-14T12:36:38.105Z',
      status: StatusOptions.Published,
      url: 'https://deepsource.canny.io/changelog/terraform-analyzer-25-new-issues'
    },
    {
      id: '61ee9988c067a229f89a8d7b',
      title: 'All new webhooks and a simpler signup flow',
      created: '2022-01-24T12:20:24.526Z',
      labels: [
        {
          id: '6195b9679f97ec150cd70e5a',
          name: 'Cloud'
        }
      ],
      publishedAt: '2022-02-04T07:08:20.865Z',
      status: StatusOptions.Published,
      url: 'https://deepsource.canny.io/changelog/all-new-webhooks-and-a-simpler-signup-flow'
    },
    {
      id: '61e035353c783828d89bbdf7',
      title: 'Support for Python 3.10, new issues and Autofix for Python',
      created: '2022-01-13T14:20:37.016Z',
      labels: [
        {
          id: '6195b9679f97ec150cd70e5a',
          name: 'Cloud'
        },
        {
          id: '6195bf798dce960dd4b22354',
          name: 'Analyzer'
        }
      ],
      publishedAt: '2022-01-13T14:28:17.449Z',
      status: StatusOptions.Published,
      url: 'https://deepsource.canny.io/changelog/support-for-python-310-new-issues-and-autofix-for-python'
    },
    {
      id: '61dbe4a6bd71c26283eecefe',
      title: 'Better repository sync, improved changelog, and more',
      created: '2022-01-10T07:47:50.641Z',
      labels: [],
      publishedAt: '2022-01-10T13:27:02.853Z',
      status: StatusOptions.Published,
      url: 'https://deepsource.canny.io/changelog/better-repository-sync-improved-changelog-and-more'
    },
    {
      id: '619c077b14fd0d14b3ef3589',
      title: 'Listen for events on DeepSource with webhooks',
      created: '2021-09-15T17:33:57.000Z',
      labels: [],
      publishedAt: '2021-09-15T17:33:57.000Z',
      status: StatusOptions.Published,
      url: 'https://deepsource.canny.io/changelog/listen-for-events-on-deepsource-with-webhooks'
    },
    {
      id: '619c077c14fd0d14b3ef358b',
      title: 'Java Analyzer: 2.5X faster analyses, new issues and false-positives fixes ',
      created: '2021-09-06T10:35:17.000Z',
      labels: [],
      publishedAt: '2021-09-06T10:35:17.000Z',
      status: StatusOptions.Published,
      url: 'https://deepsource.canny.io/changelog/java-analyzer-25x-faster-analyses-new-issues-and-false-positives-fixes'
    },
    {
      id: '619c077c14fd0d14b3ef358d',
      title: 'Terraform Analyzer: 10 new GCP issues',
      created: '2021-08-31T07:10:25.000Z',
      labels: [],
      publishedAt: '2021-08-31T07:10:25.000Z',
      status: StatusOptions.Published,
      url: 'https://deepsource.canny.io/changelog/terraform-analyzer-10-new-gcp-issues'
    },
    {
      id: '619c077c14fd0d14b3ef358f',
      title: 'Go Analyzer: Improved Autofix and added 2 new Autofixes',
      created: '2021-08-31T06:58:15.000Z',
      labels: [],
      publishedAt: '2021-08-31T06:58:15.000Z',
      status: StatusOptions.Published,
      url: 'https://deepsource.canny.io/changelog/go-analyzer-improved-autofix-and-added-2-new-autofixes'
    },
    {
      id: '619c077c14fd0d14b3ef3591',
      title: 'Introducing AutoOnboard',
      created: '2021-08-11T15:42:29.000Z',
      labels: [],
      publishedAt: '2021-08-11T15:42:29.000Z',
      status: StatusOptions.Published,
      url: 'https://deepsource.canny.io/changelog/introducing-autoonboard'
    },
    {
      id: '619c077d14fd0d14b3ef3593',
      title: 'Python Analyzer: Added 1 new issue and 9 more Autofixes',
      created: '2021-08-10T10:05:10.000Z',
      labels: [],
      publishedAt: '2021-08-10T10:05:10.000Z',
      status: StatusOptions.Published,
      url: 'https://deepsource.canny.io/changelog/python-analyzer-added-1-new-issue-and-9-more-autofixes'
    }
  ]
}

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
 * Mock -- changelog factory
 *
 * @see CHANGELOG_MOCK
 * @returns {Changelog}
 */
export const mockChangelog = (): Changelog => CHANGELOG_MOCK

/**
 * Mock -- context store factory
 *
 * @returns {ContextModuleState}
 */
export const mockContextStore = (): ContextModuleState => ({
  context: mockContext(),
  changelog: mockChangelog()
})
