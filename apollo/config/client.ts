import { InMemoryCache, InMemoryCacheConfig, NormalizedCacheObject } from 'apollo-cache-inmemory'
import { createHttpLink } from 'apollo-link-http'
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
  $config
}: Context): ApolloClientOptions<NormalizedCacheObject> & { defaultHttpLink: boolean } => {
  const link = createHttpLink({
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
    link
  }
}
