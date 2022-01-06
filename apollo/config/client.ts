import { InMemoryCache, InMemoryCacheConfig, NormalizedCacheObject } from 'apollo-cache-inmemory'
import { createHttpLink } from 'apollo-link-http'
import { onError } from 'apollo-link-error'
import { ApolloClientOptions } from 'apollo-client'
import { ApolloLink, from } from 'apollo-link'
import { Context } from '@nuxt/types'

/**
 * Returns Apollo server's url depending upon the environment that Bifrost is running in¸
 *
 * @param  {Context['$config']} config
 * @returns string
 */
export const getHttpUri = (config: Context['$config']): string => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000/graphql/'
  }
  if (process.server) return config.apolloServerUri as string
  if (process.client) return config.apolloClientUri as string
  throw new Error('Both process.server and process.client are false')
}

/**
 * Returns Apollo client configuration.
 *
 * @param  {Context} context
 * @returns ApolloClientOptions<NormalizedCacheObject> & { defaultHttpLink: boolean }
 */
export default ({
  req,
  $config,
  error
}: Context): ApolloClientOptions<NormalizedCacheObject> & { defaultHttpLink: boolean } => {
  //? Global error handler for disabled user error.
  const errorLink = onError((gqlError) => {
    if (gqlError.graphQLErrors) {
      const errorObj = gqlError.graphQLErrors?.[0]
      if ($config.onPrem && errorObj && errorObj.message === 'User is disabled')
        error({ message: errorObj.message, statusCode: 403 })
    }
  })

  const httpLink = createHttpLink({
    uri: getHttpUri($config),
    credentials: 'include',
    fetchOptions: {
      mode: 'cors'
    },
    fetch: (uri: RequestInfo, options: RequestInit): Promise<Response> => {
      return fetch(uri, options)
    }
  })

  //? When a request is handled via SSR, sentry and nginx receive the internal Bifrost pod's IP as client IP.
  //? The following middleware handles forwarding the IP of the actual client.
  const forwardHeadersMiddleware = new ApolloLink((operation, forward) => {
    if (process.server) {
      const clientIp =
        (req.headers['x-forwarded-for'] as string)?.split(',').pop() || req.connection.remoteAddress
      operation.setContext(({ headers = {} }) => ({
        headers: {
          ...headers,
          'x-forwarded-for': clientIp
        }
      }))
    }
    return forward(operation)
  })

  return {
    defaultHttpLink: false,
    cache: new InMemoryCache({} as InMemoryCacheConfig),
    link: from([errorLink, forwardHeadersMiddleware, httpLink])
  }
}
