package api

import (
	"context"

	"github.com/deepsourcelabs/graphql"
)

type RefreshAuthResponse struct {
	Refreshtoken struct {
		Token   string `json:"token"`
		Payload struct {
			Email   string `json:"email"`
			Exp     string `json:"exp"`
			Origiat int    `json:"origIat"`
		} `json:"payload"`
		Refreshexpiresin int    `json:"refreshExpiresIn"`
		Refreshtoken     string `json:"refreshToken"`
	} `json:"refreshToken"`
}

func RefreshAuthCreds(client *DSClient) (*RefreshAuthResponse, error) {

	gq := client.gqlClient

	query := `
    mutation RefreshToken($token: String!) {
        refreshToken(refreshToken: $token) {
            payload
            token
            refreshExpiresIn
            refreshToken
        }
    }`

	req := graphql.NewRequest(query)

	// set header fields
	req.Header.Set("Cache-Control", "no-cache")

	// define a Context for the request
	ctx := context.Background()

	// run it and capture the response
	// var graphqlResponse map[string]interface{}
	var respData RefreshAuthResponse
	if err := gq.Run(ctx, req, &respData); err != nil {
		return &respData, err
	}

	return &respData, nil
}
