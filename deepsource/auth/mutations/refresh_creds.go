package auth

import (
	"context"

	"github.com/deepsourcelabs/cli/deepsource/auth"
	"github.com/deepsourcelabs/graphql"
)

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
	auth.RefreshAuthResponse
}

func (r RefreshTokenRequest) Do(ctx context.Context, client IGQLClient) (*auth.RefreshAuthResponse, error) {

	req := graphql.NewRequest(refreshTokenQuery)

	// set header fields
	req.Header.Set("Cache-Control", "no-cache")
	req.Var("token", r.Params.RefreshToken)

	// run it and capture the response
	var respData RefreshTokenResponse
	if err := client.GQL().Run(ctx, req, &respData); err != nil {
		return nil, err
	}

	return &respData.RefreshAuthResponse, nil
}
