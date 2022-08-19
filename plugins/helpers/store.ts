import { NuxtAppOptions } from '@nuxt/types'
import { Inject } from '@nuxt/types/app'
import { DocumentNode } from 'graphql'
import { AuthGetterTypes, AuthMutationTypes } from '~/store/account/auth'
import {
  GraphqlMutationResponse,
  GraphqlQueryOptions,
  GraphqlQueryResponse
} from '~/types/apolloTypes'
import { Context } from '@nuxt/types'

import refreshTokenMutation from '@/apollo/mutations/auth/refreshToken.gql'

declare module 'vuex/types/index' {
  // skipcq: JS-0387, JS-0356
  interface Store<S> {
    $fetchGraphqlData(
      query: DocumentNode,
      variables: any,
      refetch?: boolean,
      refreshToken?: boolean
    ): any
    $applyGraphqlMutation(
      mutation: DocumentNode,
      variables: any,
      refetchQueries?: any,
      refreshToken?: boolean
    ): any
    $getGQLAfter(pageNumber: number, limit: number): string
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $fetchGraphqlData(
      query: DocumentNode,
      variables: any,
      refetch?: boolean,
      refreshToken?: boolean
    ): any
    $applyGraphqlMutation(
      mutation: DocumentNode,
      variables: any,
      refetchQueries?: any,
      refreshToken?: boolean
    ): any
    $getGQLAfter(pageNumber: number, limit: number): string
  }
  interface Context {
    $fetchGraphqlData(
      query: DocumentNode,
      variables: any,
      refetch?: boolean,
      refreshToken?: boolean
    ): any
    $applyGraphqlMutation(
      mutation: DocumentNode,
      variables: any,
      refetchQueries?: any,
      refreshToken?: boolean
    ): any
    $getGQLAfter(pageNumber: number, limit: number): string
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $fetchGraphqlData(
      query: DocumentNode,
      variables: any,
      refetch?: boolean,
      refreshToken?: boolean
    ): any
    $applyGraphqlMutation(
      mutation: DocumentNode,
      variables: any,
      refetchQueries?: any,
      refreshToken?: boolean
    ): any
  }
}

export const getCsrfPath = (config: Context['$config']): string => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000/api/set-csrf-cookie/'
  }
  if (process.server) {
    return config.csrfServerUri as string
  }
  if (process.client) {
    return config.csrfClientUri as string
  }
  throw new Error('Both process.server and process.client are false')
}

const parseCookieString = (str: string): string => {
  if (!str) {
    return ''
  }
  const value = str.split(';')[0].split('=')[1]
  if (!value) {
    return ''
  }
  return value
}

const getCSRFHeaders = async ({
  $cookies,
  $config
}: NuxtAppOptions): Promise<Record<string, Record<string, string>>> => {
  let csrfToken = $cookies.get('csrftoken')

  if (!csrfToken) {
    const response = await fetch(getCsrfPath($config), {
      credentials: 'include'
    })

    if (process.client) {
      csrfToken = $cookies.get('csrftoken')
    } else {
      const cookieString = response.headers.get('set-cookie') as string
      csrfToken = parseCookieString(cookieString)
    }
  }

  return {
    headers: {
      'X-CSRFToken': csrfToken as string,
      Cookie: `csrftoken=${csrfToken as string}`
    }
  }
}

const getContext = async (app: NuxtAppOptions): Promise<Record<string, Record<string, string>>> => {
  const { $cookies, store } = app

  // the CSRF headers are always required
  const context = await getCSRFHeaders(app)

  // The JWT is managed in Vuex
  const token = store?.getters[`account/auth/${AuthGetterTypes.TOKEN}`] as string
  const refreshToken = $cookies.get('JWT-refresh-token') as string

  if (!process.client && refreshToken) {
    // On client the refresh token is passed with every request
    // On server we transparently pass the cookie
    context.headers.Cookie += `; JWT-refresh-token=${refreshToken}`
  }

  if (token) {
    context.headers.Authorization = `JWT ${token}`
  }

  return context
}

const refreshIfTokenExpired = async (
  app: NuxtAppOptions
): Promise<GraphqlMutationResponse | void> => {
  if (app.store) {
    const now = (new Date().getTime() + 30_000) / 1000
    const isLoggedIn = app.store.getters[`account/auth/${AuthGetterTypes.GET_LOGGED_IN}`]
    const expiry = app.store.getters[`account/auth/${AuthGetterTypes.EXPIRY}`]
    if (isLoggedIn && now > expiry) {
      const client = app.apolloProvider?.defaultClient

      const context = await getContext(app)
      const params = { mutation: refreshTokenMutation, variables: {}, context }
      if (client) {
        // don't call the action directly unless you have a thing for infinite loops
        try {
          const response = await client.mutate(params)
          app.store.commit(
            `account/auth/${AuthMutationTypes.SET_LOGGED_IN}`,
            response.data.refreshToken.token
          )
        } catch (e) {}
      }
    }
  }
}

/**
 * Get the `after` value that can be used in a GQL query depending on the
 * page number and the limit provided.
 *
 * The `after` attribute is a special base64 encoded value
 * depending on the end cursor value of the query.
 *
 * @param {number} pageNumber
 * @param {number} limit
 * @return {string}
 */
export const getGQLAfter = (pageNumber: number, limit: number): string => {
  if (!pageNumber) return '' // return empty for 0 or null
  const endCursor = (pageNumber - 1) * limit - 1
  if (isNaN(endCursor)) return ''
  if (pageNumber !== 1) {
    return btoa(`arrayconnection:${endCursor}`)
  }
  return ''
}

export default ({ app }: { app: NuxtAppOptions }, inject: Inject): void => {
  inject(
    'fetchGraphqlData',
    async (
      query: DocumentNode,
      variables: any,
      refetch = false,
      refreshToken = true
    ): Promise<GraphqlQueryResponse> => {
      /**
       * Abstracts graphql client code from actions.
       * Used to fetch data through queries.
       */
      if (!app.apolloProvider || !app.apolloProvider.defaultClient) {
        throw new Error("Something went wrong.  We're on it!")
      }

      if (refreshToken) {
        await refreshIfTokenExpired(app)
      }

      const context = await getContext(app)

      const params = { query, variables, context } as GraphqlQueryOptions
      if (refetch) {
        params.fetchPolicy = 'network-only'
      }

      const client = app.apolloProvider.defaultClient
      return client.query(params)
    }
  )

  inject(
    'applyGraphqlMutation',
    async (
      mutation: DocumentNode,
      variables: any,
      refetchQueries?: any,
      refreshToken = true
    ): Promise<GraphqlMutationResponse> => {
      /**
       * Abstracts graphql client code from actions.
       * Used to apply graphql mutations.
       */

      if (!app.apolloProvider || !app.apolloProvider.defaultClient) {
        throw new Error("Something went wrong.  We're on it!")
      }

      if (refreshToken) {
        await refreshIfTokenExpired(app)
      }

      const context = await getContext(app)
      return app.apolloProvider.defaultClient.mutate({
        mutation,
        variables,
        context,
        refetchQueries,
        awaitRefetchQueries: true
      })
    }
  )

  inject('getGQLAfter', getGQLAfter)
}
