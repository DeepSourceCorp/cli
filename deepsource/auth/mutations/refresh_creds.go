package auth

import (
	"context"

	"github.com/deepsourcelabs/cli/deepsource/auth"
	"github.com/deepsourcelabs/graphql"
)

// GraphQL query to refresh token
const refreshTokenQuery = `
mutation RefreshToken($token: String!) {
    refreshToken(refreshToken: $token) {
        payload
        token
        refreshExpiresIn
        refreshToken
    }
}`

type RefreshTokenParams struct {
	RefreshToken string `json:"refreshToken"`
}

type RefreshTokenRequest struct {
	Params RefreshTokenParams
}

type RefreshTokenResponse struct {
	auth.JWT `json:"refreshToken"`
}

func (r RefreshTokenRequest) Do(ctx context.Context, client IGQLClient) (*auth.JWT, error) {

	req := graphql.NewRequest(refreshTokenQuery)

	// set header fields
	req.Header.Set("Cache-Control", "no-cache")
	req.Var("token", r.Params.RefreshToken)

	// run it and capture the response
	var respData RefreshTokenResponse
	if err := client.GQL().Run(ctx, req, &respData); err != nil {
		return nil, err
	}

	return &respData.JWT, nil
}
