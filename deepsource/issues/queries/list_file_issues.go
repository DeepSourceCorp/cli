// Lists the issues reported in a single file mentioned by the user
package issues

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/issues"
	"github.com/deepsourcelabs/graphql"
)

// Query to fetch issues for a certain file specified by the user
const fetchFileIssuesQuery = `
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

// Request struct
type FileIssuesRequest struct{}

// Response struct
type FileIssuesResponse struct {
	issues.IssuesListFileResponse `json:"repository"`
}

// GraphQL client interface
type IGQLClient interface {
	GQL() *graphql.Client
	GetToken() string
}

// Function to execute the query
func (f FileIssuesRequest) Do(ctx context.Context, client IGQLClient, owner string, repoName string, provider string, filePath string, limit int) (*issues.IssuesListFileResponse, error) {

	req := graphql.NewRequest(fetchFileIssuesQuery)
	req.Header.Set("Cache-Control", "no-cache")

	req.Var("name", repoName)
	req.Var("owner", owner)
	req.Var("provider", provider)
	req.Var("path", filePath)
	req.Var("limit", limit)

	// set header fields
	header := fmt.Sprintf("JWT %s", client.GetToken())
	req.Header.Set("Cache-Control", "no-cache")
	req.Header.Add("Authorization", header)

	// run it and capture the response
	// var graphqlResponse map[string]interface{}
	var respData FileIssuesResponse
	if err := client.GQL().Run(ctx, req, &respData); err != nil {
		return &respData.IssuesListFileResponse, err
	}

	return &respData.IssuesListFileResponse, nil
}
