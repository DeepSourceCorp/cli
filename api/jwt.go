package api

import (
	"context"

	"github.com/deepsourcelabs/graphql"
)

type FetchJWTResponse struct {
	Requestjwt struct {
		Payload struct {
			Email   string `json:"email"`
			Exp     string `json:"exp"`
			Origiat int64  `json:"origIat"`
		} `json:"payload"`
		Token            string `json:"token"`
		Refreshtoken     string `json:"refreshToken"`
		Refreshexpiresin int64  `json:"refreshExpiresIn"`
	} `json:"requestJwt"`
}

type VerifyJWTResponse struct {
	Verifytoken struct {
		Payload struct {
			Email   string `json:"email"`
			Exp     int    `json:"exp"`
			Origiat int    `json:"origIat"`
		} `json:"payload"`
	} `json:"verifyToken"`
}

// Fetches JWT
func GetJWT(client *DSClient, deviceCode string) (*FetchJWTResponse, error) {

	gq := client.gqlClient

	type RequestJWTInput struct {
		Devicecode string `json:"deviceCode"`
	}

	query := `
    mutation request($input:RequestJWTInput!) {
        requestJwt(input:$input) {
            payload
            token
            refreshToken
            refreshExpiresIn
        }
    }`

	req := graphql.NewRequest(query)

	var v RequestJWTInput
	v.Devicecode = deviceCode

	req.Var("input", v)

	// set header fields
	req.Header.Set("Cache-Control", "no-cache")

	// define a Context for the request
	ctx := context.Background()

	// run it and capture the response
	// var graphqlResponse map[string]interface{}
	var respData FetchJWTResponse
	// TODO: See what error asgard throws here which should be returned
	// Ignore the graphql: Authorization pending. error
	if err := gq.Run(ctx, req, &respData); err != nil {
	}

	return &respData, nil
	// return respData.Requestjwt.Token, respData.Requestjwt.Refreshtoken, respData.Requestjwt.Refreshexpiresin
}

// // Verifies the active status of JWT token
func CheckTokenExpiry(client *DSClient, token string) (bool, error) {

	gq := client.gqlClient

	query := `
    mutation VerifyToken($token: String!) {
        verifyToken(token: $token) {
            payload
        }
    }`

	req := graphql.NewRequest(query)

	req.Var("token", token)

	// set header fields
	req.Header.Set("Cache-Control", "no-cache")

	// define a Context for the request
	ctx := context.Background()

	// run it and capture the response
	// var graphqlResponse map[string]interface{}
	var respData VerifyJWTResponse
	if err := gq.Run(ctx, req, &respData); err != nil {
		return true, err
	}

	return false, nil
}
