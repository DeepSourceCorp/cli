import { Context } from '@nuxt/types'
import { InMemoryCache, InMemoryCacheConfig } from 'apollo-cache-inmemory'
import possibleTypes from '~/types/fragmentTypes.ts'
import { createHttpLink } from 'apollo-link-http'

export default (context: Context) => {
  return {
    defaultHttpLink: false,
    cache: new InMemoryCache({
      possibleTypes: possibleTypes.possibleTypes
    } as InMemoryCacheConfig),
    link: createHttpLink({
      uri: 'http://localhost:8000/graphql/',
      credentials: 'omit',
      fetchOptions: {
        mode: 'cors'
      },
      fetch: (uri: RequestInfo, options: RequestInit) => {
        const token = context.app.$cookies.get('jwt')
        Object.assign(options.headers, { 'Authorization': `JWT ${token}`})

        return fetch(uri, options)
      }
    })
  }
}
