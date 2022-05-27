package auth

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/auth"
	"github.com/deepsourcelabs/graphql"
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
	Params RefreshTokenParams
}

type RefreshTokenResponse struct {
	auth.PAT `json:"refreshPat"`
}

func (r RefreshTokenRequest) Do(ctx context.Context, client IGQLClient) (*auth.PAT, error) {

	req := graphql.NewRequest(refreshTokenQuery)

	// set header fields
	req.Header.Set("Cache-Control", "no-cache")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", r.Params.Token))

	// run it and capture the response
	var respData RefreshTokenResponse
	if err := client.GQL().Run(ctx, req, &respData); err != nil {
		return nil, err
	}

	return &respData.PAT, nil
}
