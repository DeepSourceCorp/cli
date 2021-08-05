import { NuxtAppOptions } from '@nuxt/types'
import { Inject } from '@nuxt/types/app'

declare module 'vue/types/vue' {
  interface Vue {
    $providerMetaMap: any
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $providerMetaMap: any
  }
}

class ProviderMeta {
  text: String
  shortcode: String
  value: String

  constructor(text: String, shortcode: String, value: String) {
    this.text = text
    this.shortcode = shortcode
    this.value = value
  }
}

export default ({ app }: { app: NuxtAppOptions }, inject: Inject) => {
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
