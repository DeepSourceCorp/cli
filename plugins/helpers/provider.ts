import { NuxtAppOptions } from '@nuxt/types'
import { Inject } from '@nuxt/types/app'

declare module 'vue/types/vue' {
  interface Vue {
    $providerMetaMap: Record<string, ProviderMeta>
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $providerMetaMap: Record<string, ProviderMeta>
  }
}

class ProviderMeta {
  text: string
  shortcode: string
  value: string

  constructor(text: string, shortcode: string, value: string) {
    this.text = text
    this.shortcode = shortcode
    this.value = value
  }
}

export default ({ app }: { app: NuxtAppOptions }, inject: Inject): void => {
  inject('providerMetaMap', {
    gh: new ProviderMeta('GitHub', 'gh', 'GITHUB'),
    ghe: new ProviderMeta('GitHub Enterprise', 'ghe', 'GITHUB_ENTERPRISE'),
    gl: new ProviderMeta('GitLab', 'gl', 'GITLAB'),
    bb: new ProviderMeta('Bitbucket', 'bb', 'BITBUCKET'),
    GITHUB: new ProviderMeta('GitHub', 'gh', 'GITHUB'),
    GITHUB_ENTERPRISE: new ProviderMeta('GitHub Enterprise', 'ghe', 'GITHUB_ENTERPRISE'),
    GITLAB: new ProviderMeta('GitLab', 'gl', 'GITLAB'),
    BITBUCKET: new ProviderMeta('Bitbucket', 'bb', 'BITBUCKET')
  })
}
