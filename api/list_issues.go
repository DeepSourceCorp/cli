package api

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/graphql"
)

type IssuesListResponse struct {
	Repository struct {
		Issues struct {
			Edges []struct {
				Node struct {
					Path          string `json:"path"`
					Beginline     int    `json:"beginLine"`
					Endline       int    `json:"endLine"`
					Concreteissue struct {
						Analyzer struct {
							Shortcode string `json:"shortcode"`
						} `json:"analyzer"`
						Title     string `json:"title"`
						Shortcode string `json:"shortcode"`
					} `json:"concreteIssue"`
				} `json:"node"`
			} `json:"edges"`
		} `json:"issues"`
	} `json:"repository"`
}

func GetIssues(client *DSClient, owner string, repoName string, provider string, limit int) (*IssuesListResponse, error) {

	gq := client.gqlClient

	query := `
    query GetAllIssues($name:String!, $owner:String!, $provider:VCSProviderChoices!, $limit:Int!){
        repository(name:$name, owner:$owner, provider:$provider){
            issues(first:$limit){
                edges{
                    node{
                        path
                        beginLine
                        endLine
                        concreteIssue{
                            analyzer {
                                shortcode
                            }
                            title
                            shortcode
                            }
                        }
                    }
                }
            }
        }`

	req := graphql.NewRequest(query)
	header := fmt.Sprintf("JWT %s", client.Token)
	req.Header.Add("Authorization", header)
	req.Var("name", repoName)
	req.Var("owner", owner)
	req.Var("provider", provider)
	req.Var("limit", limit)

	// set header fields
	req.Header.Set("Cache-Control", "no-cache")

	// define a Context for the request
	ctx := context.Background()

	// run it and capture the response
	// var graphqlResponse map[string]interface{}
	var respData IssuesListResponse
	if err := gq.Run(ctx, req, &respData); err != nil {
		return &respData, err
	}

	return &respData, nil

}
