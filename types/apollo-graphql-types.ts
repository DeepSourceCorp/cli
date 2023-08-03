import { Mutation, Query } from './types'
import { GraphQLFormattedError } from 'graphql'

export type GraphqlMutationResponse = {
  data: {
    [K in keyof Mutation]?: Mutation[K]
  }
}

export type GraphqlQueryResponse = {
  data: {
    [K in keyof Query]?: Query[K]
  }
}

export type GraphqlError = {
  graphQLErrors: GraphQLFormattedError
}
