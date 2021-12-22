import { InMemoryCache, InMemoryCacheConfig, NormalizedCacheObject } from 'apollo-cache-inmemory'
import { createHttpLink } from 'apollo-link-http'
import { onError } from 'apollo-link-error'
import { ApolloClientOptions } from 'apollo-client'
import { Context } from '@nuxt/types'

export const getHttpUri = (config: Context['$config']): string => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000/graphql/'
  }
  if (process.server) return config.apolloServerUri as string
  if (process.client) return config.apolloClientUri as string
  throw new Error('Both process.server and process.client are false')
}

export default ({
  $config,
  error
}: Context): ApolloClientOptions<NormalizedCacheObject> & { defaultHttpLink: boolean } => {
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

  return {
    defaultHttpLink: false,
    cache: new InMemoryCache({} as InMemoryCacheConfig),
    link: errorLink.concat(httpLink)
  }
}
