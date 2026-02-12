package analyzers

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/deepsource/analyzers"
)

// GraphQL query
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

type AnalyzersRequest struct {
	client graphqlclient.GraphQLClient
}

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

func NewAnalyzersRequest(client graphqlclient.GraphQLClient) *AnalyzersRequest {
	return &AnalyzersRequest{client: client}
}

func (a *AnalyzersRequest) Do(ctx context.Context) ([]analyzers.Analyzer, error) {
	var respData AnalyzersResponse
	if err := a.client.Query(ctx, listAnalyzersQuery, nil, &respData); err != nil {
		return nil, fmt.Errorf("Fetch analyzers: %w", err)
	}

	// Formatting the query response w.r.t the output format
	analyzersData := make([]analyzers.Analyzer, len(respData.Analyzers.Edges))
	for index, edge := range respData.Analyzers.Edges {
		analyzersData[index].Name = edge.Node.Name
		analyzersData[index].Shortcode = edge.Node.Shortcode
		analyzersData[index].MetaSchema = edge.Node.MetaSchema
	}

	return analyzersData, nil
}
