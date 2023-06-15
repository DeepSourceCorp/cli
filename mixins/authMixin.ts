import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { routerVcsMap } from '~/plugins/helpers/provider'

import { AuthActionTypes } from '~/store/account/auth'
import { ContextActionTypes } from '~/store/account/context'
import { AuthUrl, Context, VcsProviderChoices } from '~/types/types'

const authStore = namespace('account/auth')
const contextStore = namespace('account/context')

export interface LoginOption {
  shortcode: routerVcsMap
  provider: VcsProviderChoices
  icon: string
  label: string
  mobileLabel?: string
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
  authUrls: Array<AuthUrl>

  @contextStore.State
  context: Context

  @authStore.Action(AuthActionTypes.LOG_OUT)
  logOutUser: (args: { onPrem: boolean }) => Promise<void>

  @authStore.Action(AuthActionTypes.PURGE_CLIENT_DATA)
  purgeClientData: (args: { onPrem: boolean }) => void

  @authStore.Action(AuthActionTypes.LOG_IN)
  logInUser: (args: { code: string; provider: string; appId: string }) => Promise<void>

  @authStore.Action(AuthActionTypes.FETCH_AUTH_URLS)
  fetchAuthUrls: () => Promise<void>

  /**
   * Default fetch hook for pages/components using Auth mixin.
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    await this.fetchAuthUrls()

    if (!Object.hasOwnProperty.call(this.context, 'isRunner')) {
      await this.$store.dispatch(`account/context/${ContextActionTypes.FETCH_CONTEXT}`)
    }
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
    const authUrlEntry = this.authUrls.find((authUrlEntry) => authUrlEntry.provider === provider)

    return authUrlEntry?.url || ''
  }

  get loginOptions(): Array<LoginOption> {
    const options: Array<LoginOption> = []

    const loginOptionsMap: Record<VcsProviderChoices, Omit<LoginOption, 'label'>> = {
      [VcsProviderChoices.Github]: {
        shortcode: routerVcsMap.gh,
        provider: VcsProviderChoices.Github,
        icon: 'github',
        bg: 'bg-ink-200'
      },
      [VcsProviderChoices.GithubEnterprise]: {
        shortcode: routerVcsMap.ghe,
        provider: VcsProviderChoices.GithubEnterprise,
        icon: 'github-enterprise',
        bg: 'bg-ink-200'
      },
      [VcsProviderChoices.Gitlab]: {
        shortcode: routerVcsMap.gl,
        provider: VcsProviderChoices.Gitlab,
        icon: 'gitlab',
        bg: 'bg-gitlab'
      },
      [VcsProviderChoices.Bitbucket]: {
        shortcode: routerVcsMap.bb,
        provider: VcsProviderChoices.Bitbucket,
        icon: 'bitbucket',
        bg: 'bg-bitbucket'
      },
      [VcsProviderChoices.Gsr]: {
        shortcode: routerVcsMap.gsr,
        provider: VcsProviderChoices.Gsr,
        icon: 'gsr-colored',
        bg: 'bg-ink-200'
      },
      [VcsProviderChoices.Ads]: {
        shortcode: routerVcsMap.ads,
        provider: VcsProviderChoices.Ads,
        icon: 'ads-colored',
        bg: 'bg-ink-200'
      }
    }

    if (this.context.isRunner) {
      this.authUrls.forEach(({ name, provider }) => {
        const label = `${name} on ${this.$providerMetaMap[provider].text}`

        const loginOption = {
          ...loginOptionsMap[provider],
          label
        }
        options.push(loginOption)
      })

      return options
    }

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
        const loginOption = {
          ...loginOptionsMap[VcsProviderChoices.Github],
          label: this.$providerMetaMap[VcsProviderChoices.Github].text
        }
        options.push(loginOption)
      }

      if (githubServerEnabled) {
        const loginOption = {
          ...loginOptionsMap[VcsProviderChoices.GithubEnterprise],
          label: this.$providerMetaMap[VcsProviderChoices.GithubEnterprise].text
        }
        options.push(loginOption)
      }

      if (gitlabEnabled) {
        const loginOption = {
          ...loginOptionsMap[VcsProviderChoices.Gitlab],
          label: this.$providerMetaMap[VcsProviderChoices.Gitlab].text
        }
        options.push(loginOption)
      }

      if (bitbucketEnabled) {
        const loginOption = {
          ...loginOptionsMap[VcsProviderChoices.Bitbucket],
          label: this.$providerMetaMap[VcsProviderChoices.Bitbucket].text
        }
        options.push(loginOption)
      }

      if (gsrEnabled) {
        const loginOption = {
          ...loginOptionsMap[VcsProviderChoices.Gsr],
          label: 'Google Cloud Source'
        }
        options.push(loginOption)
      }

      if (adsEnabled) {
        const loginOption = {
          ...loginOptionsMap[VcsProviderChoices.Ads],
          label: this.$providerMetaMap[VcsProviderChoices.Ads].text
        }
        options.push(loginOption)
      }
    }

    return options
  }

  public async signOut(): Promise<void> {
    await this.logOutUser({ onPrem: this.$config.onPrem })
    // router replace refreshes the browser and clears vuex cache
    window.location.replace('/login')
  }
}
