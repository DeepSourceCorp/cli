// Lists the issues reported in the whole project
package issues

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/issues"
	"github.com/deepsourcelabs/graphql"
)

const fetchAllIssuesQuery = `query GetAllIssues(
  $name: String!
  $owner: String!
  $provider: VCSProvider!
  $limit: Int!
) {
  repository(name: $name, login: $owner, vcsProvider: $provider, ) {
    issues(first: $limit) {
      edges {
        node {
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

func (i IssuesListRequest) Do(ctx context.Context, client IGQLClient) ([]issues.Issue, error) {
	req := graphql.NewRequest(fetchAllIssuesQuery)
	req.Var("name", i.Params.RepoName)
	req.Var("owner", i.Params.Owner)
	req.Var("provider", i.Params.Provider)
	req.Var("limit", i.Params.Limit)

	// set header fields
	req.Header.Set("Cache-Control", "no-cache")
	// Adding PAT as a header for authentication
	tokenHeader := fmt.Sprintf("Bearer %s", client.GetToken())
	req.Header.Add("Authorization", tokenHeader)

	// run it and capture the response
	var respData IssuesListResponse
	if err := client.GQL().Run(ctx, req, &respData); err != nil {
		return nil, err
	}

	issuesData := []issues.Issue{}
	issueData := issues.Issue{}
	for _, edge := range respData.Repository.Issues.Edges {
		if len(edge.Node.Occurrences.Edges) == 0 {
			continue
		}

		for _, occurenceEdge := range edge.Node.Occurrences.Edges {
			issueData = issues.Issue{
				IssueText: occurenceEdge.Node.Issue.Title,
				IssueCode: occurenceEdge.Node.Issue.Shortcode,
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
			issuesData = append(issuesData, issueData)
		}
	}

	return issuesData, nil
}
