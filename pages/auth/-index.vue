<template>
  <hero-layout>
    <template v-if="checkingAccess || requestAccess" #header>
      <div class="flex justify-between">
        <div class="flex items-center">
          <z-icon icon="logo" />

          <z-divider
            color="ink-200"
            direction="vertical"
            margin="ml-3 mr-1.5"
            class="hidden sm:block"
          />

          <logout-menu v-bind="logoutMenuProps" @sign-out="signOut" />
        </div>

        <a
          v-if="$config.supportEmail"
          :href="`mailto:${$config.supportEmail}`"
          class="hidden h-9 items-center gap-2 rounded-sm border border-slate-400 px-3 py-1 text-sm text-vanilla-400 hover:bg-ink-300 focus:bg-ink-300 sm:flex"
        >
          <z-icon icon="support" />
          <span>Get help</span>
        </a>
      </div>
    </template>
    <template #body>
      <request-access
        v-if="requestAccess"
        :superuser-list="superusers"
        :total-superuser-count="totalSuperuserCount"
        :installation-logo="installationLogo"
        :loading="fetchingSuperusers"
      />

      <div v-else class="w-full max-w-3xl space-y-6 py-20 text-center">
        <template v-if="isOnPremGithub">
          <picture v-show="checkingAccess">
            <source srcset="~/assets/loader/checking-access.webp" type="image/webp" />
            <img
              src="~/assets/loader/checking-access.png"
              alt=""
              class="mx-auto w-11/12 max-w-2xl"
            />
          </picture>
        </template>

        <video
          v-show="!checkingAccess"
          poster="~/assets/images/ui-states/login/norris-hello.png"
          autoplay
          loop
          muted
          playsinline
          class="mx-auto max-h-24"
        >
          <source src="~/assets/images/ui-states/login/norris-hello.webm" type="video/webm" />
        </video>

        <div class="mx-auto max-w-md space-y-2">
          <h1 class="text-base font-medium text-vanilla-100">
            {{ checkingAccess ? 'Checking for your access' : 'Logging you in' }}...
          </h1>
          <p class="mt-2 text-sm text-vanilla-400">
            {{
              checkingAccess
                ? 'Give us a moment while we check for teams in this organization you have access to.'
                : 'Please wait while we redirect you to the dashboard.'
            }}
          </p>
        </div>
      </div>
    </template>
  </hero-layout>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'

import type { apiObject } from 'rudder-sdk-js'

import { getDefaultAvatar } from '~/utils/ui'

import AuthMixin from '~/mixins/authMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import ContextMixin from '~/mixins/contextMixin'

import { enterpriseUserDetail } from '~/apollo/queries/user/active/enterpriseUserDetail.gql'
import { superuserList } from '~/apollo/queries/enterprise/superuserList.gql'

import { EnterpriseUser, VcsProviderChoices } from '~/types/types'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'

import { resolveNodes } from '~/utils/array'

/**
 * Auth page that is responsible for logging in the user with `code` from providers.
 */
@Component({
  middleware: [
    async ({ route }) => {
      const { code } = route.query
      if (!route.meta) {
        throw new Error('Something went wrong while logging you in.')
      }

      if (!code) {
        throw new Error('Authorization code missing in redirect.')
      }
    }
  ],
  methods: {
    getDefaultAvatar
  }
})
export default class Auth extends mixins(AuthMixin, ActiveUserMixin, ContextMixin) {
  checkingAccess = false
  requestAccess = false

  isSuperUser = false
  superusers: Array<EnterpriseUser> = []
  totalSuperuserCount = 0
  installationLogo = ''
  fetchingSuperusers = false

  /**
   * Mounted hook for the "logging in..." page
   *
   * - This page fetches the `code` from the query parameters of the URL and `provider` from router meta and logs in the user.
   * - Once logged in, it fetches the active user's data and context.
   * - Next, it initializes the rudderstack & sentry instances used for tracking purposes.
   *
   * Finally, it determines to which route should the user be forwarded to:
   * - If there is a `next` query parameter in the URL, it redirects the user to that URL.
   * - If not, it checks if user needs to be onboarded.
   *   - If the user needs to be onboarded:
   *      - if on-prem, provider is GitHub and current user is not super user, wait for user-teams-sync websocket event.
   *      - else, it redirects user to the installation url of VCS provider.
   *   - If not required to onboard, it sends user to their `userHomeUrl`.
   *
   * @returns {Promise<void>} Returns a `void` promise that resolves once function is complete.
   */
  async mounted(): Promise<void> {
    const { provider, authProvider } = this.$route.meta as Record<string, string>
    const { code } = this.$route.query
    const { appId } = this.$route.params

    if (this.isOnPremGithub) {
      this.$socket.$on('user-teams-sync', this.handleUserTeamsSynced)
    }

    await this.logInUser({
      provider: authProvider,
      code: code as string,
      appId: appId as string
    })

    await Promise.all([
      this.fetchActiveUser(),
      this.fetchContext(),
      // No need to to fetch enterprise user details if not on enterprise with GitHub as VCS provider
      this.isOnPremGithub ? this.fetchEnterpriseUserDetails() : Promise.resolve()
    ])

    if (!this.$config.onPrem && this.loggedIn) {
      // Identify the user via RudderStack
      const { avatar, email, dateJoined: createdAt, firstName, id, lastName } = this.viewer

      if (id && email) {
        const userId = Buffer.from(id, 'base64').toString().toLowerCase().replace('user:', '')

        this.$sentry.setUser({
          email,
          id: userId
        })

        const traits: apiObject = {
          createdAt,
          email,
          firstName,
          lastName,
          avatar: avatar ?? undefined
        }

        this.$rudder?.identify(userId, traits)
      }

      // Identify the team via RudderStack
      const {
        avatar_url: team_avatar_url,
        id: groupId,
        subscribed_plan_info,
        team_name,
        type,
        vcs_provider_display
      } = this.activeDashboardContext

      // Invoke `$rudder.group` only for team accounts
      if (groupId && team_name && type === 'team') {
        const stringifiedGroupId = String(groupId)

        this.$rudder?.group(stringifiedGroupId, {
          groupType: 'organization',
          avatar: team_avatar_url,
          name: team_name,
          plan:
            typeof subscribed_plan_info === 'object'
              ? subscribed_plan_info.name
              : subscribed_plan_info,
          vcsProvider: vcs_provider_display
        })
      }
    }

    const toOnboard = this.toOnboard
    const homePage = this.userHomeUrl
    const installationUrl = this.installationUrls[provider]
    const nextUrl = this.$nuxt.$cookies.get('bifrost-post-auth-redirect')

    if (toOnboard && this.isOnPremGithub && !this.isSuperUser) {
      this.checkingAccess = true
      return
    }

    if (nextUrl) {
      this.$nuxt.$cookies.remove('bifrost-post-auth-redirect')
      this.$router.push(nextUrl)
      return
    }

    if (toOnboard) {
      installationUrl.startsWith('http')
        ? window.location.assign(installationUrl)
        : this.$router.push(installationUrl)

      return
    }

    this.$router.push(homePage)
  }

  beforeDestroy(): void {
    if (this.isOnPremGithub) {
      this.$socket.$off('user-teams-sync', this.handleUserTeamsSynced)
    }
  }

  /**
   * ! This method overrides fetch calls in mixins, we do not want these calls till authentication is over.
   * ! Do not remove!
   *
   * @returns {Promise<void>} Returns a `void` promise that resolves once function is complete.
   */
  async fetch(): Promise<void> {
    //! empty call
  }

  // Fetch data for the enterprise user
  async fetchEnterpriseUserDetails(): Promise<void> {
    try {
      const { id } = this.viewer

      const response = (await this.$fetchGraphqlData(
        enterpriseUserDetail,
        {}
      )) as GraphqlQueryResponse

      this.isSuperUser = response.data.isViewerSuperadmin ?? false
      this.installationLogo = response.data.enterprise?.installation?.logo ?? ''
    } catch (e) {
      this.$logErrorAndToast(
        e as Error,
        'Unable to fetch user details for the installation. Please contact support.'
      )
    }
  }
  // Fetch list of enterprise super users
  async fetchSuperUsers(): Promise<void> {
    this.fetchingSuperusers = true

    try {
      const response = (await this.$fetchGraphqlData(superuserList, {})) as GraphqlQueryResponse

      this.superusers = resolveNodes(response.data.enterprise?.superusers)
      this.totalSuperuserCount = response.data.enterprise?.superusers?.totalCount ?? 0
    } catch (e) {
      this.$logErrorAndToast(
        e as Error,
        'Unable to fetch details for the installation. Please contact support.'
      )
    } finally {
      this.fetchingSuperusers = false
    }
  }

  async handleUserTeamsSynced(data: { user_teams_count: number }) {
    if (data.user_teams_count > 0) {
      this.$router.push('/dashboard')
      return
    }
    this.checkingAccess = false
    this.requestAccess = true
    await this.fetchSuperUsers()
  }

  get logoutMenuProps() {
    const { avatar, email, fullName } = this.viewer
    return {
      avatar,
      email,
      fullName
    }
  }

  // Getter to check if user is on an onPrem installation with GitHub as VCS provider
  get isOnPremGithub(): boolean {
    return (
      this.$config.onPrem &&
      this.$route.meta?.provider === this.$providerMetaMap[VcsProviderChoices.Github].value
    )
  }
}
</script>
