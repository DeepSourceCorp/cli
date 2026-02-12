package auth

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/deepsource/auth"
)

type RequestPATParams struct {
	DeviceCode  string `json:"deviceCode"`
	Description string `json:"description"`
}

type RequestPATRequest struct {
	client graphqlclient.GraphQLClient
	Params RequestPATParams
}

// GraphQL mutation to request JWT
const requestPATMutation = `
mutation request($input:RequestPATWithDeviceCodeInput!) {
	requestPatWithDeviceCode(input:$input) {
		token
		expiry
		user {
			email
		}
	}
}`

type RequestPATResponse struct {
	auth.PAT `json:"requestPatWithDeviceCode"`
}

func NewRequestPATRequest(client graphqlclient.GraphQLClient, params RequestPATParams) *RequestPATRequest {
	return &RequestPATRequest{client: client, Params: params}
}

func (r *RequestPATRequest) Do(ctx context.Context) (*auth.PAT, error) {
	var res RequestPATResponse
	vars := map[string]interface{}{"input": r.Params}
	if err := r.client.Mutate(ctx, requestPATMutation, vars, &res); err != nil {
		return nil, fmt.Errorf("Request PAT: %w", err)
	}

	return &res.PAT, nil
}
