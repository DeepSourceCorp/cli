package repo

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/repo"
	"github.com/deepsourcelabs/graphql"
)

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

func (r RepoStatusRequest) Do(ctx context.Context, client IGQLClient) (*repo.Repository, error) {

	req := graphql.NewRequest(repoStatusQuery)
	header := fmt.Sprintf("JWT %s", client.GetToken())
	req.Header.Add("Authorization", header)
	req.Var("name", r.Params.RepoName)
	req.Var("owner", r.Params.Owner)
	req.Var("provider", r.Params.Provider)

	// set header fields
	req.Header.Set("Cache-Control", "no-cache")

	// run it and capture the response
	var respData RepoStatusResponse
	if err := client.GQL().Run(ctx, req, &respData); err != nil {
		return nil, err
	}

	repositoryData := repo.Repository{
		Activated: false,
		Name:      r.Params.RepoName,
		Owner:     r.Params.Owner,
		Provider:  r.Params.Provider,
	}
	repositoryData.Name = r.Params.RepoName
	repositoryData.Owner = r.Params.Owner
	repositoryData.Provider = r.Params.Provider

	if respData.Repository.Isactivated {
		repositoryData.Activated = true
	} else {
		repositoryData.Activated = false
	}

	return &repositoryData, nil
}
