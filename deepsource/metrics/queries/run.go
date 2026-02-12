// Fetches metrics from a specific analysis run
package queries

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/deepsource/metrics"
)

const fetchRunMetricsQuery = `query GetRunMetrics($commitOid: String!) {
  run(commitOid: $commitOid) {
    commitOid
    branchName
    status
    changesetStats {
      lines {
        overall
        overallCovered
        new
        newCovered
      }
      branches {
        overall
        overallCovered
        new
        newCovered
      }
      conditions {
        overall
        overallCovered
        new
        newCovered
      }
    }
    checks {
      edges {
        node {
          metrics {
            name
            shortcode
            description
            positiveDirection
            unit
            isReported
            isThresholdEnforced
            items {
              key
              threshold
              latestValue
              latestValueDisplay
              thresholdStatus
            }
          }
        }
      }
    }
  }
}`

type RunMetricsParams struct {
	CommitOid string
}

type RunMetricsRequest struct {
	client graphqlclient.GraphQLClient
	Params RunMetricsParams
}

type RunMetricsResponse struct {
	Run struct {
		CommitOid     string `json:"commitOid"`
		BranchName    string `json:"branchName"`
		Status        string `json:"status"`
		ChangesetStats *struct {
			Lines struct {
				Overall        *int `json:"overall"`
				OverallCovered *int `json:"overallCovered"`
				New            *int `json:"new"`
				NewCovered     *int `json:"newCovered"`
			} `json:"lines"`
			Branches struct {
				Overall        *int `json:"overall"`
				OverallCovered *int `json:"overallCovered"`
				New            *int `json:"new"`
				NewCovered     *int `json:"newCovered"`
			} `json:"branches"`
			Conditions struct {
				Overall        *int `json:"overall"`
				OverallCovered *int `json:"overallCovered"`
				New            *int `json:"new"`
				NewCovered     *int `json:"newCovered"`
			} `json:"conditions"`
		} `json:"changesetStats"`
		Checks struct {
			Edges []struct {
				Node struct {
					Metrics []struct {
						Name                string `json:"name"`
						Shortcode           string `json:"shortcode"`
						Description         string `json:"description"`
						PositiveDirection   string `json:"positiveDirection"`
						Unit                string `json:"unit"`
						IsReported          bool   `json:"isReported"`
						IsThresholdEnforced bool   `json:"isThresholdEnforced"`
						Items               []struct {
							Key                string   `json:"key"`
							Threshold          *int     `json:"threshold"`
							LatestValue        *float64 `json:"latestValue"`
							LatestValueDisplay string   `json:"latestValueDisplay"`
							ThresholdStatus    string   `json:"thresholdStatus"`
						} `json:"items"`
					} `json:"metrics"`
				} `json:"node"`
			} `json:"edges"`
		} `json:"checks"`
	} `json:"run"`
}

func NewRunMetricsRequest(client graphqlclient.GraphQLClient, params RunMetricsParams) *RunMetricsRequest {
	return &RunMetricsRequest{client: client, Params: params}
}

func (r *RunMetricsRequest) Do(ctx context.Context) (*metrics.RunMetrics, error) {
	vars := map[string]any{
		"commitOid": r.Params.CommitOid,
	}
	var respData RunMetricsResponse
	if err := r.client.Query(ctx, fetchRunMetricsQuery, vars, &respData); err != nil {
		return nil, fmt.Errorf("Fetch run metrics: %w", err)
	}

	result := &metrics.RunMetrics{
		CommitOid:  respData.Run.CommitOid,
		BranchName: respData.Run.BranchName,
		Status:     respData.Run.Status,
		Metrics:    make([]metrics.RepositoryMetric, 0),
	}

	// Add changeset stats if available
	if respData.Run.ChangesetStats != nil {
		result.ChangesetStats = &metrics.ChangesetStats{
			Lines: metrics.ChangesetStatsCounts{
				Overall:        respData.Run.ChangesetStats.Lines.Overall,
				OverallCovered: respData.Run.ChangesetStats.Lines.OverallCovered,
				New:            respData.Run.ChangesetStats.Lines.New,
				NewCovered:     respData.Run.ChangesetStats.Lines.NewCovered,
			},
			Branches: metrics.ChangesetStatsCounts{
				Overall:        respData.Run.ChangesetStats.Branches.Overall,
				OverallCovered: respData.Run.ChangesetStats.Branches.OverallCovered,
				New:            respData.Run.ChangesetStats.Branches.New,
				NewCovered:     respData.Run.ChangesetStats.Branches.NewCovered,
			},
			Conditions: metrics.ChangesetStatsCounts{
				Overall:        respData.Run.ChangesetStats.Conditions.Overall,
				OverallCovered: respData.Run.ChangesetStats.Conditions.OverallCovered,
				New:            respData.Run.ChangesetStats.Conditions.New,
				NewCovered:     respData.Run.ChangesetStats.Conditions.NewCovered,
			},
		}
	}

	// Collect metrics from all checks (de-duplicate by shortcode)
	seen := make(map[string]bool)
	for _, checkEdge := range respData.Run.Checks.Edges {
		for _, m := range checkEdge.Node.Metrics {
			if m.Shortcode == "" || seen[m.Shortcode] {
				continue
			}
			seen[m.Shortcode] = true

			metric := metrics.RepositoryMetric{
				Name:                m.Name,
				Shortcode:           m.Shortcode,
				Description:         m.Description,
				PositiveDirection:   m.PositiveDirection,
				Unit:                m.Unit,
				IsReported:          m.IsReported,
				IsThresholdEnforced: m.IsThresholdEnforced,
				Items:               make([]metrics.RepositoryMetricItem, 0, len(m.Items)),
			}
			for _, item := range m.Items {
				metric.Items = append(metric.Items, metrics.RepositoryMetricItem{
					Key:                item.Key,
					Threshold:          item.Threshold,
					LatestValue:        item.LatestValue,
					LatestValueDisplay: item.LatestValueDisplay,
					ThresholdStatus:    item.ThresholdStatus,
				})
			}
			result.Metrics = append(result.Metrics, metric)
		}
	}

	return result, nil
}
