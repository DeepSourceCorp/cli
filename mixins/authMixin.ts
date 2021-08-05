import { Component, Vue, namespace } from 'nuxt-property-decorator'

import { AuthActionTypes } from '~/store/account/auth'

const authStore = namespace('account/auth')

export interface LoginOption {
  provider: string
  icon: string
  label: string
  bg: string
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

    if (this.$config.githubEnabled) {
      options.push({
        provider: 'github',
        icon: 'github',
        label: 'GitHub',
        bg: 'bg-ink-200'
      })
    }

    if (this.$config.githubServerEnabled) {
      options.push({
        provider: 'github-enterprise',
        icon: 'github',
        label: 'GitHub Enterprise',
        bg: 'bg-ink-200'
      })
    }

    if (this.$config.gitlabEnabled) {
      options.push({
        provider: 'gitlab',
        icon: 'gitlab',
        label: 'GitLab',
        bg: 'bg-gitlab'
      })
    }

    if (this.$config.bitbucketEnabled) {
      options.push({
        provider: 'bitbucket',
        icon: 'bitbucket',
        label: 'Bitbucket',
        bg: 'bg-bitbucket'
      })
    }

    if (this.$config.enableSaml) {
      options.push({
        provider: 'saml',
        icon: 'bitbucket',
        label: 'SSO/SAML',
        bg: 'bg-bitbucket'
      })
    }

    return options
  }
}
