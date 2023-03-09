import { Component, Vue, namespace } from 'nuxt-property-decorator'
import { routerVcsMap } from '~/plugins/helpers/provider'

import { AuthActionTypes } from '~/store/account/auth'

const authStore = namespace('account/auth')

export interface LoginOption {
  shortcode: routerVcsMap
  provider: string
  icon: string
  label: string
  bg: string
  iconColor?: string
  link?: string
}

/**
 * Mixin that provides access to common data and functions for authentication.
 */
@Component
export default class AuthMixin extends Vue {
  @authStore.State
  loggedIn: boolean

  @authStore.State
  token: string

  @authStore.State
  authUrls: Record<string, string>

  @authStore.Action(AuthActionTypes.LOG_OUT)
  logOutUser: (args: { onPrem: boolean }) => Promise<void>

  @authStore.Action(AuthActionTypes.PURGE_CLIENT_DATA)
  purgeClientData: () => void

  @authStore.Action(AuthActionTypes.LOG_IN)
  logInUser: (args: { code: string; provider: string }) => Promise<void>

  @authStore.Action(AuthActionTypes.FETCH_AUTH_URLS)
  fetchAuthUrls: () => Promise<void>

  /**
   * Default fetch hook for pages/components using Auth mixin.
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    await this.fetchAuthUrls()
  }

  /**
   * Default mounted hook for pages/components using Auth mixin.
   *
   * @returns {void}
   */
  mounted(): void {
    const { next } = this.$route?.query ?? {}
    if (next) {
      const expiry = new Date().getTime() + 5 * 60 * 1000 // 5 min life
      this.$nuxt.$cookies.set('bifrost-post-auth-redirect', next, {
        expires: new Date(expiry),
        path: '/'
      })
    }
  }

  /**
   * Return appropriate auth url for a provider.
   *
   * @param provider - VCS provider
   * @returns {string}
   */
  buildUrl(provider: string): string {
    if (provider in this.authUrls) {
      return this.authUrls[provider]
    }
    return ''
  }

  get loginOptions(): LoginOption[] {
    const options: LoginOption[] = []
    const {
      onPrem,
      githubEnabled,
      githubServerEnabled,
      gitlabEnabled,
      allowSocialAuth,
      bitbucketEnabled,
      gsrEnabled,
      adsEnabled,
      enableSaml
    } = this.$config

    const onProvidersPage = this.$route.name === 'installation-providers'

    if (!onPrem || !enableSaml || allowSocialAuth || onProvidersPage) {
      if (githubEnabled) {
        options.push({
          shortcode: routerVcsMap.gh,
          provider: 'github',
          icon: 'github',
          label: 'GitHub',
          bg: 'bg-ink-200'
        })
      }

      if (githubServerEnabled) {
        options.push({
          shortcode: routerVcsMap.ghe,
          provider: 'github-enterprise',
          icon: 'github-enterprise',
          label: 'GitHub Enterprise',
          bg: 'bg-ink-200'
        })
      }

      if (gitlabEnabled) {
        options.push({
          shortcode: routerVcsMap.gl,
          provider: 'gitlab',
          icon: 'gitlab',
          label: 'GitLab',
          bg: 'bg-gitlab'
        })
      }

      if (bitbucketEnabled) {
        options.push({
          shortcode: routerVcsMap.bb,
          provider: 'bitbucket',
          icon: 'bitbucket',
          label: 'Bitbucket',
          bg: 'bg-bitbucket'
        })
      }

      if (gsrEnabled) {
        options.push({
          shortcode: routerVcsMap.gsr,
          provider: 'gsr',
          icon: 'gsr-colored',
          label: 'Google Cloud Source',
          bg: 'bg-ink-200'
        })
      }

      if (adsEnabled) {
        options.push({
          shortcode: routerVcsMap.ads,
          provider: 'ads',
          icon: 'ads-colored',
          label: 'Azure Devops Services',
          bg: 'bg-ink-200'
        })
      }
    }

    return options
  }
}
