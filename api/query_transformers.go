package api

import (
	"context"

	"github.com/deepsourcelabs/graphql"
)

type TransformersQueryResponse struct {
	Transformers struct {
		Edges []struct {
			Node struct {
				Name      string `json:"name"`
				Shortcode string `json:"shortcode"`
			} `json:"node"`
		} `json:"edges"`
	} `json:"transformers"`
}

func GetSupportedTransformers(client *DSClient) (*TransformersQueryResponse, error) {

	gq := client.gqlClient

	query := `
    {
        transformers{
            edges{
                node{
                    name
                    shortcode
                }
            }
        }
    }`

	req := graphql.NewRequest(query)

	// set header fields
	req.Header.Set("Cache-Control", "no-cache")

	// define a Context for the request
	ctx := context.Background()

	// run it and capture the response
	// var graphqlResponse map[string]interface{}
	var respData TransformersQueryResponse
	if err := gq.Run(ctx, req, &respData); err != nil {
		return &respData, err
	}

	return &respData, nil

}
