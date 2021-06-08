package api

import (
	"context"

	"github.com/deepsourcelabs/graphql"
)

type AnalyzersQueryResponse struct {
	Analyzers struct {
		Edges []struct {
			Node struct {
				Name       string `json:"name"`
				Shortcode  string `json:"shortcode"`
				MetaSchema string `json:"metaSchema"`
			} `json:"node"`
		} `json:"edges"`
	} `json:"analyzers"`
}

func GetSupportedAnalyzers(client *DSClient) ([]string, []string, []string, map[string]string, error) {

	var analyzerNames []string
	var analyzerShortcodes []string
	var analyzerMeta []string
	analyzersMap := make(map[string]string)

	gq := client.gqlClient

	query := `
    {
        analyzers {
            edges {
                node {
                    name
                    shortcode
                    metaSchema
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
		return analyzerNames, analyzerShortcodes, analyzerMeta, analyzersMap, err
	}

	// Copying data into Options struct
	for _, edge := range respData.Analyzers.Edges {
		analyzerNames = append(analyzerNames, edge.Node.Name)
		analyzerShortcodes = append(analyzerShortcodes, edge.Node.Shortcode)
		analyzerMeta = append(analyzerMeta, edge.Node.MetaSchema)
		analyzersMap[edge.Node.Name] = edge.Node.Shortcode
	}

	return analyzerNames, analyzerShortcodes, analyzerMeta, analyzersMap, nil

}
