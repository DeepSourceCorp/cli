package analyzers

import (
	"context"

	"github.com/deepsourcelabs/cli/deepsource/analyzers"
	"github.com/deepsourcelabs/graphql"
)

const listAnalyzersQuery = `
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

type AnalyzersRequest struct{}

type AnalyzersResponse struct {
	analyzers.AnalyzersQueryResponse `json:"analyzers"`
}

// GraphQL client interface
type IGQLClient interface {
	GQL() *graphql.Client
	GetToken() string
}

func (a AnalyzersRequest) Do(ctx context.Context, client IGQLClient) ([]string, []string, []string, map[string]string, error) {

	var analyzerNames []string
	var analyzerShortcodes []string
	var analyzerMeta []string
	analyzersMap := make(map[string]string)

	req := graphql.NewRequest(listAnalyzersQuery)

	// set header fields
	req.Header.Set("Cache-Control", "no-cache")

	// run it and capture the response
	// var graphqlResponse map[string]interface{}
	var respData AnalyzersResponse
	if err := client.GQL().Run(ctx, req, &respData); err != nil {
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
