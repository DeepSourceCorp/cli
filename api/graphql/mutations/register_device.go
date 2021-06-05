package api

import (
	"context"

	"github.com/shurcooL/graphql"
)

func GetDeviceCode(client *graphql.Client) (string, string, string, int, int, error) {

	// Mutation to get device code
	var registerMutation struct {
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

	err := client.Mutate(context.Background(), &registerMutation, variables)
	if err != nil {
		return "", "", "", 0, 0, err
	}

	return registerMutation.RegisterDevice.DeviceCode, registerMutation.RegisterDevice.UserCode, registerMutation.RegisterDevice.VerificationURI, registerMutation.RegisterDevice.ExpiresIn, registerMutation.RegisterDevice.Interval, nil

}
