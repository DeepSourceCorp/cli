import { NuxtAppOptions } from "@nuxt/types"
import { Inject } from "@nuxt/types/app"
import { DocumentNode } from 'graphql'
import { AuthGetterTypes } from '~/store/auth';
import { GraphqlMutationResponse, GraphqlQueryResponse } from '~/types/apolloTypes';

declare module 'vuex/types/index' {
  interface Store<S> {
    $fetchGraphqlData(query: DocumentNode, variables: any): any,
    $applyGraphqlMutation(mutation: DocumentNode, variables: any): any,
    $getGQLAfter(pageNumber: number, limit: number): string
  }
}

const getApolloContext = (app: NuxtAppOptions) :Record<string, any> | null => {
  if (app.store) {
    const token = app.store.getters[`auth/${AuthGetterTypes.GET_TOKEN}`]
    return {
      'headers': {
        'Authorization': `JWT ${token}`
      }
    }
  }
  return {}
}

export default ({ app }: { app: NuxtAppOptions }, inject: Inject) :void=> {
  inject('fetchGraphqlData', async (query: DocumentNode, variables: any) :Promise<GraphqlQueryResponse> => {
    /**
     * Abstracts graphql client code from actions.
     * Used to fetch data through queries.
     */
    if (!app.apolloProvider || !app.apolloProvider.defaultClient) {
      throw new Error("foo")

    }
    const client = app.apolloProvider.defaultClient
    const context = getApolloContext(app);
    return client.query({
      query,
      variables,
      context
    });
  })

  inject('applyGraphqlMutation', async (mutation: DocumentNode, variables: any) :Promise<GraphqlMutationResponse> => {
    /**
     * Abstracts graphql client code from actions.
     * Used to apply graphql mutations.
     */
    if (!app.apolloProvider || !app.apolloProvider.defaultClient) {
      throw new Error("foo")

    }
    const context = getApolloContext(app);
    const client = app.apolloProvider.defaultClient
    return client.mutate({
      mutation,
      variables,
      context
    });
  })

  inject('getGQLAfter', (pageNumber: number, limit: number) :string => {
    /*
      Get the `after` value that can be used in a GQL query depending on
      the page number and the limit provided.

      The `after` attribute is a special base64 encoded value depending on
      the end cursor value of the query.
    */
    const endCursor = (pageNumber - 1) * limit - 1
    if (pageNumber !== 1) {
      return btoa(`arrayconnection:${endCursor}`)
    }
    return ""
  })
}
