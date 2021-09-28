<template>
  <div class="h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="text-4xl text-center mb-5">👋</div>
      <h1 class="text-xl text-vanilla-100 font-semibold">Logging you in...</h1>
      <p class="text-vanilla-400 mt-2 max-w-xs">
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

    if (window.Intercom && typeof window.Intercom === 'function' && !this.$config.onPrem) {
      const viewer = this.$store.state.user.active.viewer as User
      if (viewer.intercomUserHash)
        Intercom('update', {
          name: viewer.fullName || undefined,
          user_id: viewer.id,
          email: viewer.email,
          created_at: viewer.dateJoined,
          user_hash: viewer.intercomUserHash
        })
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
}
</script>
