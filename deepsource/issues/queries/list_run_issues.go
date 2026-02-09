// Lists the issues found in an analysis run for a specific commit
package issues

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/issues"
	"github.com/deepsourcelabs/graphql"
)

const fetchRunIssuesQuery = `query GetRunIssues(
  $commitOid: String!
  $limit: Int!
) {
  run(commitOid: $commitOid) {
    status
    branchName
    checks {
      edges {
        node {
          analyzer {
            name
            shortcode
          }
          status
          occurrences(first: $limit) {
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

type RunIssuesListParams struct {
	CommitOID string
	Limit     int
}

type RunIssuesListRequest struct {
	Params RunIssuesListParams
}

type RunIssuesListResponse struct {
	Run struct {
		Status     string `json:"status"`
		BranchName string `json:"branchName"`
		Checks     struct {
			Edges []struct {
				Node struct {
					Analyzer struct {
						Name      string `json:"name"`
						Shortcode string `json:"shortcode"`
					} `json:"analyzer"`
					Status      string `json:"status"`
					Occurrences struct {
						Edges []struct {
							Node struct {
								Path      string `json:"path"`
								BeginLine int    `json:"beginLine"`
								EndLine   int    `json:"endLine"`
								Issue     struct {
									Title     string `json:"title"`
									Shortcode string `json:"shortcode"`
									Category  string `json:"category"`
									Severity  string `json:"severity"`
									Analyzer  struct {
										Name      string `json:"name"`
										Shortcode string `json:"shortcode"`
									} `json:"analyzer"`
								} `json:"issue"`
							} `json:"node"`
						} `json:"edges"`
					} `json:"occurrences"`
				} `json:"node"`
			} `json:"edges"`
		} `json:"checks"`
	} `json:"run"`
}

func (r RunIssuesListRequest) Do(ctx context.Context, client IGQLClient) ([]issues.Issue, error) {
	req := graphql.NewRequest(fetchRunIssuesQuery)
	req.Var("commitOid", r.Params.CommitOID)
	req.Var("limit", r.Params.Limit)

	// set header fields
	req.Header.Set("Cache-Control", "no-cache")
	tokenHeader := fmt.Sprintf("Bearer %s", client.GetToken())
	req.Header.Add("Authorization", tokenHeader)

	// run it and capture the response
	var respData RunIssuesListResponse
	if err := client.GQL().Run(ctx, req, &respData); err != nil {
		return nil, err
	}

	if respData.Run.Status == "" {
		return nil, fmt.Errorf("no analysis run found for commit %s", r.Params.CommitOID)
	}

	issuesData := []issues.Issue{}
	for _, checkEdge := range respData.Run.Checks.Edges {
		for _, occurrenceEdge := range checkEdge.Node.Occurrences.Edges {
			issueData := issues.Issue{
				IssueText:     occurrenceEdge.Node.Issue.Title,
				IssueCode:     occurrenceEdge.Node.Issue.Shortcode,
				IssueCategory: occurrenceEdge.Node.Issue.Category,
				IssueSeverity: occurrenceEdge.Node.Issue.Severity,
				Location: issues.Location{
					Path: occurrenceEdge.Node.Path,
					Position: issues.Position{
						BeginLine: occurrenceEdge.Node.BeginLine,
						EndLine:   occurrenceEdge.Node.EndLine,
					},
				},
				Analyzer: issues.AnalyzerMeta{
					Shortcode: occurrenceEdge.Node.Issue.Analyzer.Shortcode,
				},
			}
			issuesData = append(issuesData, issueData)
		}
	}

	// The limit is applied per-analyzer check in the GraphQL query,
	// so cap the total to the requested limit.
	if r.Params.Limit > 0 && len(issuesData) > r.Params.Limit {
		issuesData = issuesData[:r.Params.Limit]
	}

	return issuesData, nil
}
