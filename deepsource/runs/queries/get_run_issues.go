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
    reportCard {
      status
      security { grade score issuesCount }
      reliability { grade score issuesCount }
      complexity { grade score issuesCount }
      hygiene { grade score issuesCount }
      coverage { grade score lineCoverage branchCoverage }
      aggregate { grade score }
      focusArea { dimension action }
    }
    checks {
      edges {
        node {
          analyzer {
            name
            shortcode
          }
          issues {
            edges {
              node {
                source
                path
                beginLine
                beginColumn
                endLine
                endColumn
                title
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
		ReportCard *struct {
			Status      string `json:"status"`
			Security    *struct {
				Grade       string `json:"grade"`
				Score       int    `json:"score"`
				IssuesCount int    `json:"issuesCount"`
			} `json:"security"`
			Reliability *struct {
				Grade       string `json:"grade"`
				Score       int    `json:"score"`
				IssuesCount int    `json:"issuesCount"`
			} `json:"reliability"`
			Complexity *struct {
				Grade       string `json:"grade"`
				Score       int    `json:"score"`
				IssuesCount int    `json:"issuesCount"`
			} `json:"complexity"`
			Hygiene *struct {
				Grade       string `json:"grade"`
				Score       int    `json:"score"`
				IssuesCount int    `json:"issuesCount"`
			} `json:"hygiene"`
			Coverage *struct {
				Grade          string   `json:"grade"`
				Score          *int     `json:"score"`
				LineCoverage   *float64 `json:"lineCoverage"`
				BranchCoverage *float64 `json:"branchCoverage"`
			} `json:"coverage"`
			Aggregate *struct {
				Grade string `json:"grade"`
				Score int    `json:"score"`
			} `json:"aggregate"`
			FocusArea *struct {
				Dimension string `json:"dimension"`
				Action    string `json:"action"`
			} `json:"focusArea"`
		} `json:"reportCard"`
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
								Source      string `json:"source"`
								Path        string `json:"path"`
								BeginLine   int    `json:"beginLine"`
								BeginColumn int    `json:"beginColumn"`
								EndLine     int    `json:"endLine"`
								EndColumn   int    `json:"endColumn"`
								Title       string `json:"title"`
								Shortcode   string `json:"shortcode"`
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

func NewRunIssuesRequest(client graphqlclient.GraphQLClient, params RunIssuesParams) *RunIssuesRequest {
	return &RunIssuesRequest{client: client, Params: params}
}

func (r *RunIssuesRequest) Do(ctx context.Context) (*runs.RunWithIssues, error) {
	vars := map[string]interface{}{
		"commitOid": r.Params.CommitOid,
	}
	var respData RunIssuesResponse
	if err := r.client.Query(ctx, getRunIssuesQuery, vars, &respData); err != nil {
		return nil, fmt.Errorf("Get run issues: %w", err)
	}

	result := &runs.RunWithIssues{
		RunUid:     respData.Run.RunUid,
		CommitOid:  respData.Run.CommitOid,
		BranchName: respData.Run.BranchName,
		Status:     respData.Run.Status,
		Issues:     make([]runs.RunIssue, 0),
	}

	if rc := respData.Run.ReportCard; rc != nil {
		reportCard := &runs.ReportCard{
			Status: rc.Status,
		}
		if rc.Security != nil {
			reportCard.Security = &runs.ReportDimension{
				Grade: rc.Security.Grade, Score: rc.Security.Score, IssuesCount: rc.Security.IssuesCount,
			}
		}
		if rc.Reliability != nil {
			reportCard.Reliability = &runs.ReportDimension{
				Grade: rc.Reliability.Grade, Score: rc.Reliability.Score, IssuesCount: rc.Reliability.IssuesCount,
			}
		}
		if rc.Complexity != nil {
			reportCard.Complexity = &runs.ReportDimension{
				Grade: rc.Complexity.Grade, Score: rc.Complexity.Score, IssuesCount: rc.Complexity.IssuesCount,
			}
		}
		if rc.Hygiene != nil {
			reportCard.Hygiene = &runs.ReportDimension{
				Grade: rc.Hygiene.Grade, Score: rc.Hygiene.Score, IssuesCount: rc.Hygiene.IssuesCount,
			}
		}
		if rc.Coverage != nil {
			reportCard.Coverage = &runs.ReportCoverage{
				Grade:          rc.Coverage.Grade,
				Score:          rc.Coverage.Score,
				LineCoverage:   rc.Coverage.LineCoverage,
				BranchCoverage: rc.Coverage.BranchCoverage,
			}
		}
		if rc.Aggregate != nil {
			reportCard.Aggregate = &runs.ReportAggregate{
				Grade: rc.Aggregate.Grade, Score: rc.Aggregate.Score,
			}
		}
		if rc.FocusArea != nil {
			reportCard.FocusArea = &runs.ReportFocusArea{
				Dimension: rc.FocusArea.Dimension, Action: rc.FocusArea.Action,
			}
		}
		result.ReportCard = reportCard
	}

	for _, checkEdge := range respData.Run.Checks.Edges {
		check := checkEdge.Node
		for _, issueEdge := range check.Issues.Edges {
			node := issueEdge.Node
			issue := runs.RunIssue{
				Path:              node.Path,
				BeginLine:         node.BeginLine,
				BeginColumn:       node.BeginColumn,
				EndLine:           node.EndLine,
				EndColumn:         node.EndColumn,
				IssueCode:         node.Shortcode,
				Title:             node.Title,
				Category:          node.Category,
				Severity:          node.Severity,
				Source:            node.Source,
				AnalyzerName:      check.Analyzer.Name,
				AnalyzerShortcode: check.Analyzer.Shortcode,
			}
			result.Issues = append(result.Issues, issue)
		}
	}

	return result, nil
}
