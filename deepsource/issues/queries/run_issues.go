// Lists the issues from a specific run (flattened to Issue type)
package issues

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/deepsource/issues"
)

const fetchRunIssuesFlatQuery = `query GetRunIssues($commitOid: String!, $limit: Int!) {
  run(commitOid: $commitOid) {
    checks {
      edges {
        node {
          analyzer {
            name
            shortcode
          }
          issues(first: $limit) {
            edges {
              node {
                source
                path
                beginLine
                endLine
                title
                shortcode
                explanation
                category
                severity
              }
            }
          }
        }
      }
    }
  }
}`

type RunIssuesFlatParams struct {
	CommitOid string
	Limit     int
}

type RunIssuesFlatRequest struct {
	client graphqlclient.GraphQLClient
	Params RunIssuesFlatParams
}

type RunIssuesFlatResponse struct {
	Run struct {
		Checks struct {
			Edges []struct {
				Node struct {
					Analyzer struct {
						Name      string `json:"name"`
						Shortcode string `json:"shortcode"`
					} `json:"analyzer"`
					Issues struct {
						Edges []struct {
							Node struct {
								Source    string `json:"source"`
								Path     string `json:"path"`
								BeginLine int    `json:"beginLine"`
								EndLine   int    `json:"endLine"`
								Title       string `json:"title"`
								Shortcode   string `json:"shortcode"`
								Explanation string `json:"explanation"`
								Category    string `json:"category"`
								Severity    string `json:"severity"`
							} `json:"node"`
						} `json:"edges"`
					} `json:"issues"`
				} `json:"node"`
			} `json:"edges"`
		} `json:"checks"`
	} `json:"run"`
}

func NewRunIssuesFlatRequest(client graphqlclient.GraphQLClient, params RunIssuesFlatParams) *RunIssuesFlatRequest {
	return &RunIssuesFlatRequest{client: client, Params: params}
}

func (r *RunIssuesFlatRequest) Do(ctx context.Context) ([]issues.Issue, error) {
	vars := map[string]interface{}{
		"commitOid": r.Params.CommitOid,
		"limit":     r.Params.Limit,
	}
	var respData RunIssuesFlatResponse
	if err := r.client.Query(ctx, fetchRunIssuesFlatQuery, vars, &respData); err != nil {
		return nil, fmt.Errorf("List run issues: %w", err)
	}

	result := make([]issues.Issue, 0)
	for _, checkEdge := range respData.Run.Checks.Edges {
		check := checkEdge.Node
		for _, issueEdge := range check.Issues.Edges {
			node := issueEdge.Node
			issue := issues.Issue{
				IssueText:     node.Title,
				IssueCode:     node.Shortcode,
				IssueCategory: node.Category,
				IssueSeverity: node.Severity,
				IssueSource:   node.Source,
				Description:   node.Explanation,
				Location: issues.Location{
					Path: node.Path,
					Position: issues.Position{
						BeginLine: node.BeginLine,
						EndLine:   node.EndLine,
					},
				},
				Analyzer: issues.AnalyzerMeta{
					Name:      check.Analyzer.Name,
					Shortcode: check.Analyzer.Shortcode,
				},
			}
			result = append(result, issue)
		}
	}

	return result, nil
}
