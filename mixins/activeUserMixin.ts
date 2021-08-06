import { Component, Vue, namespace } from 'nuxt-property-decorator'
import { AuthGetterTypes } from '~/store/account/auth'
import { ActiveUserActions, ActiveUserGetterTypes } from '~/store/user/active'

import {
  TeamMemberRoleChoices,
  UpdateDefaultDashboardContextForUserPayload,
  User
} from '~/types/types'

const activeUserStore = namespace('user/active')
const authStore = namespace('account/auth')

export interface SubscribedPlanInfo {
  name: string
  slug: string
}

export interface DashboardContext {
  id: number
  login: string
  gql_node_id: string
  avatar_url: string
  vcs_provider: string
  vcs_provider_display: string
  vcs_installation_id: string
  type: string
  num_members_total: number
  is_default: boolean
  has_premium_plan: boolean
  has_gh_education_plan: false
  subscription_created: boolean
  is_primary_user_for_owner: boolean
  can_add_member: boolean
  has_granted_all_repo_access: boolean
  app_configuration_url: string
  role: TeamMemberRoleChoices
  team_name: string
  vcs_url: string
  subscribed_plan_info: SubscribedPlanInfo
}
@Component
export default class ActiveUserMixin extends Vue {
  @activeUserStore.State
  viewer: User

  @activeUserStore.State('loading')
  viewerLoading: boolean

  @activeUserStore.Action(ActiveUserActions.FETCH_VIEWER_INFO)
  fetchActiveUser: (args?: { refetch: boolean }) => Promise<void>

  @activeUserStore.Action(ActiveUserActions.FETCH_STARRED_REPOS)
  fetchStarredRepos: () => Promise<void>

  @activeUserStore.Action(ActiveUserActions.FETCH_ACTIVITY)
  fetchActivityFeed: () => Promise<void>

  @activeUserStore.Action(ActiveUserActions.FETCH_RECOMMENDED_ISSUES)
  fetchRecommendedIssues: () => Promise<void>

  @activeUserStore.Action(ActiveUserActions.UPDATE_STARRED_REPO)
  updateStarredRepo: ({
    repoId,
    action
  }: {
    repoId: string
    action: 'ADD' | 'REMOVE'
  }) => Promise<void>

  @activeUserStore.Action(ActiveUserActions.UPDATE_DEFAULT_CONTEXT)
  updateDefaultContextAPI: (args: {
    contextOwnerId: string
  }) => {
    data: { updateDefaultDashboardContextForUser: UpdateDefaultDashboardContextForUserPayload }
  }

  @activeUserStore.Getter(ActiveUserGetterTypes.GET_HOME_URL)
  homeUrl: string

  @authStore.Getter(AuthGetterTypes.EXPIRY)
  jwtExpiry: number

  async fetch(): Promise<void> {
    const now = (new Date().getTime() + 30_000) / 1000
    const expiry = this.jwtExpiry
    if (now < expiry) {
      await this.fetchActiveUser()
    }
  }

  public logSentryErrorForUser(e: Error, context: string, params: Record<string, unknown>): void {
    if (!this.$config.sentry?.disabled) {
      this.$sentry.withScope(() => {
        this.$sentry.setUser({ email: this.viewer.email })
        this.$sentry.setContext(context, params)
        this.$sentry.captureException(e)
      })
    }
  }

  async refetchUser(): Promise<void> {
    await this.fetchActiveUser({ refetch: true })
  }

  get activeProvider(): string {
    if ('vcs_provider' in this.activeDashboardContext) {
      return this.activeDashboardContext.vcs_provider
    }
    return this.$route.params.provider
  }

  get activeOwner(): string {
    if ('login' in this.activeDashboardContext) {
      return this.activeDashboardContext.login
    }
    return this.$route.params.owner
  }

  private isContextAllowed(provider: string, owner: string): boolean {
    if (provider === undefined || owner === undefined) {
      return false
    }

    if (this.viewer.dashboardContext) {
      return (
        this.viewer.dashboardContext.filter((context: DashboardContext) => {
          return context.vcs_provider === provider && context.login === owner
        }).length > 0
      )
    }

    return false
  }

  get defaultDashbaordContext(): DashboardContext | null {
    if (this.viewer.dashboardContext) {
      const contextArray = this.viewer.dashboardContext.filter((context: DashboardContext) => {
        return context.is_default
      })

      if (contextArray.length > 0) {
        return contextArray[0]
      }
    }
    return null
  }

  get primaryDashboardContext(): DashboardContext | null {
    if (this.viewer.dashboardContext) {
      const primaryAccounts = this.viewer.dashboardContext.filter((context: DashboardContext) => {
        return context.is_primary_user_for_owner
      })

      if (primaryAccounts.length > 0) {
        return primaryAccounts[0]
      }
    }
    return null
  }

  get activeDashboardContext(): DashboardContext | Record<string, string> {
    // fetch provider and owner
    const { provider, owner } = this.$route.params

    // check if the context is present in the list of allowed contexts for the usert
    if (!this.isContextAllowed(provider, owner)) {
      // if not present, send the default dashboard context if available
      if (this.defaultDashbaordContext) {
        return this.defaultDashbaordContext
      }

      // or send the primary dashbaord context if available
      if (this.primaryDashboardContext) {
        return this.primaryDashboardContext
      }
    }

    // if the context is allowed, send it as is
    if (this.viewer.dashboardContext) {
      const activeContext = this.viewer.dashboardContext.filter((context: DashboardContext) => {
        return context.vcs_provider === provider && context.login === owner
      })

      if (activeContext.length >= 1) {
        return activeContext[0]
      }
    }

    // if nothing works, send the first dashboard context
    return this.viewer?.dashboardContext?.[0] || {}
  }
}
