<template>
  <div
    class="text-vanilla-100 flex flex-col items-center justify-center min-h-screen max-w-md mx-auto"
  >
    <div class="p-6 lg:text-left flex flex-col">
      <div class="mb-12">
        <img
          src="~/assets/images/logo-wordmark-white.svg"
          alt="DeepSource Logo"
          class="h-6 w-auto"
        />
      </div>
      <h1 class="leading-tight text-3xl font-bold sm:text-left">Log in to DeepSource</h1>
      <div class="flex flex-col items-center mt-8 space-y-4 left-section__btn-group">
        <a
          v-for="opt in loginOptions"
          :key="opt.provider"
          :href="opt.link ? opt.link : buildUrl(opt.provider)"
          class="w-full flex items-center left-section__btn"
        >
          <button
            class="
              p-2
              text-vanilla-100
              w-full
              space-x-2
              flex
              items-center
              rounded-sm
              justify-center
              hover:bg-opacity-90
            "
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
          class="w-full flex items-center left-section__btn"
        >
          <button
            class="
              p-2
              text-vanilla-100
              w-full
              space-x-2
              flex
              items-center
              rounded-sm
              justify-center
              hover:bg-opacity-90
              bg-robin
            "
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
  ],
  head() {
    return {
      title: 'Login — DeepSource',
      link: [
        {
          rel: 'canonical',
          href: `https://${this.$config.domain}/login`
        }
      ]
    }
  }
})
export default class SignUp extends mixins(AuthMixin) {
  public samlClicked = false
}
</script>
