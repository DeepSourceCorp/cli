package auth

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/auth"
	"github.com/deepsourcelabs/graphql"
)

type RequestPATParams struct {
	DeviceCode  string `json:"deviceCode"`
	Description string `json:"description"`
}

type RequestPATRequest struct {
	Params RequestPATParams
}

// GraphQL mutation to request JWT
const requestPATMutation = `
mutation request($input:RequestPATInput!) {
	requestPatWithDeviceCode(input:$input) {
		token
		expiry
		user {
			email
		}
	}
}`

type RequestPATResponse struct {
	auth.PAT `json:"requestPat"`
}

func (r RequestPATRequest) Do(ctx context.Context, client IGQLClient) (*auth.PAT, error) {
	fmt.Println("Here")
	req := graphql.NewRequest(requestPATMutation)
	req.Header.Set("Cache-Control", "no-cache")
	req.Var("input", r.Params)

	var res RequestPATResponse
	if err := client.GQL().Run(ctx, req, &res); err != nil {
		return nil, err
	}
	fmt.Println(res)

	return &res.PAT, nil
}
