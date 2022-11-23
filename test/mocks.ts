import { providerMetaMap } from '~/plugins/helpers/provider'
import { VcsProviderChoices } from '~/types/types'

export const mocksGenerator: (overrides?: Record<string, unknown>) => Record<string, unknown> = (
  overrides = {}
) => {
  return Object.assign(
    {
      $fetchState: {
        pending: false
      },
      $route: {
        name: 'provider-owner-repo',
        params: {
          provider: 'gh',
          owner: 'deepsourcelabs',
          repo: 'bifrost'
        }
      },
      $localStore: {
        get: jest.fn(() => {
          return true
        }),
        set: jest.fn(() => {
          return true
        })
      },
      $config: { onPrem: false, domain: 'deepsource.io' },
      $gateKeeper: {
        repo: jest.fn(() => {
          return true
        }),
        team: jest.fn(() => {
          return true
        }),
        provider: jest.fn((_: string, provider: string) => {
          return provider !== 'bb'
        })
      },
      $copyToClipboard: jest.fn(),
      $toast: {
        danger: jest.fn(),
        success: jest.fn(),
        show: jest.fn()
      },
      $providerMetaMap: providerMetaMap,
      $generateRoute: jest.fn((paths: string[], includeRepoInPath = true) => {
        const path = Array.isArray(paths) ? paths.join('/') : ''
        if (includeRepoInPath) {
          return `/gh/deepsourcelabs/bifrost/${path}`
        }
        return `/gh/deepsourcelabs/${path}`
      }),
      $socket: {
        $on: jest.fn(),
        $off: jest.fn()
      }
    },
    overrides
  )
}

export const dashboardContextGenerator: (
  overrides?: Record<string, unknown>
) => Record<string, unknown> = (overrides = {}) => {
  return Object.assign(
    {
      id: 32551,
      login: 'deepsourcelabs',
      gql_node_id: 'T3duZXI6enBrbm5n',
      avatar_url: 'https://static.deepsource.io/avatars/14ce08c1-6b0d-4502-9a03-576af9a06f9d.png',
      vcs_provider: 'gh',
      vcs_url: 'https://github.com/deepsourcelabs',
      vcs_provider_display: 'GitHub',
      vcs_installation_id: '25287269',
      type: 'team',
      num_members_total: 3,
      is_default: false,
      has_premium_plan: false,
      has_gh_education_plan: false,
      subscription_created: true,
      is_primary_user_for_owner: true,
      can_add_member: false,
      has_granted_all_repo_access: true,
      app_configuration_url:
        'https://github.com/organizations/deepsourcelabs/settings/installations/25287269',
      role: 'ADMIN',
      team_name: 'deepsourcelabs',
      subscribed_plan_info: {
        name: 'Free',
        slug: 'free'
      }
    },
    overrides
  )
}

export const storeModulesGenerator = (overrides = {}) => {
  return Object.assign(
    {
      'user/active': {
        namespaced: true,
        state: {
          viewer: {
            dashboardContext: [dashboardContextGenerator()]
          }
        }
      },
      'account/context': {
        namespaced: true,
        state: {
          context: {
            staticRoot: 'https://static.deepsource.io/',
            apiRoot: 'https://deepsource.io/graphql/',
            websocketUrl: 'wss://sockets.deepsource.io/',
            installationProvidersUrl: '/installation/providers/',
            installationUrls: {
              github: 'https://github.com/',
              bitbucket: 'https://bitbucket.org/'
            },
            stripePublishableKey: 'asdasnjdasnkljdasnkldnasldas',
            appEnv: 'production',
            emptyAvatarUrl: 'https://static.deepsource.io/dashboard/images/empty-avatar.svg',
            debug: 'false',
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
        }
      },
      'account/auth': {
        namespaced: true,
        state: {
          loggedIn: true
        }
      },
      'team/detail': {
        namespaced: true,
        state: {
          team: {
            id: 'VGVhbTpxemxyeHo=',
            login: 'deepsourcelabs',
            invitationUrl: 'https://deepsource.icu/invitation/5cnHJHRUdbbpts2ZeiBa-20oabC_W_/',
            invites: {
              totalCount: 1,
              edges: [
                {
                  node: {
                    email: 'test@test.com',
                    createdAt: '2022-05-25T07:26:58.330500+00:00',
                    role: 'CONTRIBUTOR'
                  }
                },
                {
                  node: {
                    email: 'test2@test.com',
                    createdAt: '2022-05-25T07:28:33.183971+00:00',
                    role: 'ADMIN'
                  }
                }
              ]
            }
          }
        }
      },
      'owner/detail': {
        namespaced: true,
        state: {
          loading: false,
          error: {},
          billingInfo: {},
          owner: {
            features: [],
            accountSetupStatus: [
              {
                completed: false,
                shortcode: 'activate-repository',
                display_name: 'Activate a repository',
                description:
                  'This will enable continuous analysis on your repository on every commit and pull-request'
              },
              {
                completed: false,
                shortcode: 'install-autofix',
                display_name: 'Start using Autofix',
                description:
                  'Fix hundreds of issues in your code in a couple of clicks, automatically.'
              },
              {
                completed: false,
                shortcode: 'invite-team',
                display_name: 'Invite your team',
                description: 'DeepSource is better with your teammates. Ask them to join the party!'
              },
              {
                completed: false,
                shortcode: 'configure-transformers',
                display_name: 'Start using Transformers',
                description: "Put your code-formatting on complete autopilot. It's magical!"
              }
            ],
            id: 'demo-id-for-owner-store',
            billingInfo: {
              // planSlug: 'free',
              // status: 'ACTIVE',
              upgradePlans: [],
              downgradePlans: [],
              seatsTotal: 32,
              seatsUsed: 31,
              lastBillAmount: 9216,
              upcomingBillAmount: 0,
              lastPaymentDate: '2022-05-02T16:43:41+00:00',
              upcomingPaymentDate: '2023-05-02T15:35:22+00:00',
              lastInvoiceUrl: 'https://invoice.deepsource.io/',
              cancelAtPeriodEnd: false,
              upcomingCancellationDate: null,
              outstandingCredits: 0,
              billingBackend: 'st',
              synced: true,
              pendingUpdate: false
            },
            isTeam: true,
            avatar: 'https://static.deepsource.io/avatars/avatar.png',
            vcsInstallationId: '544616',
            hasSubscribedToPlan: true,
            isGsrSshRegistered: false,
            gsrSetupPending: false,
            autofixInstallationUrl: 'https://github.com/apps/deepsource-autofix/installations/',
            isAutofixEnabled: true,
            isAutoonboardAllowed: true,
            hasPremiumPlan: true,
            canOnboard: false,
            isViewerPrimaryUser: false,
            team: {
              id: 'test-team-id-owner-store'
            },
            primaryUser: {
              id: 'test-primary-user',
              email: 'norris@deepsource.io',
              fullName: 'Duck Norris'
            },
            login: 'deepsourcelabs',
            billingEmail: 'norris@deepsource.io',
            billingAddress: 'Norris'
          }
        }
      },
      'repository/detail': {
        namespaced: true,
        state: {
          repository: {
            id: 'UmVwb3NpdG9yeTp6dmp2eXo=',
            vcsProvider: VcsProviderChoices.Github
          }
        },
        actions: {
          fetchBasicRepoDetails: jest.fn(),
          fetchRepoPerms: jest.fn(),
          fetchRepoRunCount: jest.fn(),
          fetchCurrentRunCount: jest.fn()
        }
      }
    },
    overrides
  )
}
