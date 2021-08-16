package repository

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/repository"
	"github.com/deepsourcelabs/graphql"
)

// Query to fetch the status of the repo data sent as param
const repoStatusQuery = `query RepoStatus($name: String!,$owner: String!, $provider: VCSProviderChoices!){
        repository(name:$name, owner:$owner, provider:$provider){
            isActivated
        }
    }`

type RepoStatusParams struct {
	Owner    string
	RepoName string
	Provider string
}

type RepoStatusRequest struct {
	Params RepoStatusParams
}

type RepoStatusResponse struct {
	Repository struct {
		Isactivated bool `json:"isActivated"`
	} `json:"repository"`
}

// GraphQL client interface
type IGQLClient interface {
	GQL() *graphql.Client
	GetToken() string
}

func (r RepoStatusRequest) Do(ctx context.Context, client IGQLClient) (*repository.Meta, error) {

	req := graphql.NewRequest(repoStatusQuery)
	req.Var("name", r.Params.RepoName)
	req.Var("owner", r.Params.Owner)
	req.Var("provider", r.Params.Provider)

	// set header fields
	req.Header.Set("Cache-Control", "no-cache")
	// Adding jwt as header for auth
	tokenHeader := fmt.Sprintf("JWT %s", client.GetToken())
	req.Header.Add("Authorization", tokenHeader)

	// run it and capture the response
	var respData RepoStatusResponse
	if err := client.GQL().Run(ctx, req, &respData); err != nil {
		return nil, err
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
