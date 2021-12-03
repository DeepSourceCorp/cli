import { NuxtAppOptions } from '@nuxt/types'
import { Inject } from '@nuxt/types/app'
import { VcsProviderChoices } from '~/types/types'

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
  interface Store<S> {
    $providerMetaMap: Record<string, ProviderMeta>
  }
}

class ProviderMeta {
  text: string
  shortcode: string
  value: VcsProviderChoices

  constructor(text: string, shortcode: string, value: VcsProviderChoices) {
    this.text = text
    this.shortcode = shortcode
    this.value = value
  }
}

export default ({ app }: { app: NuxtAppOptions }, inject: Inject): void => {
  inject('providerMetaMap', {
    gh: new ProviderMeta('GitHub', 'gh', VcsProviderChoices.Github),
    ghe: new ProviderMeta('GitHub Enterprise', 'ghe', VcsProviderChoices.GithubEnterprise),
    gl: new ProviderMeta('GitLab', 'gl', VcsProviderChoices.Gitlab),
    bb: new ProviderMeta('Bitbucket', 'bb', VcsProviderChoices.Bitbucket),
    gsr: new ProviderMeta('Google Cloud', 'gsr', VcsProviderChoices.Gsr),
    [VcsProviderChoices.Github]: new ProviderMeta('GitHub', 'gh', VcsProviderChoices.Github),
    [VcsProviderChoices.GithubEnterprise]: new ProviderMeta(
      'GitHub Enterprise',
      'ghe',
      VcsProviderChoices.GithubEnterprise
    ),
    [VcsProviderChoices.Gitlab]: new ProviderMeta('GitLab', 'gl', VcsProviderChoices.Gitlab),
    [VcsProviderChoices.Bitbucket]: new ProviderMeta(
      'Bitbucket',
      'bb',
      VcsProviderChoices.Bitbucket
    ),
    [VcsProviderChoices.Gsr]: new ProviderMeta('Google Cloud', 'gsr', VcsProviderChoices.Gsr)
  })
}
