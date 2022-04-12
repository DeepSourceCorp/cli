<template>
  <div
    class="flex flex-col items-center justify-center max-w-md min-h-screen mx-auto text-vanilla-100"
  >
    <div class="flex flex-col p-6 lg:text-left">
      <div class="mb-12">
        <img
          src="~/assets/images/logo-wordmark-white.svg"
          alt="DeepSource Logo"
          class="w-auto h-6"
        />
      </div>
      <h1 class="text-3xl font-bold leading-tight sm:text-left">Log in to DeepSource</h1>
      <div class="flex flex-col items-center mt-8 space-y-4 left-section__btn-group">
        <a
          v-for="opt in loginOptions"
          :key="opt.provider"
          :href="opt.link ? opt.link : buildUrl(opt.provider)"
          class="flex items-center w-full left-section__btn"
        >
          <button
            class="flex items-center justify-center w-full p-2 space-x-2 rounded-sm text-vanilla-100 hover:bg-opacity-90"
            :class="opt.bg"
          >
            <z-icon :icon="opt.icon" :color="opt.iconColor" />
            <span>Continue with {{ opt.label }}</span>
          </button>
        </a>
        <a
          v-if="$config.enableSaml"
          href="/saml2/login"
          @click="samlClicked = true"
          class="flex items-center w-full left-section__btn"
        >
          <button
            class="flex items-center justify-center w-full p-2 space-x-2 rounded-sm text-vanilla-100 hover:bg-opacity-90 bg-robin"
          >
            <z-icon
              :icon="samlClicked ? 'spin-loader' : 'shield'"
              :color="samlClicked ? 'vanilla-100 animate-spin' : 'vanilla-100'"
            />
            <span>Continue with SSO</span>
          </button>
        </a>
      </div>
      <div class="mt-8 text-vanilla-400" v-if="!$config.onPrem">
        Don't have an account?
        <nuxt-link to="/signup" class="text-juniper hover:underline">Sign up</nuxt-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { Context } from '@nuxt/types'
import { ZButton, ZIcon } from '@deepsourcelabs/zeal'
// Import State & Types
import AuthMixin from '~/mixins/authMixin'
import { AuthActionTypes } from '~/store/account/auth'
import MetaMixin from '~/mixins/metaMixin'

@Component({
  components: {
    ZButton,
    ZIcon
  },
  middleware: [
    'redirectToHome',
    async function ({ redirect, route, $config, store }: Context): Promise<void> {
      const { provider } = route.query
      await store.dispatch(`account/auth/${AuthActionTypes.FETCH_AUTH_URLS}`)
      const authUrls = store.state.account.auth.authUrls

      const validProviders = [
        ...($config.githubEnabled ? ['github'] : []),
        ...($config.gitlabEnabled ? ['gitlab'] : []),
        ...($config.bitbucketEnabled ? ['bitbucket'] : [])
      ]

      if (provider && typeof provider === 'string' && validProviders.includes(provider)) {
        // 307 is temporary redirect
        redirect(307, authUrls[provider])
      }
    }
  ]
})
export default class SignUp extends mixins(AuthMixin, MetaMixin) {
  public samlClicked = false
  metaTitle = 'Login - DeepSource'
  setCanonical = true
}
</script>
