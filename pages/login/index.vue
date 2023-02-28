<template>
  <div class="relative min-h-screen overflow-hidden">
    <div class="bg-login-gradient"></div>
    <div
      class="flex flex-col h-full min-h-screen px-5 lg:px-10 py-6 lg:py-8 z-10 absolute inset-0 overflow-y-auto"
    >
      <div class="flex-grow flex items-center justify-center py-8">
        <div class="flex flex-col items-center w-full sm:max-w-sm">
          <div class="deepsource-logo">
            <svg
              width="37"
              height="42"
              viewBox="0 0 37 42"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M9.69967 11.9517H21.6017C22.607 11.9517 23.4445 12.7802 23.4445 13.7731C23.4445 14.7661 22.607 15.5945 21.6017 15.5945H9.69967V11.9517ZM9.69967 26.3561H24.2833C25.2885 26.3561 26.1273 27.1834 26.1273 28.1775C26.1273 29.1704 25.2885 29.9977 24.2833 29.9977H9.69967V26.3561ZM4.9646 37.449V4.54266H16.6976C20.3441 4.54266 23.4029 5.3288 25.9595 6.9434C28.4734 8.51688 30.4008 10.5862 31.6583 13.1103C32.9159 15.6356 33.5857 18.2843 33.5857 21.0165C33.5857 23.7897 32.9575 26.4383 31.6583 28.9225C30.4008 31.4467 28.4734 33.4749 25.9595 35.0894C23.4445 36.6617 20.3441 37.4902 16.6976 37.4902H7.14418C6.5148 37.449 5.00623 37.449 4.9646 37.449ZM9.69967 19.1539H17.9551C18.9616 19.1539 19.7992 19.9812 19.7992 20.9753C19.7992 21.9683 18.9616 22.7967 17.9551 22.7967H9.69967V19.1539Z"
                fill="white"
              />
            </svg>
          </div>
          <!-- <transition-group tag="div" name="move-up" mode="out-in" class="w-full"> -->
          <div
            :key="samlLogin"
            class="mt-8 text-center text-vanilla-100 text-lg font-medium leading-6"
          >
            {{ samlLogin ? "What's your email address?" : 'Log in to DeepSource' }}
          </div>
          <div v-if="!samlLogin" key="base-login" class="grid gap-y-4 mt-9 w-full">
            <a
              v-for="opt in loginOptions"
              :key="opt.provider"
              :href="opt.link ? opt.link : buildUrl(opt.provider)"
              class="flex justify-center items-center gap-x-3 login-btn p-3 rounded-md"
              :class="[`login-btn-${opt.icon}`]"
            >
              <z-icon :icon="opt.icon" size="base" />
              <span>Continue with {{ opt.label }}</span>
            </a>
          </div>
          <div v-else key="saml-login" class="mt-9 mb-5 w-full">
            <z-input
              v-model="samlEmail"
              type="email"
              placeholder="Enter your email address..."
              class="border-ink-200"
            />
            <div v-if="samlLoginError" class="flex items-center gap-x-1 mt-1 text-cherry text-sm">
              <z-icon icon="alert-circle" color="current" />
              <span>SSO is not set up for your domain.</span>
            </div>
          </div>
          <template v-if="$config.enableSaml">
            <hr
              v-if="loginOptions.length && !samlLogin"
              :key="`hr-${loginOptions.length && !samlLogin}`"
              class="border-slate-400 my-6 w-full"
            />
            <a
              v-if="$config.onPrem"
              :key="`a-${samlLogin}-${$config.onPrem}`"
              href="/saml2/login"
              class="flex justify-center items-center gap-x-3 login-btn p-3 rounded-md w-full"
            >
              <z-icon icon="key-2" color="vanilla-100" />
              <span>Continue with SSO</span>
            </a>
            <button
              v-else
              :key="`btn-${samlLogin}-${$config.onPrem}`"
              :disabled="samlLoginLoading"
              class="flex justify-center items-center gap-x-3 p-3 rounded-md w-full login-btn"
              :class="{ 'cursor-not-allowed login-btn-no-hover': samlLoginLoading }"
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
            class="flex gap-x-2 items-center mx-auto mt-5 text-sm text-vanilla-400 hover:text-vanilla-100"
            @click="resetSamlLogin"
          >
            <z-icon icon="arrow-left" />
            <span> Back to login </span>
          </button>
          <!-- </transition-group> -->
        </div>
      </div>
    </div>
  </div>
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

  FOOTER_LINKS = [
    { text: 'Privacy', link: `${this.$config.domain}/privacy/` },
    // { text: 'Legal', link: `${this.$config.domain}/legal/` },
    { text: 'Terms of use', link: `${this.$config.domain}/terms-of-service/` }
  ]

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

<style scoped lang="postcss">
@tailwind base;
@tailwind utilities;

.bg-login-gradient {
  position: absolute;
  width: 956px;
  height: 956px;
  left: -298px;
  margin-left: auto;
  margin-right: auto;
  top: -530px;

  background: linear-gradient(
    180deg,
    rgba(69, 175, 220, 0.6) 64.4%,
    rgba(59, 100, 236, 0.6) 76.78%,
    rgba(69, 104, 220, 0) 100%
  );
  opacity: 0.12;
  box-shadow: 0px 10.5635px 660.221px 5281.77px rgba(0, 0, 0, 0.25);
  filter: blur(158.453px);
}

@media screen and (min-width: 1280px) {
  .bg-login-gradient {
    width: 75%;
    left: 0;
    right: 0;
  }
}

.deepsource-logo {
  --angle: 0deg;
  padding: 10.6667px;
  border: theme('spacing.px') solid theme('colors.transparent');
  background: linear-gradient(theme(colors.ink.200), theme(colors.ink.200)) padding-box,
    linear-gradient(var(--angle), rgba(255, 255, 255, 0.2) 14.99%, rgba(255, 255, 255, 0.02) 77.27%)
      border-box;
  backdrop-filter: blur(21.3333px);
  border-radius: theme('borderRadius.lg');
  animation: 8.5s rotate linear infinite;
}

@keyframes rotate {
  to {
    --angle: 360deg;
  }
}

@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

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
