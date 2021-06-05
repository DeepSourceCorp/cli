package api

import (
	"context"
	"fmt"

	"github.com/shurcooL/graphql"
)

func GetDeviceCode(client *graphql.Client) (string, string, string, int, int, error) {

	// Mutation to get device code
	var registerMut struct {
		RegisterDevice struct {
			DeviceCode              string
			UserCode                string
			VerificationURI         string
			VerificationURIComplete string
			ExpiresIn               int
			Interval                int
		} `graphql:"registerDevice(input: {})"`
	}
	variables := map[string]interface{}{}

	err := client.Mutate(context.Background(), &registerMut, variables)
	if err != nil {
		// Handle error.
		fmt.Println(err)
		return "", "", "", 0, 0, err
	}

	return registerMut.RegisterDevice.DeviceCode, registerMut.RegisterDevice.UserCode, registerMut.RegisterDevice.VerificationURI, registerMut.RegisterDevice.ExpiresIn, registerMut.RegisterDevice.Interval, nil

}

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
