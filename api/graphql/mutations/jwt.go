package api

import (
	"context"

	"github.com/shurcooL/graphql"
)

func GetJWT(client *graphql.Client, deviceCode string) (string, string, int64) {

	var pollerMutation struct {
		RequestJWT struct {
			// Payload          interface{} `graphql:"payload"`
			Token            string
			RefreshToken     string
			RefreshExpiresIn int64
		} `graphql:"requestJwt(input: $input)"`
	}

	type RequestJWTInput struct {
		DeviceCode graphql.String `json:"deviceCode"`
	}

	variables := map[string]interface{}{
		"input": RequestJWTInput{
			DeviceCode: graphql.String(deviceCode),
		},
	}

	_ = client.Mutate(context.Background(), &pollerMutation, variables)
	if pollerMutation.RequestJWT.Token != "" {
		return pollerMutation.RequestJWT.Token, pollerMutation.RequestJWT.RefreshToken, pollerMutation.RequestJWT.RefreshExpiresIn
	}
	return "", "", 0
}
