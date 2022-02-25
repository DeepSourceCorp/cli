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
query($name:String!, $owner:String!, $provider:VCSProvider!, $path:String!, $limit:Int!){
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

type FileIssuesListParams struct {
	Owner    string
	RepoName string
	Provider string
	FilePath string
	Limit    int
}

// Request struct
type FileIssuesListRequest struct {
	Params FileIssuesListParams
}

// Response struct
type FileIssuesResponse struct {
	Repository struct {
		File struct {
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
		} `json:"file"`
	} `json:"repository"`
}

// GraphQL client interface
type IGQLClient interface {
	GQL() *graphql.Client
	GetToken() string
}

// Function to execute the query
func (f FileIssuesListRequest) Do(ctx context.Context, client IGQLClient) ([]issues.Issue, error) {
	req := graphql.NewRequest(fetchFileIssuesQuery)
	req.Header.Set("Cache-Control", "no-cache")

	req.Var("name", f.Params.RepoName)
	req.Var("owner", f.Params.Owner)
	req.Var("provider", f.Params.Provider)
	req.Var("path", f.Params.FilePath)
	req.Var("limit", f.Params.Limit)

	// set header fields
	req.Header.Set("Cache-Control", "no-cache")

	// Adding token as header for auth
	tokenHeader := fmt.Sprintf("Bearer %s", client.GetToken())
	req.Header.Add("Authorization", tokenHeader)

	// run it and capture the response
	var respData FileIssuesResponse
	if err := client.GQL().Run(ctx, req, &respData); err != nil {
		return nil, err
	}

	// Formatting the query response w.r.t the output format of the SDK as specified in `issues_list.go`
	issuesData := make([]issues.Issue, len(respData.Repository.File.Issues.Edges))
	for index, edge := range respData.Repository.File.Issues.Edges {
		// Copying issue title and issue code
		issuesData[index].IssueText = edge.Node.Concreteissue.Title
		issuesData[index].IssueCode = edge.Node.Concreteissue.Shortcode

		// Copying position info
		issuesData[index].Location.Path = edge.Node.Path
		issuesData[index].Location.Position.BeginLine = edge.Node.Beginline
		issuesData[index].Location.Position.EndLine = edge.Node.Endline

		// Copying the analyzer shortcode which raised the issue
		issuesData[index].Analyzer.Shortcode = edge.Node.Concreteissue.Analyzer.Shortcode
	}

	return issuesData, nil
}
