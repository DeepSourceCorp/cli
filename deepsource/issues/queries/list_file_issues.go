// Lists the issues reported in a single file mentioned by the user
package issues

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/issues"
	"github.com/deepsourcelabs/graphql"
)

// Query to fetch issues for a certain file specified by the user
const fetchFileIssuesQuery = `query GetIssuesForPath(
  $name: String!
  $owner: String!
  $provider: VCSProvider!
  $limit: Int!
  $filepath: String!
) {
  repository(name: $name, login: $owner, vcsProvider: $provider) {
    issues(first: $limit, path:$filepath) {
      edges {
        node {
          issue {
            shortcode
          }
          occurrences {
            edges {
              node {
                path
                beginLine
                endLine
                issue {
                  title
                  shortcode
                  category
                  isRecommended
                  analyzer {
                    name
                    shortcode
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`

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
		Issues struct {
			Edges []struct {
				Node struct {
					Occurrences struct {
						Edges []struct {
							Node struct {
								Path      string `json:"path"`
								BeginLine int    `json:"beginLine"`
								EndLine   int    `json:"endLine"`
								Issue     struct {
									Title         string `json:"title"`
									Shortcode     string `json:"shortcode"`
									Category      string `json:"category"`
									IsRecommended bool   `json:"isRecommended"`
									Analyzer      struct {
										Name      string `json:"name"`
										Shortcode string `json:"shortcode"`
									} `json:"analyzer"`
								} `json:"issue"`
							} `json:"node"`
						} `json:"edges"`
					} `json:"occurrences"`
				} `json:"node"`
			} `json:"edges"`
		} `json:"issues"`
	} `json:"repository"`
}

// GraphQL client interface
type IGQLClient interface {
	GQL() *graphql.Client
	GetToken() string
}

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
	issuesData := []issues.Issue{}
	issueData := issues.Issue{}
	for _, edge := range respData.Repository.Issues.Edges {
		if len(edge.Node.Occurrences.Edges) == 0 {
			continue
		}

		for _, occurenceEdge := range edge.Node.Occurrences.Edges {
			// Check if the path matches the one entered as a flag in the command
			if occurenceEdge.Node.Path == f.Params.FilePath {
				issueData = issues.Issue{
					IssueTitle: occurenceEdge.Node.Issue.Title,
					IssueCode:  occurenceEdge.Node.Issue.Shortcode,
					Location: issues.Location{
						Path: occurenceEdge.Node.Path,
						Position: issues.Position{
							BeginLine: occurenceEdge.Node.BeginLine,
							EndLine:   occurenceEdge.Node.EndLine,
						},
					},
					Analyzer: issues.AnalyzerMeta{
						Shortcode: occurenceEdge.Node.Issue.Analyzer.Shortcode,
					},
				}
			}
			issuesData = append(issuesData, issueData)
		}
	}

	return issuesData, nil
}
