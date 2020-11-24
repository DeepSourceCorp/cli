import { Mutation, Query } from "./types"

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