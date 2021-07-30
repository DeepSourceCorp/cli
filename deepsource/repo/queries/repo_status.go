package repo

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/graphql"
)

const repoStatusQuery = `query RepoStatus($name: String!,$owner: String!, $provider: VCSProviderChoices!){
        repository(name:$name, owner:$owner, provider:$provider){
            isActivated
        }
    }`

type RepoStatusRequest struct{}

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

func (r RepoStatusRequest) Do(ctx context.Context, client IGQLClient, owner string, repoName string, provider string) (bool, error) {

	req := graphql.NewRequest(repoStatusQuery)
	header := fmt.Sprintf("JWT %s", client.GetToken())
	req.Header.Add("Authorization", header)
	req.Var("name", repoName)
	req.Var("owner", owner)
	req.Var("provider", provider)

	// set header fields
	req.Header.Set("Cache-Control", "no-cache")

	// run it and capture the response
	// var graphqlResponse map[string]interface{}
	var respData RepoStatusResponse
	if err := client.GQL().Run(ctx, req, &respData); err != nil {
		return false, err
	}

	if respData.Repository.Isactivated == true {
		return true, nil
	}

	return false, nil
}
