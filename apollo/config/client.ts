import { InMemoryCache, InMemoryCacheConfig, NormalizedCacheObject } from 'apollo-cache-inmemory'
import { createHttpLink } from 'apollo-link-http'
import { ApolloClientOptions } from 'apollo-client';

export default () :ApolloClientOptions<NormalizedCacheObject> & {defaultHttpLink: boolean} => {
  const link = createHttpLink({
    uri: 'http://localhost:8000/graphql/',
    credentials: 'omit',
    fetchOptions: {
      mode: 'cors'
    },
    fetch: (uri: RequestInfo, options: RequestInit) :Promise<Response> => {
      return fetch(uri, options)
    }
  })

  return {
    defaultHttpLink: false,
    cache: new InMemoryCache({} as InMemoryCacheConfig),
    link
  }
}

