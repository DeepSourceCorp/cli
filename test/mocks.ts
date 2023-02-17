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
          hasGrantedAllRepoAccess: true,
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
            vcsProvider: VcsProviderChoices.Github,
            issueTypeDistribution: [
              {
                shortcode: 'all',
                name: 'All issues',
                description: 'All the issues',
                count: 411
              },
              {
                shortcode: 'recommended',
                name: 'Recommended',
                description: 'Recommended Issues',
                count: 209
              },
              {
                shortcode: 'bug-risk',
                name: 'Bug Risk',
                description: null,
                count: 195
              },
              {
                shortcode: 'antipattern',
                name: 'Anti-pattern',
                description: null,
                count: 136
              },
              {
                shortcode: 'security',
                name: 'Security',
                description: null,
                count: 58
              },
              {
                shortcode: 'performance',
                name: 'Performance',
                description: null,
                count: 22
              },
              {
                shortcode: 'style',
                name: 'Style',
                description: null,
                count: 0
              },
              {
                shortcode: 'doc',
                name: 'Documentation',
                description: null,
                count: 0
              },
              {
                shortcode: 'typecheck',
                name: 'Typecheck',
                description: null,
                count: 0
              },
              {
                shortcode: 'coverage',
                name: 'Coverage',
                description: null,
                count: 0
              }
            ]
          }
        },
        actions: {
          fetchBasicRepoDetails: jest.fn(),
          fetchRepoPerms: jest.fn(),
          fetchRepoRunCount: jest.fn(),
          fetchCurrentRunCount: jest.fn()
        }
      },
      'repository/list': {
        namespaced: true,
        state: {
          loading: false,
          error: {},
          repositoryList: {
            pageInfo: {},
            totalCount: 7,
            edges: [
              {
                node: {
                  id: 'UmVwb3NpdG9yeTp6d2phcGI=',
                  name: 'demo-go',
                  vcsProvider: 'GITHUB',
                  ownerLogin: 'deepsourcelabs',
                  modifiedAt: '2023-02-01T12:45:50.053493+00:00',
                  isActivated: true,
                  isFork: false,
                  isPrivate: false,
                  isStarred: true,
                  latestCommitOid: 'cf64c729235234a4f59336a4005928ab2216846f',
                  defaultBranchName: 'master',
                  lastAnalyzedAt: '2022-10-03T10:49:47.035467+00:00',
                  availableAnalyzers: {
                    edges: [
                      {
                        node: {
                          id: 'QW5hbHl6ZXI6cnlieXZ6',
                          name: 'Go',
                          shortcode: 'go',
                          analyzerLogo:
                            'http://local-asgard-static-csv.s3.us-east-1.amazonaws.com/analyzer_logos/go.svg?v=1592555094'
                        }
                      },
                      {
                        node: {
                          id: 'QW5hbHl6ZXI6b2x6cW5i',
                          name: 'Dockerfile',
                          shortcode: 'docker',
                          analyzerLogo:
                            'http://local-asgard-static-csv.s3.us-east-1.amazonaws.com/analyzer_logos/docker.svg?v=1590404051'
                        }
                      }
                    ]
                  },
                  primaryAnalyzer: {
                    id: 'QW5hbHl6ZXI6cnlieXZ6',
                    name: 'Go',
                    shortcode: 'go',
                    analyzerLogo:
                      'http://local-asgard-static-csv.s3.us-east-1.amazonaws.com/analyzer_logos/go.svg?v=1592555094'
                  },
                  canBeActivated: true,
                  supportedAnalyzers: ['go']
                }
              },
              {
                node: {
                  id: 'UmVwb3NpdG9yeTp6ZXBqZWI=',
                  name: 'demo-python',
                  vcsProvider: 'GITHUB',
                  ownerLogin: 'deepsourcelabs',
                  modifiedAt: '2023-01-27T10:08:07.560393+00:00',
                  isActivated: true,
                  isFork: false,
                  isPrivate: false,
                  isStarred: true,
                  latestCommitOid: 'b3907ba96caa65668f3f8b96663f6629f607e860',
                  defaultBranchName: 'master',
                  lastAnalyzedAt: '2020-07-06T10:14:07.593783+00:00',
                  availableAnalyzers: {
                    edges: [
                      {
                        node: {
                          id: 'QW5hbHl6ZXI6bGtiZXZ6',
                          name: 'Python',
                          shortcode: 'python',
                          analyzerLogo:
                            'http://local-asgard-static-csv.s3.us-east-1.amazonaws.com/analyzer_logos/python.svg?v=1585728948'
                        }
                      }
                    ]
                  },
                  primaryAnalyzer: {
                    id: 'QW5hbHl6ZXI6bGtiZXZ6',
                    name: 'Python',
                    shortcode: 'python',
                    analyzerLogo:
                      'http://local-asgard-static-csv.s3.us-east-1.amazonaws.com/analyzer_logos/python.svg?v=1585728948'
                  },
                  canBeActivated: true,
                  supportedAnalyzers: ['python']
                }
              },
              {
                node: {
                  id: 'UmVwb3NpdG9yeTp6cXdwZ3o=',
                  name: 'bob-cli',
                  vcsProvider: 'GITHUB',
                  ownerLogin: 'deepsourcelabs',
                  modifiedAt: '2022-09-20T07:42:07.811123+00:00',
                  isActivated: true,
                  isFork: false,
                  isPrivate: true,
                  isStarred: true,
                  latestCommitOid: 'ad36dcec96660414d075b32fda0d7b4ccc46bbff',
                  defaultBranchName: 'master',
                  lastAnalyzedAt: '2020-06-18T19:34:18.873588+00:00',
                  availableAnalyzers: {
                    edges: [
                      {
                        node: {
                          id: 'QW5hbHl6ZXI6bGtiZXZ6',
                          name: 'Python',
                          shortcode: 'python',
                          analyzerLogo:
                            'http://local-asgard-static-csv.s3.us-east-1.amazonaws.com/analyzer_logos/python.svg?v=1585728948'
                        }
                      }
                    ]
                  },
                  primaryAnalyzer: {
                    id: 'QW5hbHl6ZXI6bGtiZXZ6',
                    name: 'Python',
                    shortcode: 'python',
                    analyzerLogo:
                      'http://local-asgard-static-csv.s3.us-east-1.amazonaws.com/analyzer_logos/python.svg?v=1585728948'
                  },
                  canBeActivated: true,
                  supportedAnalyzers: ['python']
                }
              },
              {
                node: {
                  id: 'UmVwb3NpdG9yeTp6bXhyeWI=',
                  name: 'atlas',
                  vcsProvider: 'GITHUB',
                  ownerLogin: 'deepsourcelabs',
                  modifiedAt: '2022-02-22T10:32:11.768641+00:00',
                  isActivated: true,
                  isFork: false,
                  isPrivate: true,
                  isStarred: false,
                  latestCommitOid: 'b44fb26c2a2e4e45cafe5e275367b47f9a56442d',
                  defaultBranchName: 'master',
                  lastAnalyzedAt: '2020-06-17T12:55:52.875763+00:00',
                  availableAnalyzers: {
                    edges: [
                      {
                        node: {
                          id: 'QW5hbHl6ZXI6cnlieXZ6',
                          name: 'Go',
                          shortcode: 'go',
                          analyzerLogo:
                            'http://local-asgard-static-csv.s3.us-east-1.amazonaws.com/analyzer_logos/go.svg?v=1592555094'
                        }
                      }
                    ]
                  },
                  primaryAnalyzer: null,
                  canBeActivated: true,
                  supportedAnalyzers: ['go', 'docker']
                }
              },
              {
                node: {
                  id: 'UmVwb3NpdG9yeTp6Z2tsZHo=',
                  name: 'marvin-javascript',
                  vcsProvider: 'GITHUB',
                  ownerLogin: 'deepsourcelabs',
                  modifiedAt: '2022-02-27T07:42:51.221976+00:00',
                  isActivated: true,
                  isFork: false,
                  isPrivate: true,
                  isStarred: false,
                  latestCommitOid: '2cc3e8c5000f9adc584b59c60746292c8494798a',
                  defaultBranchName: 'master',
                  lastAnalyzedAt: null,
                  availableAnalyzers: {
                    edges: []
                  },
                  primaryAnalyzer: null,
                  canBeActivated: true,
                  supportedAnalyzers: ['docker', 'javascript']
                }
              },
              {
                node: {
                  id: 'UmVwb3NpdG9yeTpib3BtZXo=',
                  name: 'git-label-packages',
                  vcsProvider: 'GITHUB',
                  ownerLogin: 'deepsourcelabs',
                  modifiedAt: '2020-06-04T09:59:47.893220+00:00',
                  isActivated: true,
                  isFork: true,
                  isPrivate: false,
                  isStarred: false,
                  latestCommitOid: '96346ebd1f541bbdf2ad848114aca42904f7fe74',
                  defaultBranchName: 'master',
                  lastAnalyzedAt: null,
                  availableAnalyzers: {
                    edges: []
                  },
                  primaryAnalyzer: null,
                  canBeActivated: true,
                  supportedAnalyzers: []
                }
              },
              {
                node: {
                  id: 'UmVwb3NpdG9yeTp6Z2tlZHo=',
                  name: 'beacon-py',
                  vcsProvider: 'GITHUB',
                  ownerLogin: 'deepsourcelabs',
                  modifiedAt: '2020-06-04T09:59:47.624723+00:00',
                  isActivated: true,
                  isFork: false,
                  isPrivate: false,
                  isStarred: false,
                  latestCommitOid: '98aef23f8915b11b7a415dbf840a3af166d92ca3',
                  defaultBranchName: 'master',
                  lastAnalyzedAt: null,
                  availableAnalyzers: {
                    edges: []
                  },
                  primaryAnalyzer: null,
                  canBeActivated: true,
                  supportedAnalyzers: ['python']
                }
              }
            ]
          },
          newRepos: {
            pageInfo: {},
            totalCount: 0,
            edges: []
          },
          repoWithActiveAnalysis: [
            {
              id: 'UmVwb3NpdG9yeTp6d2phcGI=',
              name: 'demo-go',
              vcsProvider: 'GITHUB',
              ownerLogin: 'deepsourcelabs',
              isActivated: true,
              isFork: false,
              isPrivate: false,
              lastAnalyzedAt: '2022-10-03T10:49:47.035467+00:00'
            },
            {
              id: 'UmVwb3NpdG9yeTp6ZXBqZWI=',
              name: 'demo-python',
              vcsProvider: 'GITHUB',
              ownerLogin: 'deepsourcelabs',
              isActivated: true,
              isFork: false,
              isPrivate: false,
              lastAnalyzedAt: '2020-07-06T10:14:07.593783+00:00'
            },
            {
              id: 'UmVwb3NpdG9yeTp6cXdwZ3o=',
              name: 'bob-cli',
              vcsProvider: 'GITHUB',
              ownerLogin: 'deepsourcelabs',
              isActivated: true,
              isFork: false,
              isPrivate: true,
              lastAnalyzedAt: '2020-06-18T19:34:18.873588+00:00'
            },
            {
              id: 'UmVwb3NpdG9yeTp6bXhyeWI=',
              name: 'atlas',
              vcsProvider: 'GITHUB',
              ownerLogin: 'deepsourcelabs',
              isActivated: true,
              isFork: false,
              isPrivate: true,
              lastAnalyzedAt: '2020-06-17T12:55:52.875763+00:00'
            },
            {
              id: 'UmVwb3NpdG9yeTp6Z2tsZHo=',
              name: 'marvin-javascript',
              vcsProvider: 'GITHUB',
              ownerLogin: 'deepsourcelabs',
              isActivated: true,
              isFork: false,
              isPrivate: true,
              lastAnalyzedAt: null
            }
          ],
          repoWithActiveAnalysisWithAnalyzers: [
            {
              id: 'UmVwb3NpdG9yeTp6d2phcGI=',
              name: 'demo-go',
              vcsProvider: 'GITHUB',
              ownerLogin: 'deepsourcelabs',
              isActivated: true,
              isFork: false,
              isPrivate: false,
              lastAnalyzedAt: '2022-10-03T10:49:47.035467+00:00',
              availableAnalyzers: {
                edges: [
                  {
                    node: {
                      id: 'QW5hbHl6ZXI6cnlieXZ6',
                      name: 'Go',
                      shortcode: 'go',
                      analyzerLogo:
                        'http://local-asgard-static-csv.s3.us-east-1.amazonaws.com/analyzer_logos/go.svg?v=1592555094'
                    }
                  },
                  {
                    node: {
                      id: 'QW5hbHl6ZXI6b2x6cW5i',
                      name: 'Dockerfile',
                      shortcode: 'docker',
                      analyzerLogo:
                        'http://local-asgard-static-csv.s3.us-east-1.amazonaws.com/analyzer_logos/docker.svg?v=1590404051'
                    }
                  }
                ]
              }
            },
            {
              id: 'UmVwb3NpdG9yeTp6ZXBqZWI=',
              name: 'demo-python',
              vcsProvider: 'GITHUB',
              ownerLogin: 'deepsourcelabs',
              isActivated: true,
              isFork: false,
              isPrivate: false,
              lastAnalyzedAt: '2020-07-06T10:14:07.593783+00:00',
              availableAnalyzers: {
                edges: [
                  {
                    node: {
                      id: 'QW5hbHl6ZXI6bGtiZXZ6',
                      name: 'Python',
                      shortcode: 'python',
                      analyzerLogo:
                        'http://local-asgard-static-csv.s3.us-east-1.amazonaws.com/analyzer_logos/python.svg?v=1585728948'
                    }
                  }
                ]
              }
            },
            {
              id: 'UmVwb3NpdG9yeTp6cXdwZ3o=',
              name: 'bob-cli',
              vcsProvider: 'GITHUB',
              ownerLogin: 'deepsourcelabs',
              isActivated: true,
              isFork: false,
              isPrivate: true,
              lastAnalyzedAt: '2020-06-18T19:34:18.873588+00:00',
              availableAnalyzers: {
                edges: [
                  {
                    node: {
                      id: 'QW5hbHl6ZXI6bGtiZXZ6',
                      name: 'Python',
                      shortcode: 'python',
                      analyzerLogo:
                        'http://local-asgard-static-csv.s3.us-east-1.amazonaws.com/analyzer_logos/python.svg?v=1585728948'
                    }
                  }
                ]
              }
            },
            {
              id: 'UmVwb3NpdG9yeTp6bXhyeWI=',
              name: 'atlas',
              vcsProvider: 'GITHUB',
              ownerLogin: 'deepsourcelabs',
              isActivated: true,
              isFork: false,
              isPrivate: true,
              lastAnalyzedAt: '2020-06-17T12:55:52.875763+00:00',
              availableAnalyzers: {
                edges: [
                  {
                    node: {
                      id: 'QW5hbHl6ZXI6cnlieXZ6',
                      name: 'Go',
                      shortcode: 'go',
                      analyzerLogo:
                        'http://local-asgard-static-csv.s3.us-east-1.amazonaws.com/analyzer_logos/go.svg?v=1592555094'
                    }
                  }
                ]
              }
            },
            {
              id: 'UmVwb3NpdG9yeTp6Z2tsZHo=',
              name: 'marvin-javascript',
              vcsProvider: 'GITHUB',
              ownerLogin: 'deepsourcelabs',
              isActivated: true,
              isFork: false,
              isPrivate: true,
              lastAnalyzedAt: null,
              availableAnalyzers: {
                edges: []
              }
            },
            {
              id: 'UmVwb3NpdG9yeTpib3BtZXo=',
              name: 'git-label-packages',
              vcsProvider: 'GITHUB',
              ownerLogin: 'deepsourcelabs',
              isActivated: true,
              isFork: true,
              isPrivate: false,
              lastAnalyzedAt: null,
              availableAnalyzers: {
                edges: []
              }
            },
            {
              id: 'UmVwb3NpdG9yeTp6Z2tlZHo=',
              name: 'beacon-py',
              vcsProvider: 'GITHUB',
              ownerLogin: 'deepsourcelabs',
              isActivated: true,
              isFork: false,
              isPrivate: false,
              lastAnalyzedAt: null,
              availableAnalyzers: {
                edges: []
              }
            }
          ],
          repoWithPendingAdhocRuns: []
        }
      }
    },
    overrides
  )
}
