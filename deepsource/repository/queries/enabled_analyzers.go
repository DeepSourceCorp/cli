package repository

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/analyzers"
	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
)

const enabledAnalyzersQuery = `query EnabledAnalyzers($name: String!, $owner: String!, $provider: VCSProvider!) {
	repository(name: $name, login: $owner, vcsProvider: $provider) {
		enabledAnalyzers {
			edges {
				node {
					name
					shortcode
				}
			}
		}
	}
}`

type EnabledAnalyzersParams struct {
	Owner    string
	RepoName string
	Provider string
}

type EnabledAnalyzersRequest struct {
	client graphqlclient.GraphQLClient
	Params EnabledAnalyzersParams
}

type EnabledAnalyzersResponse struct {
	Repository struct {
		EnabledAnalyzers struct {
			Edges []struct {
				Node struct {
					Name      string `json:"name"`
					Shortcode string `json:"shortcode"`
				} `json:"node"`
			} `json:"edges"`
		} `json:"enabledAnalyzers"`
	} `json:"repository"`
}

func NewEnabledAnalyzersRequest(client graphqlclient.GraphQLClient, params EnabledAnalyzersParams) *EnabledAnalyzersRequest {
	return &EnabledAnalyzersRequest{client: client, Params: params}
}

func (r *EnabledAnalyzersRequest) Do(ctx context.Context) ([]analyzers.Analyzer, error) {
	vars := map[string]interface{}{
		"name":     r.Params.RepoName,
		"owner":    r.Params.Owner,
		"provider": r.Params.Provider,
	}
	var respData EnabledAnalyzersResponse
	if err := r.client.Query(ctx, enabledAnalyzersQuery, vars, &respData); err != nil {
		return nil, fmt.Errorf("Fetch enabled analyzers: %w", err)
	}

	result := make([]analyzers.Analyzer, len(respData.Repository.EnabledAnalyzers.Edges))
	for i, edge := range respData.Repository.EnabledAnalyzers.Edges {
		result[i] = analyzers.Analyzer{
			Name:      edge.Node.Name,
			Shortcode: edge.Node.Shortcode,
		}
	}
	return result, nil
}
