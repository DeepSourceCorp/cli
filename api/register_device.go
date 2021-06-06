package api

import (
	"context"
	"fmt"
	"log"
)

func GetDeviceCode(client *DSGQLClient) (string, string, string, int, int, error) {

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

	gq := client.gqlClient

	err := gq.Mutate(context.Background(), &registerMutation, variables)
	if err != nil {
		log.Println(err)
		if err == fmt.Errorf("Signature has expired") {
			// Refresh the token

		}
		return "", "", "", 0, 0, err
	}

	return registerMutation.RegisterDevice.DeviceCode, registerMutation.RegisterDevice.UserCode, registerMutation.RegisterDevice.VerificationURI, registerMutation.RegisterDevice.ExpiresIn, registerMutation.RegisterDevice.Interval, nil

}
