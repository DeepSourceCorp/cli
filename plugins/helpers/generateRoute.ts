import { Inject, Context } from '@nuxt/types/app'

// import { Plugin } from '@nuxt/types'

declare module 'vue/types/vue' {
  interface Vue {
    $generateRoute: (path: Array<string>) => string
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $generateRoute: (path: Array<string>) => string
  }
  interface Context {
    $generateRoute: (path: Array<string>) => string
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $generateRoute: (path: Array<string>) => string
  }
}

export default (context: Context, inject: Inject): void => {
  const generateRoute = (path: Array<string>): string => {
    const { params } = context.route
    const baseRoute = ['', params.provider, params.owner]
    if (params.repo) {
      baseRoute.push(params.repo)
    }

    return baseRoute.concat(path).join('/')
  }
  inject('generateRoute', generateRoute)
}
