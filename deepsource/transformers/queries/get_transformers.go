package transformers

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/transformers"
	"github.com/deepsourcelabs/graphql"
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

type TransformersRequest struct{}

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

// GraphQL client interface
type IGQLClient interface {
	GQL() *graphql.Client
	GetToken() string
}

func (t TransformersRequest) Do(ctx context.Context, client IGQLClient) ([]transformers.Transformer, error) {

	req := graphql.NewRequest(listTransformersQuery)

	// set header fields
	req.Header.Set("Cache-Control", "no-cache")
	// Adding jwt as header for auth
	tokenHeader := fmt.Sprintf("JWT %s", client.GetToken())
	req.Header.Add("Authorization", tokenHeader)

	// run it and capture the response
	var respData TransformersResponse
	if err := client.GQL().Run(ctx, req, &respData); err != nil {
		return nil, err
	}

	// Formatting the query response w.r.t the SDK response ([]transformers.Transformer)
	transformersData := make([]transformers.Transformer, len(respData.Transformers.Edges))
	for index, edge := range respData.Transformers.Edges {
		transformersData[index].Name = edge.Node.Name
		transformersData[index].Shortcode = edge.Node.Shortcode
	}

	return transformersData, nil
}
