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
  async mounted() {
    const { provider } = this.$route.meta
    const { code } = this.$route.query

    await this.logInUser({
      provider,
      code: code as string
    })

    await Promise.all([this.fetchActiveUser(), this.fetchContext()])

    if (!this.$config.onPrem) {
      const viewer = this.$store.state.user.active.viewer as User
      if (window.Intercom && typeof window.Intercom === 'function') {
        if (viewer.intercomUserHash)
          Intercom('update', {
            name: viewer.fullName || undefined,
            user_id: viewer.id,
            email: viewer.email,
            created_at: viewer.dateJoined,
            user_hash: viewer.intercomUserHash
          })
      }

      // Identify user with PostHog
      const { id, email, fullName, dateJoined } = viewer
      this.$posthog.identify(id, { email, fullName, createdAt: dateJoined })
    }

    const toOnboard = this.toOnboard
    const homePage = this.userHomeUrl
    const installationUrl = this.contextInstallationUrl(provider)
    const nextUrl = this.$nuxt.$cookies.get('bifrost-post-auth-redirect')

    // A next URL with installation will happen only if the user is
    // coming from GitHub marketplace installation
    // Removing this snippet will break marketplace installation
    if (nextUrl?.startsWith('/installation')) {
      this.$router.push(nextUrl)
      return
    }

    if (!toOnboard) {
      // In case the user is landing for the first time
      // onboarding and installation will always take precedence
      if (nextUrl) {
        this.$nuxt.$cookies.remove('bifrost-post-auth-redirect')
        this.$router.push(nextUrl)
        return
      }

      this.$router.push(homePage)
      return
    }

    this.$router.push(installationUrl)
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
