import { InMemoryCache, InMemoryCacheConfig, NormalizedCacheObject } from 'apollo-cache-inmemory'
import { createHttpLink } from 'apollo-link-http'
import { ApolloClientOptions } from 'apollo-client'
import { ApolloLink } from 'apollo-link'
import { setContext } from 'apollo-link-context'

import { Context } from '@nuxt/types'
import { AuthGetterTypes } from '~/store/account/auth'
import { getCSRFToken, getHttpUri, safeCookieAppend } from '~/utils/request'

/**
 * Returns Apollo client configuration.
 *
 * @param  {Context} context
 * @returns ApolloClientOptions<NormalizedCacheObject> & { defaultHttpLink: boolean }
 */
export default (
  app: Context
): ApolloClientOptions<NormalizedCacheObject> & { defaultHttpLink: boolean } => {
  const { req, $config, store, $cookies, ssrContext } = app

  const httpLink = createHttpLink({
    uri: getHttpUri($config),
    credentials: 'include',
    fetchOptions: {
      mode: 'cors'
    },
    fetch: (uri: RequestInfo, options: RequestInit): Promise<Response> => {
      // if (process.server && ($config.enableTimings || process.env.NODE_ENV === 'development')) {
      if (process.server) {
        const opName =
          JSON.parse(options.body?.toString() ?? '{}')['operationName'] ??
          `apollo-query-${Math.random().toString(36).slice(2)}`
        const startTime = Date.now()

        return fetch(uri, options).then((response) => {
          const timeTaken = Date.now() - startTime

          // skipcq: JS-0002, JS-0378
          console.log(`APOLLO: ${opName} took ${timeTaken}ms`)

          const timingHeader = ssrContext?.res.getHeader('Server-Timing') ?? ''
          ssrContext?.res.setHeader(
            'Server-Timing',
            timingHeader
              ? `${timingHeader}, gql-${opName};dur=${timeTaken}`
              : `gql-${opName};dur=${timeTaken}`
          )

          return response
        })
      }

      return fetch(uri, options)
    }
  })

  const csrfHeaderLink = setContext(
    async (_, { headers }): Promise<{ headers: Record<string, string> }> => {
      const token = await getCSRFToken(app)

      return {
        headers: {
          ...headers,
          'X-CSRFToken': token,
          Cookie: safeCookieAppend(headers.Cookie, `; csrftoken=${token}`)
        }
      }
    }
  )

  //? When a request is handled via SSR, sentry and nginx receive the internal Bifrost pod's IP as client IP.
  //? The following middleware handles forwarding the IP of the actual client.
  const forwardHeaderLink = setContext((_, { headers }): { headers: Record<string, string> } => {
    if (!process.server) {
      return { headers: {} }
    }
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',').pop() || req.connection.remoteAddress

    return {
      headers: {
        ...headers,
        'x-forwarded-for': clientIp
      }
    }
  })

  const jwtHeaderLink = setContext((_, { headers }): { headers: Record<string, string> } => {
    // in case token is not preset, `refreshIfTokenExpired` will automatically refresh it before the request
    const token = store?.getters[`account/auth/${AuthGetterTypes.TOKEN}`] as string
    const refreshToken = $cookies.get('JWT-refresh-token') as string

    return {
      headers: {
        ...headers,
        ...(token ? { Authorization: `JWT ${token}` } : {}),
        Cookie: safeCookieAppend(headers.Cookie, `JWT-refresh-token=${refreshToken}`)
      }
    }
  })

  return {
    defaultHttpLink: false,
    ssrMode: process.server,
    cache: new InMemoryCache({} as InMemoryCacheConfig),
    link: ApolloLink.from([forwardHeaderLink, csrfHeaderLink, jwtHeaderLink, httpLink])
  }
}
