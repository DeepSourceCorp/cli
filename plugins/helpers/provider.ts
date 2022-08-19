import { Context } from '@nuxt/types'
import { Inject } from '@nuxt/types/app'
import { VcsProviderChoices } from '../../types/types'

declare module 'vue/types/vue' {
  interface Vue {
    $providerMetaMap: Record<string, ProviderMeta>
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $providerMetaMap: Record<string, ProviderMeta>
  }
  interface Context {
    $providerMetaMap: Record<string, ProviderMeta>
  }
}

declare module 'vuex/types/index' {
  // skipcq: JS-0387, JS-0356
  interface Store<S> {
    $providerMetaMap: Record<string, ProviderMeta>
  }
}

/**
 * ProviderMeta class whose instance store the text, shortcode, VCSProvider and auth values for a provider.
 */
class ProviderMeta {
  text: string
  shortcode: string
  value: VcsProviderChoices
  auth: string

  constructor(text: string, shortcode: string, value: VcsProviderChoices, auth: string) {
    this.text = text
    this.shortcode = shortcode
    this.value = value
    this.auth = auth
  }
}

/**
 * ! In case of updates to `auth` value, update corresponding data in `nuxt.config.js` as well.
 */
export const providerMetaMap: Record<string, ProviderMeta> = {
  gh: new ProviderMeta('GitHub', 'gh', VcsProviderChoices.Github, 'github'),
  ghe: new ProviderMeta(
    'GitHub Enterprise',
    'ghe',
    VcsProviderChoices.GithubEnterprise,
    'github-enterprise'
  ),
  gl: new ProviderMeta('GitLab', 'gl', VcsProviderChoices.Gitlab, 'gitlab'),
  bb: new ProviderMeta('Bitbucket', 'bb', VcsProviderChoices.Bitbucket, 'bitbucket-oauth2'),
  gsr: new ProviderMeta('Google Cloud', 'gsr', VcsProviderChoices.Gsr, 'google-oauth2'),
  [VcsProviderChoices.Github]: new ProviderMeta(
    'GitHub',
    'gh',
    VcsProviderChoices.Github,
    'github'
  ),
  [VcsProviderChoices.GithubEnterprise]: new ProviderMeta(
    'GitHub Enterprise',
    'ghe',
    VcsProviderChoices.GithubEnterprise,
    'github-enterprise'
  ),
  [VcsProviderChoices.Gitlab]: new ProviderMeta(
    'GitLab',
    'gl',
    VcsProviderChoices.Gitlab,
    'gitlab'
  ),
  [VcsProviderChoices.Bitbucket]: new ProviderMeta(
    'Bitbucket',
    'bb',
    VcsProviderChoices.Bitbucket,
    'bitbucket-oauth2'
  ),
  [VcsProviderChoices.Gsr]: new ProviderMeta(
    'Google Cloud',
    'gsr',
    VcsProviderChoices.Gsr,
    'google-oauth2'
  )
}

export default (_context: Context, inject: Inject): void => {
  inject('providerMetaMap', providerMetaMap)
}
