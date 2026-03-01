package queries

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
)

const getPRByBranchQuery = `query GetPRByBranch($name: String!, $owner: String!, $provider: VCSProvider!, $branch: String!) {
  repository(name: $name, login: $owner, vcsProvider: $provider) {
    pullRequests(branch: $branch, first: 1) {
      edges {
        node {
          number
          state
        }
      }
    }
  }
}`

type PRByBranchParams struct {
	Owner    string
	RepoName string
	Provider string
	Branch   string
}

type PRByBranchRequest struct {
	client graphqlclient.GraphQLClient
	Params PRByBranchParams
}

type PRByBranchResponse struct {
	Repository struct {
		PullRequests struct {
			Edges []struct {
				Node struct {
					Number int    `json:"number"`
					State  string `json:"state"`
				} `json:"node"`
			} `json:"edges"`
		} `json:"pullRequests"`
	} `json:"repository"`
}

func NewPRByBranchRequest(client graphqlclient.GraphQLClient, params PRByBranchParams) *PRByBranchRequest {
	return &PRByBranchRequest{client: client, Params: params}
}

func (r *PRByBranchRequest) Do(ctx context.Context) (prNumber int, state string, found bool, err error) {
	vars := map[string]interface{}{
		"name":     r.Params.RepoName,
		"owner":    r.Params.Owner,
		"provider": r.Params.Provider,
		"branch":   r.Params.Branch,
	}
	var respData PRByBranchResponse
	if err := r.client.Query(ctx, getPRByBranchQuery, vars, &respData); err != nil {
		return 0, "", false, fmt.Errorf("Get PR by branch: %w", err)
	}

	edges := respData.Repository.PullRequests.Edges
	if len(edges) == 0 {
		return 0, "", false, nil
	}

	return edges[0].Node.Number, edges[0].Node.State, true, nil
}
