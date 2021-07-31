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

type IssuesListParams struct {
	Owner    string
	RepoName string
	Provider string
	Limit    int
}

type IssuesListRequest struct {
	Params IssuesListParams
}

type IssuesListResponse struct {
	issues.IssuesListResponseData `json:"repository"`
}

func (i IssuesListRequest) Do(ctx context.Context, client IGQLClient) (*issues.IssuesListResponseData, error) {

	req := graphql.NewRequest(fetchAllIssuesQuery)
	req.Var("name", i.Params.RepoName)
	req.Var("owner", i.Params.Owner)
	req.Var("provider", i.Params.Provider)
	req.Var("limit", i.Params.Limit)

	// set header fields
	header := fmt.Sprintf("JWT %s", client.GetToken())
	req.Header.Set("Cache-Control", "no-cache")
	req.Header.Add("Authorization", header)

	// run it and capture the response
	// var graphqlResponse map[string]interface{}
	var respData IssuesListResponse
	if err := client.GQL().Run(ctx, req, &respData); err != nil {
		return nil, err
	}

	return &respData.IssuesListResponseData, nil
}
