package transformers

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/deepsource/transformers"
)

// Query to list supported Transformers
const listTransformersQuery = `
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

type TransformersRequest struct {
	client graphqlclient.GraphQLClient
}

type TransformersResponse struct {
	Transformers struct {
		Edges []struct {
			Node struct {
				Name      string `json:"name"`
				Shortcode string `json:"shortcode"`
			} `json:"node"`
		} `json:"edges"`
	} `json:"transformers"`
}

func NewTransformersRequest(client graphqlclient.GraphQLClient) *TransformersRequest {
	return &TransformersRequest{client: client}
}

func (t *TransformersRequest) Do(ctx context.Context) ([]transformers.Transformer, error) {
	var respData TransformersResponse
	if err := t.client.Query(ctx, listTransformersQuery, nil, &respData); err != nil {
		return nil, fmt.Errorf("fetch transformers: %w", err)
	}

	// Formatting the query response w.r.t the SDK response ([]transformers.Transformer)
	transformersData := make([]transformers.Transformer, len(respData.Transformers.Edges))
	for index, edge := range respData.Transformers.Edges {
		transformersData[index].Name = edge.Node.Name
		transformersData[index].Shortcode = edge.Node.Shortcode
	}

	return transformersData, nil
}
