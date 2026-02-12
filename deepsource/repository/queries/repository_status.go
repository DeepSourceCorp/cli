package repository

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/deepsource/repository"
)

// Query to fetch the status of the repo data sent as param
const repoStatusQuery = `query RepoStatus($name: String!,$owner: String!, $provider: VCSProvider!){
        repository(name:$name, login:$owner, vcsProvider:$provider){
            isActivated
        }
    }`

type RepoStatusParams struct {
	Owner    string
	RepoName string
	Provider string
}

type RepoStatusRequest struct {
	client graphqlclient.GraphQLClient
	Params RepoStatusParams
}

type RepoStatusResponse struct {
	Repository struct {
		Isactivated bool `json:"isActivated"`
	} `json:"repository"`
}

func NewRepoStatusRequest(client graphqlclient.GraphQLClient, params RepoStatusParams) *RepoStatusRequest {
	return &RepoStatusRequest{client: client, Params: params}
}

func (r *RepoStatusRequest) Do(ctx context.Context) (*repository.Meta, error) {
	vars := map[string]interface{}{
		"name":     r.Params.RepoName,
		"owner":    r.Params.Owner,
		"provider": r.Params.Provider,
	}
	var respData RepoStatusResponse
	if err := r.client.Query(ctx, repoStatusQuery, vars, &respData); err != nil {
		return nil, fmt.Errorf("Fetch repo status: %w", err)
	}

	// Formatting the query response w.r.t the repository.Meta structure
	// defined in `repository.go`
	repositoryData := repository.Meta{
		Activated: false,
		Name:      r.Params.RepoName,
		Owner:     r.Params.Owner,
		Provider:  r.Params.Provider,
	}
	repositoryData.Name = r.Params.RepoName
	repositoryData.Owner = r.Params.Owner
	repositoryData.Provider = r.Params.Provider

	// Check and set the activation status
	if respData.Repository.Isactivated {
		repositoryData.Activated = true
	} else {
		repositoryData.Activated = false
	}

	return &repositoryData, nil
}
