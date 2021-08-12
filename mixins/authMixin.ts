import { Component, Vue, namespace } from 'nuxt-property-decorator'

import { AuthActionTypes } from '~/store/account/auth'

const authStore = namespace('account/auth')

export interface LoginOption {
  provider: string
  icon: string
  label: string
  bg: string
  iconColor?: string
  link?: string
}
@Component
export default class AuthMixin extends Vue {
  @authStore.State
  loggedIn: boolean

  @authStore.State
  authUrls: Record<string, string>

  @authStore.Action(AuthActionTypes.LOG_OUT)
  logOutUser: () => Promise<void>

  @authStore.Action(AuthActionTypes.FETCH_AUTH_URLS)
  fetchAuthUrls: () => Promise<void>

  async fetch(): Promise<void> {
    await this.fetchAuthUrls()
  }

  buildUrl(provider: string): string {
    if (provider in this.authUrls) {
      const oldUrl = this.authUrls[provider]
      const url = new URL(oldUrl)
      if (this.nextParam) {
        const redirectURI = url.searchParams.get('redirect_uri')
        url.searchParams.set('redirect_uri', `${redirectURI}${this.nextParam}`)
      }
      return url.toString()
    }
    return ''
  }

  get nextParam(): string {
    return 'next' in this.$route.query ? `?next=${this.$route.query.next}` : ''
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
      enableSaml
    } = this.$config

    if (!onPrem || !enableSaml || allowSocialAuth) {
      if (githubEnabled) {
        options.push({
          provider: 'github',
          icon: 'github',
          label: 'GitHub',
          bg: 'bg-ink-200'
        })
      }

      if (githubServerEnabled) {
        options.push({
          provider: 'github-enterprise',
          icon: 'github',
          label: 'GitHub Enterprise',
          bg: 'bg-ink-200'
        })
      }

      if (gitlabEnabled) {
        options.push({
          provider: 'gitlab',
          icon: 'gitlab',
          label: 'GitLab',
          bg: 'bg-gitlab'
        })
      }

      if (bitbucketEnabled) {
        options.push({
          provider: 'bitbucket',
          icon: 'bitbucket',
          label: 'Bitbucket',
          bg: 'bg-bitbucket'
        })
      }
    }

    const onProvidersPage = this.$route.name === 'installation-provider'

    if (enableSaml && !onProvidersPage) {
      options.push({
        provider: 'saml',
        icon: 'key',
        iconColor: 'vanilla-100',
        link: '/saml2/login',
        label: 'SSO',
        bg: 'bg-robin'
      })
    }

    return options
  }
}
