// Get issues for a specific analysis run
package queries

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/deepsource/runs"
)

const getRunIssuesQuery = `query GetRunIssues($commitOid: String!) {
  run(commitOid: $commitOid) {
    runUid
    commitOid
    branchName
    status
    checks {
      edges {
        node {
          analyzer {
            name
            shortcode
          }
          occurrences {
            edges {
              node {
                path
                beginLine
                beginColumn
                endLine
                endColumn
                title
                issue {
                  shortcode
                  category
                  severity
                }
              }
            }
          }
        }
      }
    }
  }
}`

type RunIssuesParams struct {
	CommitOid string
}

type RunIssuesRequest struct {
	client graphqlclient.GraphQLClient
	Params RunIssuesParams
}

type RunIssuesResponse struct {
	Run struct {
		RunUid     string `json:"runUid"`
		CommitOid  string `json:"commitOid"`
		BranchName string `json:"branchName"`
		Status     string `json:"status"`
		Checks     struct {
			Edges []struct {
				Node struct {
					Analyzer struct {
						Name      string `json:"name"`
						Shortcode string `json:"shortcode"`
					} `json:"analyzer"`
					Occurrences struct {
						Edges []struct {
							Node struct {
								Path        string `json:"path"`
								BeginLine   int    `json:"beginLine"`
								BeginColumn int    `json:"beginColumn"`
								EndLine     int    `json:"endLine"`
								EndColumn   int    `json:"endColumn"`
								Title       string `json:"title"`
								Issue       struct {
									Shortcode string `json:"shortcode"`
									Category  string `json:"category"`
									Severity  string `json:"severity"`
								} `json:"issue"`
							} `json:"node"`
						} `json:"edges"`
					} `json:"occurrences"`
				} `json:"node"`
			} `json:"edges"`
		} `json:"checks"`
	} `json:"run"`
}

func NewRunIssuesRequest(client graphqlclient.GraphQLClient, params RunIssuesParams) *RunIssuesRequest {
	return &RunIssuesRequest{client: client, Params: params}
}

func (r *RunIssuesRequest) Do(ctx context.Context) (*runs.RunWithIssues, error) {
	vars := map[string]interface{}{
		"commitOid": r.Params.CommitOid,
	}
	var respData RunIssuesResponse
	if err := r.client.Query(ctx, getRunIssuesQuery, vars, &respData); err != nil {
		return nil, fmt.Errorf("get run issues: %w", err)
	}

	result := &runs.RunWithIssues{
		RunUid:     respData.Run.RunUid,
		CommitOid:  respData.Run.CommitOid,
		BranchName: respData.Run.BranchName,
		Status:     respData.Run.Status,
		Issues:     make([]runs.RunIssue, 0),
	}

	for _, checkEdge := range respData.Run.Checks.Edges {
		check := checkEdge.Node
		for _, occEdge := range check.Occurrences.Edges {
			occ := occEdge.Node
			issue := runs.RunIssue{
				Path:              occ.Path,
				BeginLine:         occ.BeginLine,
				BeginColumn:       occ.BeginColumn,
				EndLine:           occ.EndLine,
				EndColumn:         occ.EndColumn,
				IssueText:         "", // issueText is not available in the schema
				IssueCode:         occ.Issue.Shortcode,
				Title:             occ.Title,
				Category:          occ.Issue.Category,
				Severity:          occ.Issue.Severity,
				AnalyzerName:      check.Analyzer.Name,
				AnalyzerShortcode: check.Analyzer.Shortcode,
			}
			result.Issues = append(result.Issues, issue)
		}
	}

	return result, nil
}
