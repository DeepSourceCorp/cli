import { NuxtAppOptions } from '@nuxt/types'
import { Inject } from '@nuxt/types/app'
import { DocumentNode } from 'graphql'
import { AuthGetterTypes, AuthMutationTypes } from '~/store/account/auth'
import {
  GraphqlMutationResponse,
  GraphqlQueryOptions,
  GraphqlQueryResponse
} from '~/types/apolloTypes'

import refreshTokenMutation from '@/apollo/mutations/auth/refreshToken.gql'

declare module 'vuex/types/index' {
  interface Store<S> {
    $fetchGraphqlData(
      query: DocumentNode,
      variables: any,
      refetch?: boolean,
      refreshToken?: boolean
    ): any
    $applyGraphqlMutation(
      mutation: DocumentNode,
      variables: any,
      refetchQueries?: any,
      refreshToken?: boolean
    ): any
    $getGQLAfter(pageNumber: number, limit: number): string
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $fetchGraphqlData(
      query: DocumentNode,
      variables: any,
      refetch?: boolean,
      refreshToken?: boolean
    ): any
    $applyGraphqlMutation(
      mutation: DocumentNode,
      variables: any,
      refetchQueries?: any,
      refreshToken?: boolean
    ): any
    $getGQLAfter(pageNumber: number, limit: number): string
  }
  interface Context {
    $fetchGraphqlData(
      query: DocumentNode,
      variables: any,
      refetch?: boolean,
      refreshToken?: boolean
    ): any
    $applyGraphqlMutation(
      mutation: DocumentNode,
      variables: any,
      refetchQueries?: any,
      refreshToken?: boolean
    ): any
    $getGQLAfter(pageNumber: number, limit: number): string
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $fetchGraphqlData(
      query: DocumentNode,
      variables: any,
      refetch?: boolean,
      refreshToken?: boolean
    ): any
    $applyGraphqlMutation(
      mutation: DocumentNode,
      variables: any,
      refetchQueries?: any,
      refreshToken?: boolean
    ): any
  }
}

const refreshIfTokenExpired = async (
  app: NuxtAppOptions
): Promise<GraphqlMutationResponse | void> => {
  if (app.store) {
    const now = (new Date().getTime() + 30_000) / 1000
    const isLoggedIn = app.store.getters[`account/auth/${AuthGetterTypes.GET_LOGGED_IN}`]
    const expiry = app.store.getters[`account/auth/${AuthGetterTypes.EXPIRY}`]
    if (isLoggedIn && now > expiry) {
      const client = app.apolloProvider?.defaultClient
      const params = { mutation: refreshTokenMutation, variables: {} }
      if (client) {
        // don't call the action directly unless you have a thing for infinite loops
        try {
          const response = await client.mutate(params)
          app.store.commit(
            `account/auth/${AuthMutationTypes.SET_LOGGED_IN}`,
            response.data.refreshToken.token
          )
        } catch (e) {}
      }
    }
  }
}

export default ({ app }: { app: NuxtAppOptions }, inject: Inject): void => {
  inject(
    'fetchGraphqlData',
    async (
      query: DocumentNode,
      variables: any,
      refetch = false,
      refreshToken = true
    ): Promise<GraphqlQueryResponse> => {
      /**
       * Abstracts graphql client code from actions.
       * Used to fetch data through queries.
       */
      if (!app.apolloProvider || !app.apolloProvider.defaultClient) {
        throw new Error("Something went wrong.  We're on it!")
      }

      if (refreshToken) {
        await refreshIfTokenExpired(app)
      }

      const params = { query, variables } as GraphqlQueryOptions
      if (refetch) {
        params.fetchPolicy = 'network-only'
      }

      const client = app.apolloProvider.defaultClient
      return client.query(params)
    }
  )

  inject(
    'applyGraphqlMutation',
    async (
      mutation: DocumentNode,
      variables: any,
      refetchQueries?: any,
      refreshToken = true
    ): Promise<GraphqlMutationResponse> => {
      /**
       * Abstracts graphql client code from actions.
       * Used to apply graphql mutations.
       */

      if (!app.apolloProvider || !app.apolloProvider.defaultClient) {
        throw new Error("Something went wrong.  We're on it!")
      }

      if (refreshToken) {
        await refreshIfTokenExpired(app)
      }

      return app.apolloProvider.defaultClient.mutate({
        mutation,
        variables,
        refetchQueries,
        awaitRefetchQueries: true
      })
    }
  )

  inject('getGQLAfter', (pageNumber: number, limit: number): string => {
    /*
      Get the `after` value that can be used in a GQL query depending on
      the page number and the limit provided.

      The `after` attribute is a special base64 encoded value depending on
      the end cursor value of the query.
    */
    if (!pageNumber) return '' // return emoty for 0 or null
    const endCursor = (pageNumber - 1) * limit - 1
    if (isNaN(endCursor)) return ''
    if (pageNumber !== 1) {
      return btoa(`arrayconnection:${endCursor}`)
    }
    return ''
  })
}
