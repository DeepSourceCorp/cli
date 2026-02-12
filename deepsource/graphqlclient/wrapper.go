package graphqlclient

import (
	"context"
	"fmt"
	"strings"

	"github.com/deepsourcelabs/graphql"
)

// TokenRefresher is called when a request fails due to an expired token.
// It receives the current token and should return a new valid token.
type TokenRefresher func(ctx context.Context, currentToken string) (newToken string, err error)

type wrapper struct {
	client     *graphql.Client
	token      string
	refresher  TokenRefresher
	refreshing bool
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

// NewWithClientAndRefresher creates a GraphQL client wrapper with auto-refresh support.
// When a request fails with an expired token error, the refresher is called to obtain
// a new token and the request is retried once.
func NewWithClientAndRefresher(client *graphql.Client, token string, refresher TokenRefresher) GraphQLClient {
	return &wrapper{
		client:    client,
		token:     token,
		refresher: refresher,
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

func (w *wrapper) exec(ctx context.Context, query string, vars map[string]interface{}, result interface{}, op string) error {
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

func (w *wrapper) run(ctx context.Context, query string, vars map[string]interface{}, result interface{}, op string) error {
	err := w.exec(ctx, query, vars, result, op)
	if err == nil {
		return nil
	}

	if !w.refreshing && w.refresher != nil && isTokenExpired(err) {
		w.refreshing = true
		defer func() { w.refreshing = false }()

		newToken, refreshErr := w.refresher(ctx, w.token)
		if refreshErr != nil {
			return fmt.Errorf("Token expired and refresh failed, run \"deepsource auth login\" to re-authenticate: %w", refreshErr)
		}
		w.token = newToken
		return w.exec(ctx, query, vars, result, op)
	}

	return err
}

func isTokenExpired(err error) bool {
	return strings.Contains(err.Error(), "Signature has expired")
}
