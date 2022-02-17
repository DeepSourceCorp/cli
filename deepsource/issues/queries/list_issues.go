// Lists the issues reported in the whole project
package issues

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/issues"
	"github.com/deepsourcelabs/graphql"
)

const fetchAllIssuesQuery = `
query GetAllIssues($name:String!, $owner:String!, $provider:VCSProvider!, $limit:Int!){
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

func (i IssuesListRequest) Do(ctx context.Context, client IGQLClient) ([]issues.Issue, error) {

	req := graphql.NewRequest(fetchAllIssuesQuery)
	req.Var("name", i.Params.RepoName)
	req.Var("owner", i.Params.Owner)
	req.Var("provider", i.Params.Provider)
	req.Var("limit", i.Params.Limit)

	// set header fields
	req.Header.Set("Cache-Control", "no-cache")
	// Adding jwt as header for auth
	tokenHeader := fmt.Sprintf("Bearer %s", client.GetToken())
	req.Header.Add("Authorization", tokenHeader)

	// run it and capture the response
	var respData IssuesListResponse
	if err := client.GQL().Run(ctx, req, &respData); err != nil {
		return nil, err
	}

	issuesData := make([]issues.Issue, len(respData.Repository.Issues.Edges))
	for index, edge := range respData.Repository.Issues.Edges {

		issuesData[index].IssueText = edge.Node.Concreteissue.Title
		issuesData[index].IssueCode = edge.Node.Concreteissue.Shortcode

		issuesData[index].Location.Path = edge.Node.Path
		issuesData[index].Location.Position.BeginLine = edge.Node.Beginline
		issuesData[index].Location.Position.EndLine = edge.Node.Endline

		issuesData[index].Analyzer.Shortcode = edge.Node.Concreteissue.Analyzer.Shortcode
	}

	return issuesData, nil
}
