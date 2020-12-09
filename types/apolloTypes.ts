import { Mutation, Query } from "./types"
import { GraphQLFormattedError } from "graphql"
import { ApolloQueryResult } from 'apollo-client'
import { FetchResult } from 'apollo-link'

export type GraphqlMutationResponse = FetchResult<Mutation>

export type GraphqlQueryResponse = ApolloQueryResult<Query>

export type GraphqlError = {
  graphQLErrors: GraphQLFormattedError
}
