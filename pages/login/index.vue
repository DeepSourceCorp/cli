<template>
  <hero-layout>
    <template #title>
      <span>
        {{ samlLogin ? "What's your email address?" : 'Log in to DeepSource' }}
      </span>
    </template>
    <!-- <transition-group tag="div" name="move-up" mode="out-in" class="w-full"> -->
    <!-- <template> -->
    <div v-if="!samlLogin" key="base-login" class="grid w-full gap-y-4">
      <a
        v-for="opt in loginOptions"
        :key="opt.provider"
        :href="opt.link ? opt.link : buildUrl(opt.provider)"
        class="login-btn flex items-center justify-center gap-x-3 rounded-md p-3"
        :class="[`login-btn-${opt.icon}`]"
      >
        <z-icon :icon="opt.icon" size="base" />
        <span>Continue with {{ opt.label }}</span>
      </a>
    </div>
    <div v-else key="saml-login" class="mb-5 w-full">
      <z-input
        v-model="samlEmail"
        type="email"
        placeholder="Enter your email address..."
        class="border-ink-200"
      />
      <div v-if="samlLoginError" class="mt-1 flex items-center gap-x-1 text-sm text-cherry">
        <z-icon icon="alert-circle" color="current" />
        <span>SSO is not set up for your domain.</span>
      </div>
    </div>
    <template v-if="$config.enableSaml">
      <hr
        v-if="loginOptions.length && !samlLogin"
        :key="`hr-${loginOptions.length && !samlLogin}`"
        class="my-6 w-full border-slate-400"
      />
      <a
        v-if="$config.onPrem"
        :key="`a-${samlLogin}-${$config.onPrem}`"
        href="/saml2/login"
        class="login-btn flex w-full items-center justify-center gap-x-3 rounded-md p-3"
      >
        <z-icon icon="key-2" color="vanilla-100" />
        <span>Continue with SSO</span>
      </a>
      <button
        v-else
        :key="`btn-${samlLogin}-${$config.onPrem}`"
        :disabled="samlLoginLoading"
        class="login-btn flex w-full items-center justify-center gap-x-3 rounded-md p-3"
        :class="{ 'login-btn-no-hover cursor-not-allowed': samlLoginLoading }"
        @click="nextSamlAction"
      >
        <z-icon
          :icon="samlLoginLoading ? 'spin-loader' : 'key-2'"
          color="vanilla-100"
          :class="{ 'animate-spin': samlLoginLoading }"
        />
        <span>Continue with SSO</span>
      </button>
    </template>
    <button
      v-if="samlLogin"
      :key="samlLogin"
      class="mx-auto mt-5 flex items-center gap-x-2 text-sm text-vanilla-400 hover:text-vanilla-100"
      @click="resetSamlLogin"
    >
      <z-icon icon="arrow-left" />
      <span> Back to login </span>
    </button>
    <p class="mt-6 text-sm leading-6 text-slate-200">
      By continuing, you are agreeing to our
      <a
        href="https://deepsource.com/legal/terms"
        class="text-vanilla-400 hover:text-vanilla-100 focus:text-vanilla-100"
        >Terms of Service</a
      >,
      <a
        href="https://deepsource.com/legal/msa"
        class="text-vanilla-400 hover:text-vanilla-100 focus:text-vanilla-100"
        >Master Subscription Agreement</a
      >
      and
      <a
        href="https://deepsource.com/legal/privacy"
        class="text-vanilla-400 hover:text-vanilla-100 focus:text-vanilla-100"
        >Privacy Policy</a
      >.
    </p>
    <!-- </template> -->
    <!-- </transition-group> -->
  </hero-layout>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { Context } from '@nuxt/types'
import { ZInput, ZIcon } from '@deepsource/zeal'

// Import State & Types
import AuthMixin from '~/mixins/authMixin'
import MetaMixin from '~/mixins/metaMixin'
import { AuthActionTypes } from '~/store/account/auth'
import cloudSamlQuery from '@/apollo/queries/auth/cloudSaml.gql'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'

@Component({
  components: {
    ZInput,
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
export default class SignIn extends mixins(AuthMixin, MetaMixin) {
  metaTitle = 'Login - DeepSource'
  setCanonical = true
  samlLogin = false
  samlLoginError = false
  samlLoginLoading = false
  samlEmail = ''

  /**
   * Reset input data and UI state from login via SAML to normal login
   */
  resetSamlLogin() {
    this.samlLogin = false
    this.samlLoginError = false
    this.samlEmail = ''
  }

  /**
   * Perform next action on "Continue with SSO" button click
   *
   * - If the UI is in SAML login mode, run the SAML login verification method {@link verifySamlLogin}
   * - If the UI is in normal login mode, toggle on the SAML login mode
   */
  nextSamlAction() {
    if (this.samlLogin && this.samlEmail) {
      this.verifySamlLogin()
      return
    }
    this.samlLogin = true
  }

  /**
   * Verify user's email for SAML login. If valid, redirect user to the SAML login endpoint.
   */
  async verifySamlLogin() {
    this.samlLoginLoading = true
    try {
      const samlLoginResponse = (await this.$fetchGraphqlData(
        cloudSamlQuery,
        { email: this.samlEmail },
        true
      )) as GraphqlQueryResponse

      const samlAuthUrl = samlLoginResponse.data.saml2LoginUrl

      if (samlAuthUrl) {
        location.href = samlAuthUrl
      } else {
        this.samlLoginError = true
        this.samlLoginLoading = false
      }
    } catch (e) {
      const loginError = e as Error
      this.$logErrorAndToast(
        loginError,
        loginError.message.replace('GraphQL error: ', '') as `{string}.`
      )
      this.samlLoginLoading = false
    }
  }
}
</script>

<style lang="postcss" scoped>
@tailwind base;
@tailwind utilities;

.move-up-enter-active {
  transition: all 250ms ease-out 100ms;
}

/* .move-up-leave-active {
  transition: all 0ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
} */

/* .move-up-leave-to, */
.move-up-enter {
  transform: translateY(20px);
  opacity: 0;
}

/* Login buttons */

.login-btn {
  border: theme('spacing.px') solid theme('colors.transparent');
  background: linear-gradient(theme(colors.ink.200), theme(colors.ink.200)) padding-box,
    linear-gradient(113.04deg, #393c43 14.99%, #282b33 77.27%) border-box;
}

.login-btn:hover {
  background: linear-gradient(#303540, #303540) padding-box,
    linear-gradient(113.04deg, #454a54 14.99%, #454a54 77.27%) border-box;
}

.login-btn-no-hover:hover {
  border: theme('spacing.px') solid theme('colors.transparent');
  background: linear-gradient(theme(colors.ink.200), theme(colors.ink.200)) padding-box,
    linear-gradient(113.04deg, #393c43 14.99%, #282b33 77.27%) border-box;
}

.login-btn-github {
  background: linear-gradient(theme(colors.ink.200), theme(colors.ink.200)) padding-box,
    linear-gradient(113.04deg, #393c43 14.99%, #282b33 77.27%) border-box;
}

.login-btn-github:hover {
  background: linear-gradient(#303540, #303540) padding-box,
    linear-gradient(113.04deg, #454a54 14.99%, #454a54 77.27%) border-box;
}

.login-btn-gitlab {
  background: linear-gradient(90.54deg, #1b1928 2.76%, #1b1928 99.43%) padding-box,
    linear-gradient(113.04deg, #2a2740 14.99%, #1f1b2f 77.27%) border-box;
}

.login-btn-gitlab:hover {
  background: linear-gradient(#282246, #282246) padding-box,
    linear-gradient(113.04deg, #352e59 14.99%, #352e59 77.27%) border-box;
}

.login-btn-bitbucket {
  background: linear-gradient(#1c243e, #1c243e) padding-box,
    linear-gradient(113.04deg, #313a52 14.99%, #1f2943 77.27%) border-box;
}

.login-btn-bitbucket:hover {
  background: linear-gradient(#1c2a58, #1c2a58) padding-box,
    linear-gradient(113.04deg, #37446c 14.99%, #37446c 77.27%) border-box;
}

.login-btn-gsr {
  background: linear-gradient(theme(colors.ink.200), theme(colors.ink.200)) padding-box,
    linear-gradient(113.04deg, #393c43 14.99%, #282b33 77.27%) border-box;
}

.login-btn-gsr:hover {
  background: linear-gradient(#303540, #303540) padding-box,
    linear-gradient(113.04deg, #454a54 14.99%, #454a54 77.27%) border-box;
}
</style>
