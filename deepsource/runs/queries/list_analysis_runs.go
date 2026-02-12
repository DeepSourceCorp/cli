// Lists the analysis runs for a repository
package queries

import (
	"context"
	"fmt"
	"time"

	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/deepsource/runs"
)

const fetchAnalysisRunsQuery = `query GetAnalysisRuns(
  $name: String!
  $owner: String!
  $provider: VCSProvider!
  $limit: Int!
) {
  repository(name: $name, login: $owner, vcsProvider: $provider) {
    analysisRuns(first: $limit) {
      edges {
        node {
          runUid
          commitOid
          branchName
          status
          createdAt
          finishedAt
          summary {
            occurrencesIntroduced
            occurrencesResolved
            occurrencesSuppressed
          }
        }
      }
    }
  }
}`

type AnalysisRunsListParams struct {
	Owner    string
	RepoName string
	Provider string
	Limit    int
}

type AnalysisRunsListRequest struct {
	client graphqlclient.GraphQLClient
	Params AnalysisRunsListParams
}

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
					Summary    struct {
						OccurrencesIntroduced int `json:"occurrencesIntroduced"`
						OccurrencesResolved   int `json:"occurrencesResolved"`
						OccurrencesSuppressed int `json:"occurrencesSuppressed"`
					} `json:"summary"`
				} `json:"node"`
			} `json:"edges"`
		} `json:"analysisRuns"`
	} `json:"repository"`
}

func NewAnalysisRunsListRequest(client graphqlclient.GraphQLClient, params AnalysisRunsListParams) *AnalysisRunsListRequest {
	return &AnalysisRunsListRequest{client: client, Params: params}
}

func (r *AnalysisRunsListRequest) Do(ctx context.Context) ([]runs.AnalysisRun, error) {
	vars := map[string]interface{}{
		"name":     r.Params.RepoName,
		"owner":    r.Params.Owner,
		"provider": r.Params.Provider,
		"limit":    r.Params.Limit,
	}
	var respData AnalysisRunsListResponse
	if err := r.client.Query(ctx, fetchAnalysisRunsQuery, vars, &respData); err != nil {
		return nil, fmt.Errorf("List analysis runs: %w", err)
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
			OccurrencesIntroduced: edge.Node.Summary.OccurrencesIntroduced,
			OccurrencesResolved:   edge.Node.Summary.OccurrencesResolved,
			OccurrencesSuppressed: edge.Node.Summary.OccurrencesSuppressed,
		}
		result = append(result, run)
	}

	return result, nil
}
