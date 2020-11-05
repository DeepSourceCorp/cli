//THIS MODULE NEEDS TO USE THE ROOT APOLLO CONFIGS ONCE IT'S UNFUCKED
import {ApolloClient } from 'apollo-client';
import {ApolloLink} from 'apollo-link';
import { HttpLink } from 'apollo-link-http'
import { onError } from 'apollo-link-error';
import { InMemoryCache } from 'apollo-cache-inmemory'
// https://github.com/apollographql/apollo-link/issues/513
import fetch from 'cross-fetch';


const httpLink = new HttpLink({
  fetch,
  uri: 'http://localhost:8000/graphql/',
})

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    console.log('graphQLErrors', graphQLErrors);
  }
  if (networkError) {
    console.log('networkError', networkError);
  }
});

export const client = new ApolloClient({
  link: ApolloLink.from([errorLink, httpLink]),
  cache: new InMemoryCache()
});
