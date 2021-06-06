package api

import (
	"context"
	"fmt"
	"log"

	"github.com/machinebox/graphql"
)

func GetDeviceCode(client *DSClient) (string, string, string, int, int, error) {

	type QueryResponse struct {
		Registerdevice struct {
			Devicecode              string `json:"deviceCode"`
			Usercode                string `json:"userCode"`
			Verificationuri         string `json:"verificationUri"`
			Verificationuricomplete string `json:"verificationUriComplete"`
			Expiresin               int    `json:"expiresIn"`
			Interval                int    `json:"interval"`
		} `json:"registerDevice"`
	}

	gq := client.gqlClient
	fmt.Println(gq)

	query := `
    mutation register {
        registerDevice(input:{}) {
            deviceCode
            userCode
            verificationUri
            verificationUriComplete
            expiresIn
            interval
        }
    }`

	req := graphql.NewRequest(query)


	// set header fields
	req.Header.Set("Cache-Control", "no-cache")

	// define a Context for the request
	ctx := context.Background()

	// run it and capture the response
	// var graphqlResponse map[string]interface{}
	var respData QueryResponse
	if err := gq.Run(ctx, req, &respData); err != nil {
		log.Fatal(err)
	}

	return respData.Registerdevice.Devicecode, respData.Registerdevice.Usercode, respData.Registerdevice.Verificationuri, respData.Registerdevice.Expiresin, respData.Registerdevice.Interval, nil

}
