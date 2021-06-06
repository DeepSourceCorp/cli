package api

import (
	"context"
	"log"

	"github.com/machinebox/graphql"
)

// Fetches JWT
func GetJWT(client *DSClient, deviceCode string) (string, string, int64) {

	gq := client.gqlClient

	type QueryResponse struct {
		Requestjwt struct {
			Payload struct {
				Email   string `json:"email"`
				Exp     string `json:"exp"`
				Origiat int    `json:"origIat"`
			} `json:"payload"`
			Token            string `json:"token"`
			Refreshtoken     string `json:"refreshToken"`
			Refreshexpiresin int64  `json:"refreshExpiresIn"`
		} `json:"requestJwt"`
	}

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
	var respData QueryResponse
	if err := gq.Run(ctx, req, &respData); err != nil {
		log.Println(err)
	}

	return respData.Requestjwt.Token, respData.Requestjwt.Refreshtoken, respData.Requestjwt.Refreshexpiresin
}

// Verifies the active status of JWT token
// func VerifyJWT(client *DSClient, token string) (bool, error) {

//     var verifyToken struct {
//         VerifyToken struct {
//             Payload struct {
//                 Email   graphql.String `json:"email" graphql:"email"`
//                 Expiry  graphql.String `json:"exp" graphql:"exp"`
//                 OrigIAT graphql.Int    `json:"origIat" graphql:"origIat"`
//             } `json:"payload" graphql:"payload"`
//         } `graphql:"verifyToken(token: $token)"`
//     }

//     variables := map[string]interface{}{
//         "token": graphql.String(token),
//     }

//     gq := client.gqlClient
//     resp, err := gq.Mutate(context.Background(), &verifyToken, variables)
//     log.Println(resp)
//     if err != nil {
//         fmt.Println(err)
//         return false, err
//     }

//     return true, nil
// }
