package queries

import (
	"context"
	"fmt"
	"time"

	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/deepsource/pagination"
	"github.com/deepsourcelabs/cli/deepsource/runs"
)

const fetchAnalysisRunsQuery = `query GetAnalysisRuns(
  $name: String!
  $owner: String!
  $provider: VCSProvider!
  $limit: Int!
  $after: String
  $branch: String
) {
  repository(name: $name, login: $owner, vcsProvider: $provider) {
    analysisRuns(first: $limit, after: $after, branch: $branch) {
      edges {
        node {
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
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}`

type AnalysisRunsListParams struct {
	Owner      string
	RepoName   string
	Provider   string
	Limit      int
	After      *string
	BranchName *string
}

type AnalysisRunsListRequest struct {
	client graphqlclient.GraphQLClient
	Params AnalysisRunsListParams
}

// PageInfo is an alias for the shared pagination type.
type PageInfo = pagination.PageInfo

type AnalysisRunsListResponse struct {
	Repository struct {
		AnalysisRuns struct {
			Edges []struct {
				Node struct {
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
				} `json:"node"`
			} `json:"edges"`
			PageInfo PageInfo `json:"pageInfo"`
		} `json:"analysisRuns"`
	} `json:"repository"`
}

func NewAnalysisRunsListRequest(client graphqlclient.GraphQLClient, params AnalysisRunsListParams) *AnalysisRunsListRequest {
	return &AnalysisRunsListRequest{client: client, Params: params}
}

func (r *AnalysisRunsListRequest) Do(ctx context.Context) ([]runs.AnalysisRun, PageInfo, error) {
	vars := map[string]interface{}{
		"name":     r.Params.RepoName,
		"owner":    r.Params.Owner,
		"provider": r.Params.Provider,
		"limit":    r.Params.Limit,
	}
	if r.Params.After != nil {
		vars["after"] = *r.Params.After
	}
	if r.Params.BranchName != nil {
		vars["branch"] = *r.Params.BranchName
	}
	var respData AnalysisRunsListResponse
	if err := r.client.Query(ctx, fetchAnalysisRunsQuery, vars, &respData); err != nil {
		return nil, PageInfo{}, fmt.Errorf("List analysis runs: %w", err)
	}

	result := make([]runs.AnalysisRun, 0, len(respData.Repository.AnalysisRuns.Edges))
	for _, edge := range respData.Repository.AnalysisRuns.Edges {
		run := runs.AnalysisRun{
			RunUid:                edge.Node.RunUid,
			CommitOid:             edge.Node.CommitOid,
			BranchName:            edge.Node.BranchName,
			Status:                edge.Node.Status,
			CreatedAt:             edge.Node.CreatedAt,
			FinishedAt:            edge.Node.FinishedAt,
			UpdatedAt:             edge.Node.UpdatedAt,
			OccurrencesIntroduced: edge.Node.Summary.OccurrencesIntroduced,
			OccurrencesResolved:   edge.Node.Summary.OccurrencesResolved,
			OccurrencesSuppressed: edge.Node.Summary.OccurrencesSuppressed,
		}

		if rc := edge.Node.ReportCard; rc != nil {
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
			run.ReportCard = reportCard
		}

		result = append(result, run)
	}

	return result, respData.Repository.AnalysisRuns.PageInfo, nil
}
