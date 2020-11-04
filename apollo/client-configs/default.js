import { InMemoryCache } from 'apollo-cache-inmemory'
import possibleTypes from '~/types/fragmentTypes.ts'

export default (context) => {
  return {
    httpEndpoint: 'http://localhost:8000/graphql/',
    httpLinkOptions: {
      fetchOptions: {
        mode: 'no-cors'
      },
      credentials: 'omit' //must be omit to support application/json content type
    },
    cache: new InMemoryCache({
      possibleTypes: possibleTypes.possibleTypes
    })
  }
}
