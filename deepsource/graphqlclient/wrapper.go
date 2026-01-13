package graphqlclient

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/graphql"
)

type wrapper struct {
	client *graphql.Client
	token  string
}

// New creates a GraphQL client wrapper.
func New(url string, token string) GraphQLClient {
	return &wrapper{
		client: graphql.NewClient(url),
		token:  token,
	}
}

// NewWithClient creates a GraphQL client wrapper using an existing graphql.Client.
func NewWithClient(client *graphql.Client, token string) GraphQLClient {
	return &wrapper{
		client: client,
		token:  token,
	}
}

func (w *wrapper) Query(ctx context.Context, query string, vars map[string]interface{}, result interface{}) error {
	return w.run(ctx, query, vars, result, "query")
}

func (w *wrapper) Mutate(ctx context.Context, mutation string, vars map[string]interface{}, result interface{}) error {
	return w.run(ctx, mutation, vars, result, "mutation")
}

func (w *wrapper) SetAuthToken(token string) {
	w.token = token
}

func (w *wrapper) run(ctx context.Context, query string, vars map[string]interface{}, result interface{}, op string) error {
	req := graphql.NewRequest(query)
	req.Header.Set("Cache-Control", "no-cache")
	if w.token != "" {
		req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", w.token))
	}
	for key, value := range vars {
		req.Var(key, value)
	}

	if err := w.client.Run(ctx, req, result); err != nil {
		return &GraphQLError{
			Operation: op,
			Query:     TruncateQuery(query),
			Cause:     err,
		}
	}
	return nil
}
