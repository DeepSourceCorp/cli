import { Client } from '@bugsnag/browser'

declare module 'vue/types/vue' {
  interface Vue {
    $bugsnag: Client
  }
}

declare module 'vuex/types/index' {
  // skipcq: JS-0387
  interface Store<S> {
    $bugsnag: Client
  }
}

declare module '@nuxt/types' {
  interface Context {
    $bugsnag: Client
  }
}
