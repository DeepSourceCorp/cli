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

// GraphQL client interface
type IGQLClient interface {
	GQL() *graphql.Client
	GetToken() string
}

func (a AnalyzersRequest) Do(ctx context.Context, client IGQLClient) ([]analyzers.Analyzer, error) {

	req := graphql.NewRequest(listAnalyzersQuery)

	// set header fields
	req.Header.Set("Cache-Control", "no-cache")

	// run it and capture the response
	var respData AnalyzersResponse
	if err := client.GQL().Run(ctx, req, &respData); err != nil {
		return nil, err
	}

	analyzersData := make([]analyzers.Analyzer, len(respData.Analyzers.Edges))
	for index, edge := range respData.Analyzers.Edges {
		analyzersData[index].Name = edge.Node.Name
		analyzersData[index].Shortcode = edge.Node.Shortcode
		analyzersData[index].MetaSchema = edge.Node.MetaSchema
	}

	return analyzersData, nil
}
