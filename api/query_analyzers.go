package api

import (
	"context"

	"github.com/deepsourcelabs/graphql"
)

type AnalyzersQueryResponse struct {
	Analyzers struct {
		Edges []struct {
			Node struct {
				Name      string `json:"name"`
				Shortcode string `json:"shortcode"`
			} `json:"node"`
		} `json:"edges"`
	} `json:"analyzers"`
}

func GetSupportedAnalyzers(client *DSClient) (*AnalyzersQueryResponse, error) {

	gq := client.gqlClient

	query := `
    {
        analyzers {
            edges {
                node {
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
	var respData AnalyzersQueryResponse
	if err := gq.Run(ctx, req, &respData); err != nil {
		return &respData, err
	}

	return &respData, nil

}
