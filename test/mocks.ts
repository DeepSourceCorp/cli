import { providerMetaMap } from '~/plugins/helpers/provider'
import { VcsProviderChoices } from '~/types/types'

export const mocksGenerator: (overrides?: Record<string, unknown>) => Record<string, unknown> = (
  overrides = {}
) => {
  return Object.assign(
    {
      $route: {
        name: 'provider-owner-repo',
        params: {
          provider: 'gh',
          owner: 'deepsourcelabs',
          repo: 'bifrost'
        }
      },
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
      $toast: {
        danger: jest.fn(),
        success: jest.fn(),
        show: jest.fn()
      },
      $providerMetaMap: providerMetaMap,
      $generateRoute: jest.fn((paths: string[], includeRepoInPath = true) => {
        if (!Array.isArray(paths)) {
          paths = []
        }
        const path = paths.join('/')
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
            emptyAvatarUrl: ''
          }
        }
      },
      'account/auth': {
        namespaced: true,
        state: {
          loggedIn: true
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
