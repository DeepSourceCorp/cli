import { Component, Vue, namespace } from 'nuxt-property-decorator'
import { AuthGetterTypes } from '~/store/account/auth'
import { ActiveUserActions, ActiveUserGetterTypes } from '~/store/user/active'

import {
  DeleteRequestingUserInput,
  SupportTierChoices,
  TeamMemberRoleChoices,
  UpdateDefaultDashboardContextForUserPayload,
  UpdateStarredRepositoryPayload,
  UpdateUserDetailsInput,
  User
} from '~/types/types'

const activeUserStore = namespace('user/active')
const authStore = namespace('account/auth')

export interface SubscribedPlanInfo {
  name: string
  slug: string
}

export interface TeamPermissions {
  permission: TeamMemberRoleChoices
  canAddMember: boolean
  isPrimaryUser: boolean
  hasAllRepoAccess: boolean
}

export const ACTIVE_CONTEXT_COOKIE_NAME = 'current-active-organization'
const COOKIE_SEPERATOR = '::'
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
  support_tier: SupportTierChoices
}
@Component
export default class ActiveUserMixin extends Vue {
  @activeUserStore.State
  viewer: User

  @activeUserStore.Getter(ActiveUserGetterTypes.GET_HOME_URL)
  userHomeUrl: string

  @activeUserStore.Action(ActiveUserActions.FETCH_VIEWER_INFO)
  fetchActiveUser: (args?: { refetch: boolean }) => Promise<void>

  @activeUserStore.Action(ActiveUserActions.FETCH_GITLAB_ACCOUNTS)
  fetchActiveUserGitlabAccounts: () => Promise<void>

  @activeUserStore.Action(ActiveUserActions.FETCH_GSR_PROJECTS)
  fetchActiveUserGSRProjects: () => Promise<void>

  @activeUserStore.Action(ActiveUserActions.FETCH_ADS_ORGANIZATIONS)
  fetchActiveUserADSOrganizations: () => Promise<void>

  @activeUserStore.Action(ActiveUserActions.FETCH_STARRED_REPOS)
  fetchStarredRepos: () => Promise<void>

  @activeUserStore.Action(ActiveUserActions.FETCH_ACCOUNT_INFO)
  fetchAccountInfo: (args: {
    login: string
    isViewerPrimaryUser: boolean
    refetch?: boolean
  }) => Promise<void>

  @activeUserStore.Action(ActiveUserActions.FETCH_WORKSPACES)
  fetchWorkspaces: (args: { login: string; refetch?: boolean }) => Promise<void>

  @activeUserStore.Action(ActiveUserActions.UPDATE_USER_DETAILS)
  updateUserDetails: (input: UpdateUserDetailsInput) => Promise<User | undefined>

  @activeUserStore.Action(ActiveUserActions.DELETE_USER)
  deleteUser: (input: DeleteRequestingUserInput) => Promise<boolean>

  // @activeUserStore.Action(ActiveUserActions.FETCH_ACTIVITY)
  // fetchActivityFeed: () => Promise<void>

  @activeUserStore.Action(ActiveUserActions.FETCH_RECOMMENDED_ISSUES)
  fetchRecommendedIssues: () => Promise<void>

  @activeUserStore.Action(ActiveUserActions.UPDATE_STARRED_REPO)
  updateStarredRepo: ({
    repoId,
    action
  }: {
    repoId: string
    action: 'ADD' | 'REMOVE'
  }) => Promise<UpdateStarredRepositoryPayload>

  @activeUserStore.Action(ActiveUserActions.UPDATE_DEFAULT_CONTEXT)
  updateDefaultContextAPI: (args: { contextOwnerId: string }) => {
    data: { updateDefaultDashboardContextForUser: UpdateDefaultDashboardContextForUserPayload }
  }

  @activeUserStore.Getter(ActiveUserGetterTypes.GET_HOME_URL)
  homeUrl: string

  @authStore.Getter(AuthGetterTypes.EXPIRY)
  jwtExpiry: number

  async fetch(): Promise<void> {
    await this.fetchActiveUserIfLoggedIn()
  }

  async fetchActiveUserIfLoggedIn(): Promise<void> {
    const now = (new Date().getTime() + 30_000) / 1000
    const expiry = this.jwtExpiry
    if (now < expiry) {
      await this.fetchActiveUser()
    }
  }

  /**
   * Set the active context in a cookie to be reused on next reload
   *
   * @param {string} provider
   * @param {string} owner
   * @return {void}
   */
  setActiveContextCookie(provider: string, owner: string): void {
    this.$cookies.remove(ACTIVE_CONTEXT_COOKIE_NAME)
    this.$cookies.set(ACTIVE_CONTEXT_COOKIE_NAME, [provider, owner].join(COOKIE_SEPERATOR))
  }

  /**
   * Log error to reporting service
   *
   * @param {Error} e
   * @param {string} context
   * @param {Record<string, unknown>} params
   *
   * @return {void}
   */
  public logErrorForUser(
    e: Error,
    context: string,
    params: Record<string, unknown>,
    toastMessage?: `${string}.` | undefined
  ): void {
    this.$logErrorAndToast(e, toastMessage, this.viewer, { context, params })
  }

  async refetchUser(): Promise<void> {
    await this.fetchActiveUser({ refetch: true })
  }

  get teamPerms(): TeamPermissions {
    const context = this.activeDashboardContext as DashboardContext
    return {
      permission: context.role,
      canAddMember: context.can_add_member,
      isPrimaryUser: context.is_primary_user_for_owner,
      hasAllRepoAccess: context.has_granted_all_repo_access
    }
  }

  get activeProvider(): string {
    if ('vcs_provider' in this.activeDashboardContext) {
      return this.activeDashboardContext.vcs_provider
    }
    return this.$route.params.provider
  }

  get activeProviderName(): string {
    return this.$providerMetaMap[this.activeProvider].text
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
    let { provider, owner } = this.$route.params

    if (!provider && !owner && this.$cookies.get(ACTIVE_CONTEXT_COOKIE_NAME)) {
      const contextInCookie: Array<string> = this.$cookies
        .get(ACTIVE_CONTEXT_COOKIE_NAME)
        .split(COOKIE_SEPERATOR)

      if (Object.keys(this.$providerMetaMap).includes(contextInCookie[0])) {
        provider = contextInCookie[0]
        owner = contextInCookie[1]
      }
    }

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
