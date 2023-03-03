import { Context } from '@nuxt/types'
import { Inject } from '@nuxt/types/app'
import { OwnerVcsProvider, VcsProviderChoices } from '../../types/types'

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
export class ProviderMeta {
  text: string
  shortcode: string
  value: VcsProviderChoices
  auth: string
  icon: string

  constructor(
    text: string,
    shortcode: string,
    value: VcsProviderChoices,
    auth: string,
    icon: string
  ) {
    this.text = text
    this.shortcode = shortcode
    this.value = value
    this.auth = auth
    this.icon = icon
  }
}

enum routerVcsMap {
  gh = 'gh',
  ghe = 'ghe',
  gl = 'gl',
  bb = 'bb',
  gsr = 'gsr',
  ads = 'ads'
}

const howToMakeAVcsMap = {
  [routerVcsMap.gh]: new ProviderMeta(
    'GitHub',
    routerVcsMap.gh,
    VcsProviderChoices.Github,
    'github',
    'github'
  ),
  [routerVcsMap.ghe]: new ProviderMeta(
    'GitHub Enterprise',
    routerVcsMap.ghe,
    VcsProviderChoices.GithubEnterprise,
    'github-enterprise',
    'github'
  ),
  [routerVcsMap.gl]: new ProviderMeta(
    'GitLab',
    routerVcsMap.gl,
    VcsProviderChoices.Gitlab,
    'gitlab',
    'gitlab'
  ),
  [routerVcsMap.bb]: new ProviderMeta(
    'Bitbucket',
    routerVcsMap.bb,
    VcsProviderChoices.Bitbucket,
    'bitbucket-oauth2',
    'bitbucket'
  ),
  [routerVcsMap.gsr]: new ProviderMeta(
    'Google Cloud',
    routerVcsMap.gsr,
    VcsProviderChoices.Gsr,
    'google-oauth2',
    'gsr-colored'
  ),
  [routerVcsMap.ads]: new ProviderMeta(
    'Azure Devops Services',
    routerVcsMap.ads,
    VcsProviderChoices.Ads,
    'ads-oauth2',
    'ads-colored'
  )
}

/**
 * ! In case of updates to `auth` value, update corresponding data in `nuxt.config.js` as well.
 */
export const providerMetaMap: Record<string, ProviderMeta> = {
  // router
  [routerVcsMap.gh]: howToMakeAVcsMap[routerVcsMap.gh],
  [routerVcsMap.ghe]: howToMakeAVcsMap[routerVcsMap.ghe],
  [routerVcsMap.gl]: howToMakeAVcsMap[routerVcsMap.gl],
  [routerVcsMap.bb]: howToMakeAVcsMap[routerVcsMap.bb],
  [routerVcsMap.gsr]: howToMakeAVcsMap[routerVcsMap.gsr],
  [routerVcsMap.ads]: howToMakeAVcsMap[routerVcsMap.ads],

  // VcsProviderChoices
  [VcsProviderChoices.Github]: howToMakeAVcsMap[routerVcsMap.gh],
  [VcsProviderChoices.GithubEnterprise]: howToMakeAVcsMap[routerVcsMap.ghe],
  [VcsProviderChoices.Gitlab]: howToMakeAVcsMap[routerVcsMap.gl],
  [VcsProviderChoices.Bitbucket]: howToMakeAVcsMap[routerVcsMap.bb],
  [VcsProviderChoices.Gsr]: howToMakeAVcsMap[routerVcsMap.gsr],
  [VcsProviderChoices.Ads]: howToMakeAVcsMap[routerVcsMap.ads],

  // OwnerVcsProvider
  [OwnerVcsProvider.Gh]: howToMakeAVcsMap[routerVcsMap.gh],
  [OwnerVcsProvider.Ghe]: howToMakeAVcsMap[routerVcsMap.ghe],
  [OwnerVcsProvider.Gl]: howToMakeAVcsMap[routerVcsMap.gl],
  [OwnerVcsProvider.Bb]: howToMakeAVcsMap[routerVcsMap.bb],
  [OwnerVcsProvider.Gsr]: howToMakeAVcsMap[routerVcsMap.gsr],
  [OwnerVcsProvider.Ads]: howToMakeAVcsMap[routerVcsMap.ads]
}

export default (_context: Context, inject: Inject): void => {
  inject('providerMetaMap', providerMetaMap)
}
