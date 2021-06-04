package api

import (
	"github.com/shurcooL/graphql"
)

// To use it - gql := graphQLClient("host",client.http)
func GraphQLClient(host string) *graphql.Client {
	return graphql.NewClient(host, nil)
}
