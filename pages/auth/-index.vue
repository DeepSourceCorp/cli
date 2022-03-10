<template>
  <div class="flex items-center justify-center h-screen">
    <div class="text-center">
      <div class="mb-5 text-4xl text-center">{{ emoji }}</div>
      <h1 class="text-xl font-semibold text-vanilla-100">Logging you in...</h1>
      <p class="max-w-xs mt-2 text-vanilla-400">
        Please wait while we redirect you to the dashboard
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import AuthMixin from '~/mixins/authMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import ContextMixin from '~/mixins/contextMixin'
import { User } from '~/types/types'

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

    if (!this.$config.onPrem) {
      // Identify user with PostHog
      const { id, email, fullName, dateJoined } = this.$store.state.user.active.viewer as User
      const parsedId = atob(id).replace('User:', '')
      this.$posthog.identify(parsedId, { email, fullName, createdAt: dateJoined })
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

  get emoji(): string {
    const today = new Date()
    if (today.getMonth() === 9 && today.getDate() === 31) {
      // Halloween
      return '🎃'
    }
    if (today.getMonth() === 11 && today.getDate() >= 20) {
      // Christmas
      const christmasEmojis = ['☃️', '🔔', '🎄']
      return christmasEmojis[Math.floor(Math.random() * christmasEmojis.length)]
    }
    return '👋'
  }
}
</script>
