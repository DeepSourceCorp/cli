import { Inject, Context } from '@nuxt/types/app'

declare interface LocalStorageInterface {
  get(store: string, key: string): unknown
  set(store: string, key: string, value: unknown): void
  reset(store: string): void
}

declare module 'vue/types/vue' {
  interface Vue {
    $localStore: LocalStorageInterface
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $localStore: LocalStorageInterface
  }
  interface Context {
    $localStore: LocalStorageInterface
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $localStore: LocalStorageInterface
  }
}

export default (context: Context, inject: Inject): void => {
  function getStore(store: string): Record<string, string> {
    if (!localStorage.getItem(store)) {
      localStorage.setItem(store, '{}')
    }

    return JSON.parse(localStorage.getItem(store) as string)
  }

  const localStorageApi: LocalStorageInterface = {
    get(store: string, key: string) {
      const storeObj = getStore(store)
      return storeObj[key]
    },
    set(store: string, key: string, value: string) {
      const storeObj = getStore(store)
      storeObj[key] = value
      localStorage.setItem(store, JSON.stringify(storeObj))
    },
    reset(store: string) {
      localStorage.setItem(store, '{}')
    }
  }

  inject('localStore', localStorageApi)
}
