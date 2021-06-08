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

func GetSupportedTransformers(client *DSClient) ([]string, []string, map[string]string, error) {

	var transformerNames []string
	var transformerShortcodes []string
	transformerMap := make(map[string]string)

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
		return transformerNames, transformerShortcodes, transformerMap, err
	}

	for _, edge := range respData.Transformers.Edges {
		transformerNames = append(transformerNames, edge.Node.Name)
		transformerShortcodes = append(transformerShortcodes, edge.Node.Shortcode)
		transformerMap[edge.Node.Name] = edge.Node.Shortcode
	}

	return transformerNames, transformerShortcodes, transformerMap, nil

}
