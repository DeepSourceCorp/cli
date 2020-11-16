import { NuxtAppOptions } from "@nuxt/types"
import { Inject } from "@nuxt/types/app"

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

export default ({ app }: { app: NuxtAppOptions }, inject: Inject) => {
  inject('providerMetaMap', {
    gh: {
      text: 'GitHub',
      shortcode: 'gh',
      value: 'GITHUB'
    },
    gl: {
      text: 'GitLab',
      shortcode: 'gl',
      value: 'GITLAB'
    },
    bb: {
      text: 'Bitbucket',
      shortcode: 'bb',
      value: 'BITBUCKET'
    },
    GITHUB: {
      text: 'GitHub',
      shortcode: 'gh',
      value: 'GITHUB'
    },
    GITLAB: {
      text: 'GitLab',
      shortcode: 'gl',
      value: 'GITLAB'
    },
    BITBUCKET: {
      text: 'Bitbucket',
      shortcode: 'bb',
      value: 'BITBUCKET'
    }
  })
}