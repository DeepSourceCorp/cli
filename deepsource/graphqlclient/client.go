package graphqlclient

import "context"

// GraphQLClient defines the contract for GraphQL operations.
type GraphQLClient interface {
	Query(ctx context.Context, query string, vars map[string]interface{}, result interface{}) error
	Mutate(ctx context.Context, mutation string, vars map[string]interface{}, result interface{}) error
	SetAuthToken(token string)
}
