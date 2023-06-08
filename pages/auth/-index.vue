<template>
  <div class="flex h-screen items-center justify-center p-4">
    <div class="mx-auto w-full max-w-3xl space-y-6 py-20 text-center">
      <video
        :poster="require('~/assets/images/ui-states/login/norris-hello.png')"
        autoplay
        muted
        playsinline
        class="mx-auto max-h-24"
      >
        <source src="~/assets/images/ui-states/login/norris-hello.webm" type="video/webm" />
      </video>
      <div class="space-y-2">
        <h1 class="text-base font-medium text-vanilla-100">Logging you in...</h1>
        <p class="mt-2 text-sm text-vanilla-400">
          Please wait while we redirect you to the dashboard
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'

import AuthMixin from '~/mixins/authMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import ContextMixin from '~/mixins/contextMixin'

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
  ]
})
export default class Auth extends mixins(AuthMixin, ActiveUserMixin, ContextMixin) {
  /**
   * Mounted hook for the "logging in..." page
   *
   * - This page fetches the `code` from the query parameters of the URL and `provider` from router meta and logs in the user.
   * - Once logged in, it fetches the active user's data and context.
   * - Next, it initializes the Intercom instances used for tracking purposes.
   *
   * Finally, it determines to which route should the user be forwarded to:
   * - If there is a `next` query parameter in the URL, it redirects the user to that URL.
   * - If not, it checks if user needs to be onboarded.
   *   - If the user needs to be onboared, it redirects user to the installation url of VCS provider.
   *   - If not, it sends user to their `userHomeUrl`.
   *
   * @returns {Promise<void>} Returns a `void` promise that resolves once function is complete.
   */
  async mounted(): Promise<void> {
    const { provider } = this.$route.meta as Record<string, string>
    const { code } = this.$route.query

    await this.logInUser({
      provider,
      code: code as string
    })

    await Promise.all([this.fetchActiveUser(), this.fetchContext()])

    if (!this.$config.onPrem && this.loggedIn) {
      // Identify the user via RudderStack
      const {
        avatar,
        email,
        dateJoined: createdAt,
        firstName,
        id,
        lastName
      } = this.$store.state.user.active.viewer

      if (id && email) {
        const userId = Buffer.from(id, 'base64').toString().toLowerCase().replace('user:', '')

        this.$sentry.setUser({
          email,
          id: userId
        })

        this.$rudder?.identify(userId, {
          avatar,
          createdAt,
          email,
          firstName,
          lastName
        })
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

  /**
   * ! This method overrides fetch calls in mixins, we do not want these calls till authentication is over.
   * ! Do not remove!
   *
   * @returns {Promise<void>} Returns a `void` promise that resolves once function is complete.
   */
  async fetch(): Promise<void> {
    //! empty call
  }
}
</script>
