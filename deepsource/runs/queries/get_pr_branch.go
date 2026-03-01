package queries

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
)

const getPRBranchQuery = `query GetPRBranch($name: String!, $owner: String!, $provider: VCSProvider!, $prNumber: Int!) {
  repository(name: $name, login: $owner, vcsProvider: $provider) {
    pullRequest(number: $prNumber) {
      branch
    }
  }
}`

type PRBranchParams struct {
	Owner    string
	RepoName string
	Provider string
	PRNumber int
}

type PRBranchRequest struct {
	client graphqlclient.GraphQLClient
	Params PRBranchParams
}

type PRBranchResponse struct {
	Repository struct {
		PullRequest struct {
			Branch string `json:"branch"`
		} `json:"pullRequest"`
	} `json:"repository"`
}

func NewPRBranchRequest(client graphqlclient.GraphQLClient, params PRBranchParams) *PRBranchRequest {
	return &PRBranchRequest{client: client, Params: params}
}

func (r *PRBranchRequest) Do(ctx context.Context) (string, error) {
	vars := map[string]interface{}{
		"name":     r.Params.RepoName,
		"owner":    r.Params.Owner,
		"provider": r.Params.Provider,
		"prNumber": r.Params.PRNumber,
	}
	var respData PRBranchResponse
	if err := r.client.Query(ctx, getPRBranchQuery, vars, &respData); err != nil {
		return "", fmt.Errorf("Get PR branch: %w", err)
	}

	branch := respData.Repository.PullRequest.Branch
	if branch == "" {
		return "", fmt.Errorf("no branch found for PR #%d", r.Params.PRNumber)
	}

	return branch, nil
}
