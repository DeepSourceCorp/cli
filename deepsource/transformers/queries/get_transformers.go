package transformers

import (
	"context"

	"github.com/deepsourcelabs/cli/deepsource/transformers"
	"github.com/deepsourcelabs/graphql"
)

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
	transformers.TransformersQueryResponse `json:"transformers"`
}

// GraphQL client interface
type IGQLClient interface {
	GQL() *graphql.Client
	GetToken() string
}

func (t TransformersRequest) Do(ctx context.Context, client IGQLClient) ([]string, []string, map[string]string, error) {

	var transformerNames []string
	var transformerShortcodes []string
	transformerMap := make(map[string]string)

	req := graphql.NewRequest(listTransformersQuery)

	// set header fields
	req.Header.Set("Cache-Control", "no-cache")

	// run it and capture the response
	// var graphqlResponse map[string]interface{}
	var respData TransformersResponse
	if err := client.GQL().Run(ctx, req, &respData); err != nil {
		return transformerNames, transformerShortcodes, transformerMap, err
	}

	for _, edge := range respData.Transformers.Edges {
		transformerNames = append(transformerNames, edge.Node.Name)
		transformerShortcodes = append(transformerShortcodes, edge.Node.Shortcode)
		transformerMap[edge.Node.Name] = edge.Node.Shortcode
	}

	return transformerNames, transformerShortcodes, transformerMap, nil
}
