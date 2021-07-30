// Lists the issues reported in the whole project
package issues

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/issues"
	"github.com/deepsourcelabs/graphql"
)

const fetchAllIssuesQuery = `
    query($name:String!, $owner:String!, $provider:VCSProviderChoices!, $path:String!, $limit:Int!){
        repository(name:$name, owner:$owner, provider:$provider){
            file(path:$path){
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
        }
    }`

type IssuesListRequest struct{}

type IssuesListResponse struct {
	issues.IssuesListResponse `json:"repository"`
}

func (i IssuesListRequest) Do(ctx context.Context, client IGQLClient, owner string, repoName string, provider string, limit int) (*IssuesListResponse, error) {

	gq := client.GQL()

	req := graphql.NewRequest(fetchAllIssuesQuery)
	req.Var("name", repoName)
	req.Var("owner", owner)
	req.Var("provider", provider)
	req.Var("limit", limit)

	// set header fields
	header := fmt.Sprintf("JWT %s", client.GetToken())
	req.Header.Set("Cache-Control", "no-cache")
	req.Header.Add("Authorization", header)

	// run it and capture the response
	// var graphqlResponse map[string]interface{}
	var respData IssuesListResponse
	if err := gq.Run(ctx, req, &respData); err != nil {
		return &respData, err
	}

	return &respData, nil
}
