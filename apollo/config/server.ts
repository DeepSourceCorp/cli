import fetch from 'cross-fetch';
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory'
import { ApolloClientOptions } from 'apollo-client';

export default () :ApolloClientOptions<NormalizedCacheObject> => {
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
    cache: new InMemoryCache(),
    link
  }
}
