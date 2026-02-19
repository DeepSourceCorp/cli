// Get an analysis run by commit OID
package queries

import (
	"context"
	"fmt"
	"time"

	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/deepsource/runs"
)

const getRunQuery = `query GetRun($commitOid: String!) {
  run(commitOid: $commitOid) {
    runUid
    commitOid
    branchName
    status
    createdAt
    finishedAt
    updatedAt
    summary {
      occurrencesIntroduced
      occurrencesResolved
      occurrencesSuppressed
    }
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
  }
}`

type GetRunParams struct {
	CommitOid string
}

type GetRunRequest struct {
	client graphqlclient.GraphQLClient
	Params GetRunParams
}

type GetRunResponse struct {
	Run *struct {
		RunUid     string     `json:"runUid"`
		CommitOid  string     `json:"commitOid"`
		BranchName string     `json:"branchName"`
		Status     string     `json:"status"`
		CreatedAt  time.Time  `json:"createdAt"`
		FinishedAt *time.Time `json:"finishedAt"`
		UpdatedAt  *time.Time `json:"updatedAt"`
		Summary    struct {
			OccurrencesIntroduced int `json:"occurrencesIntroduced"`
			OccurrencesResolved   int `json:"occurrencesResolved"`
			OccurrencesSuppressed int `json:"occurrencesSuppressed"`
		} `json:"summary"`
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
	} `json:"run"`
}

func NewGetRunRequest(client graphqlclient.GraphQLClient, params GetRunParams) *GetRunRequest {
	return &GetRunRequest{client: client, Params: params}
}

func (r *GetRunRequest) Do(ctx context.Context) (*runs.AnalysisRun, error) {
	vars := map[string]any{
		"commitOid": r.Params.CommitOid,
	}
	var respData GetRunResponse
	if err := r.client.Query(ctx, getRunQuery, vars, &respData); err != nil {
		return nil, fmt.Errorf("Get run: %w", err)
	}

	if respData.Run == nil {
		return nil, nil
	}

	node := respData.Run
	result := &runs.AnalysisRun{
		RunUid:                node.RunUid,
		CommitOid:             node.CommitOid,
		BranchName:            node.BranchName,
		Status:                node.Status,
		CreatedAt:             node.CreatedAt,
		FinishedAt:            node.FinishedAt,
		UpdatedAt:             node.UpdatedAt,
		OccurrencesIntroduced: node.Summary.OccurrencesIntroduced,
		OccurrencesResolved:   node.Summary.OccurrencesResolved,
		OccurrencesSuppressed: node.Summary.OccurrencesSuppressed,
	}

	if rc := node.ReportCard; rc != nil {
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

	return result, nil
}
