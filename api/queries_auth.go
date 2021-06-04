package api

import (
	"context"
	"fmt"

	"github.com/shurcooL/graphql"
)

type RequestJWTInput struct {
	deviceCode graphql.String `graphql:"deviceCode"`
}

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

func GetJWT(client *graphql.Client, deviceCode string) (string, string, string) {

	var pollerMut struct {
		RequestJWT struct {
			Payload          map[string]string
			Token            string
			RefreshToken     string
			refreshExpiresIn string
		} `graphql:"requestJwt(input: $input)"`
	}

	variables := map[string]interface{}{
		"input": RequestJWTInput{
			deviceCode: graphql.String(deviceCode),
		},
	}

	_ = client.Mutate(context.Background(), &pollerMut, variables)
	fmt.Println(pollerMut)
	if pollerMut.RequestJWT.Token != "" {
		return pollerMut.RequestJWT.Token, pollerMut.RequestJWT.RefreshToken, pollerMut.RequestJWT.refreshExpiresIn
	}
	return "", "", ""
}
