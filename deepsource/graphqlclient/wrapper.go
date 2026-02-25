package graphqlclient

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/deepsourcelabs/cli/internal/debug"
	clierrors "github.com/deepsourcelabs/cli/internal/errors"
	"github.com/deepsourcelabs/graphql"
)

// StatusCheckTransport wraps an http.RoundTripper and returns an error for
// non-2xx HTTP responses. This prevents the graphql library from silently
// decoding non-GraphQL responses (e.g. 404 pages) as empty data.
type StatusCheckTransport struct {
	Base http.RoundTripper
}

func (t *StatusCheckTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	resp, err := t.Base.RoundTrip(req)
	if err != nil {
		return resp, err
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		debug.Log("graphql: HTTP %d from %s: %s", resp.StatusCode, req.URL, string(body))
		return nil, fmt.Errorf("unexpected HTTP %d from %s", resp.StatusCode, req.URL.Host)
	}
	return resp, nil
}

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
	debug.Log("graphql: %s %s", op, TruncateQuery(query))
	if len(vars) > 0 {
		debug.Log("graphql: vars %v", vars)
	}
	start := time.Now()

	req := graphql.NewRequest(query)
	req.Header.Set("Cache-Control", "no-cache")
	if w.token != "" {
		req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", w.token))
	}
	for key, value := range vars {
		req.Var(key, value)
	}

	if err := w.client.Run(ctx, req, result); err != nil {
		debug.Log("graphql: %s failed in %dms: %v", op, time.Since(start).Milliseconds(), err)
		return &GraphQLError{
			Operation: op,
			Query:     TruncateQuery(query),
			Cause:     err,
		}
	}
	debug.Log("graphql: %s completed in %dms", op, time.Since(start).Milliseconds())
	return nil
}

func (w *wrapper) run(ctx context.Context, query string, vars map[string]interface{}, result interface{}, op string) error {
	err := w.exec(ctx, query, vars, result, op)
	if err == nil {
		return nil
	}

	if !w.refreshing && w.refresher != nil && isTokenExpired(err) {
		debug.Log("graphql: token expired, attempting refresh")
		w.refreshing = true
		defer func() { w.refreshing = false }()

		newToken, refreshErr := w.refresher(ctx, w.token)
		if refreshErr != nil {
			debug.Log("graphql: token refresh failed: %v", refreshErr)
			return clierrors.ErrTokenExpired(refreshErr)
		}
		debug.Log("graphql: token refreshed, retrying request")
		w.token = newToken
		return w.exec(ctx, query, vars, result, op)
	}

	return err
}

func isTokenExpired(err error) bool {
	msg := err.Error()
	return strings.Contains(msg, "Signature has expired") ||
		strings.Contains(msg, "unexpected HTTP 401")
}
