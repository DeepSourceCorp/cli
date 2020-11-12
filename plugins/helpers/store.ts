import { NuxtAppOptions } from "@nuxt/types"
import { Inject } from "@nuxt/types/app"
import { DocumentNode } from 'graphql'

declare module 'vuex/types/index' {
  interface Store<S> {
    $fetchGraphqlData(query: DocumentNode, variables: any): any,
    $getGQLAfter(pageNumber: number, limit: number): string
  }
}

export default ({ app }: { app: NuxtAppOptions }, inject: Inject) => {
  inject('fetchGraphqlData', async (query: DocumentNode, variables: any) => {
    /**
     * Abstracts graphql client code from actions.
     */
    const client = app.apolloProvider?.defaultClient
    return client?.query({
      query,
      variables
    });
  })
  inject('getGQLAfter', (pageNumber: number, limit: number) => {
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
  })
}