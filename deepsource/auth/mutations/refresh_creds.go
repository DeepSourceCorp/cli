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

type RefreshTokenRequest struct{}

type RefreshTokenResponse struct {
	auth.RefreshAuthResponse `json:"refreshToken"`
}

func RefreshAuthCreds(ctx context.Context, client IGQLClient, refreshToken string) (*RefreshTokenResponse, error) {

	req := graphql.NewRequest(refreshTokenQuery)

	// set header fields
	req.Header.Set("Cache-Control", "no-cache")
	req.Var("token", refreshToken)

	// run it and capture the response
	var respData RefreshTokenResponse
	if err := client.GQL().Run(ctx, req, &respData); err != nil {
		return &respData, err
	}

	return &respData, nil
}
