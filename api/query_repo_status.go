package api

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/graphql"
)

type RepoStatusResponse struct {
	Repository struct {
		Isactivated bool `json:"isActivated"`
	} `json:"repository"`
}

func GetRepoStatus(client *DSClient, owner string, repoName string, provider string) (bool, error) {

	gq := client.gqlClient

	query := `
    query RepoStatus($name: String!,$owner: String!, $provider: VCSProviderChoices!){
        repository(name:$name, owner:$owner, provider:$provider){
            isActivated
        }
    }`

	req := graphql.NewRequest(query)
	header := fmt.Sprintf("JWT %s", client.Token)
	req.Header.Add("Authorization", header)
	req.Var("name", repoName)
	req.Var("owner", owner)
	req.Var("provider", provider)

	// set header fields
	req.Header.Set("Cache-Control", "no-cache")

	// define a Context for the request
	ctx := context.Background()

	// run it and capture the response
	// var graphqlResponse map[string]interface{}
	var respData RepoStatusResponse
	if err := gq.Run(ctx, req, &respData); err != nil {
		return false, err
	}

	if respData.Repository.Isactivated == true {
		return true, nil
	}

	return false, nil

}
