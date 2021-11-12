import { Inject, Context } from '@nuxt/types/app'
import { stripTrailingSlash } from '~/utils/string'

// import { Plugin } from '@nuxt/types'

declare module 'vue/types/vue' {
  interface Vue {
    $generateRoute: (path: Array<string>, includeRepoInPath?: boolean) => string
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $generateRoute: (path: Array<string>, includeRepoInPath?: boolean) => string
  }
  interface Context {
    $generateRoute: (path: Array<string>, includeRepoInPath?: boolean) => string
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $generateRoute: (path: Array<string>, includeRepoInPath?: boolean) => string
  }
}

export default (context: Context, inject: Inject): void => {
  const generateRoute = (path?: Array<string> | string, includeRepoInPath = true): string => {
    const { params } = context.route
    const baseRoute = ['', params.provider, params.owner]
    if (params.repo && includeRepoInPath) {
      baseRoute.push(params.repo)
    }
    if (path && Array.isArray(path)) {
      return stripTrailingSlash(baseRoute.concat(...path).join('/'))
    } else if (path) {
      path = stripTrailingSlash(path)
      return baseRoute.concat(path).join('/')
    }

    return baseRoute.join('/')
  }
  inject('generateRoute', generateRoute)
}
