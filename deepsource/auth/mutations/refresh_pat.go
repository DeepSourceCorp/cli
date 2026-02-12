package auth

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/deepsource/auth"
)

// GraphQL query to refresh token
const refreshTokenQuery = `
mutation RefreshPAT {
    refreshPat {
        token
		expiry
		user {
			email
		}
    }
}`

type RefreshTokenParams struct {
	Token string `json:"token"`
}

type RefreshTokenRequest struct {
	client graphqlclient.GraphQLClient
	Params RefreshTokenParams
}

type RefreshTokenResponse struct {
	auth.PAT `json:"refreshPat"`
}

func NewRefreshTokenRequest(client graphqlclient.GraphQLClient, params RefreshTokenParams) *RefreshTokenRequest {
	return &RefreshTokenRequest{client: client, Params: params}
}

func (r *RefreshTokenRequest) Do(ctx context.Context) (*auth.PAT, error) {
	r.client.SetAuthToken(r.Params.Token)
	var respData RefreshTokenResponse
	if err := r.client.Mutate(ctx, refreshTokenQuery, nil, &respData); err != nil {
		return nil, fmt.Errorf("Refresh PAT: %w", err)
	}

	return &respData.PAT, nil
}
