// Lists the issues reported in the whole project
package issues

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/deepsource/issues"
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
                  severity
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
	client graphqlclient.GraphQLClient
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
									Severity      string `json:"severity"`
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

func NewIssuesListRequest(client graphqlclient.GraphQLClient, params IssuesListParams) *IssuesListRequest {
	return &IssuesListRequest{client: client, Params: params}
}

func (i *IssuesListRequest) Do(ctx context.Context) ([]issues.Issue, error) {
	vars := map[string]interface{}{
		"name":     i.Params.RepoName,
		"owner":    i.Params.Owner,
		"provider": i.Params.Provider,
		"limit":    i.Params.Limit,
	}
	var respData IssuesListResponse
	if err := i.client.Query(ctx, fetchAllIssuesQuery, vars, &respData); err != nil {
		return nil, fmt.Errorf("list issues: %w", err)
	}

	issuesData := []issues.Issue{}
	for _, edge := range respData.Repository.Issues.Edges {
		if len(edge.Node.Occurrences.Edges) == 0 {
			continue
		}

		for _, occurenceEdge := range edge.Node.Occurrences.Edges {
			issueData := issues.Issue{
				IssueText:     occurenceEdge.Node.Issue.Title,
				IssueCode:     occurenceEdge.Node.Issue.Shortcode,
				IssueCategory: occurenceEdge.Node.Issue.Category,
				IssueSeverity: occurenceEdge.Node.Issue.Severity,
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
