package codeformatters

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/codeformatters"
	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
)

// Query to list supported CodeFormatters
const listCodeFormattersQuery = `
{
    codeFormatters{
        edges{
            node{
                name
                shortcode
            }
        }
    }
}`

type CodeFormattersRequest struct {
	client graphqlclient.GraphQLClient
}

type CodeFormattersResponse struct {
	CodeFormatters struct {
		Edges []struct {
			Node struct {
				Name      string `json:"name"`
				Shortcode string `json:"shortcode"`
			} `json:"node"`
		} `json:"edges"`
	} `json:"codeFormatters"`
}

func NewCodeFormattersRequest(client graphqlclient.GraphQLClient) *CodeFormattersRequest {
	return &CodeFormattersRequest{client: client}
}

func (t *CodeFormattersRequest) Do(ctx context.Context) ([]codeformatters.CodeFormatter, error) {
	var respData CodeFormattersResponse
	if err := t.client.Query(ctx, listCodeFormattersQuery, nil, &respData); err != nil {
		return nil, fmt.Errorf("Fetch code formatters: %w", err)
	}

	result := make([]codeformatters.CodeFormatter, len(respData.CodeFormatters.Edges))
	for index, edge := range respData.CodeFormatters.Edges {
		result[index].Name = edge.Node.Name
		result[index].Shortcode = edge.Node.Shortcode
	}

	return result, nil
}
