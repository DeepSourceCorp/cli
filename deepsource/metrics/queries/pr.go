// Fetches metrics from a pull request
package queries

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/deepsource/metrics"
)

const fetchPRMetricsQuery = `query GetPRMetrics(
  $name: String!
  $owner: String!
  $provider: VCSProvider!
  $prNumber: Int!
) {
  repository(name: $name, login: $owner, vcsProvider: $provider) {
    pullRequest(number: $prNumber) {
      number
      title
      baseBranch
      branch
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
}`

type PRMetricsParams struct {
	Owner    string
	RepoName string
	Provider string
	PRNumber int
}

type PRMetricsRequest struct {
	client graphqlclient.GraphQLClient
	Params PRMetricsParams
}

type PRMetricsResponse struct {
	Repository struct {
		PullRequest struct {
			Number     int    `json:"number"`
			Title      string `json:"title"`
			BaseBranch string `json:"baseBranch"`
			Branch     string `json:"branch"`
			Metrics    []struct {
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
		} `json:"pullRequest"`
	} `json:"repository"`
}

func NewPRMetricsRequest(client graphqlclient.GraphQLClient, params PRMetricsParams) *PRMetricsRequest {
	return &PRMetricsRequest{client: client, Params: params}
}

func (r *PRMetricsRequest) Do(ctx context.Context) (*metrics.PRMetrics, error) {
	vars := map[string]any{
		"name":     r.Params.RepoName,
		"owner":    r.Params.Owner,
		"provider": r.Params.Provider,
		"prNumber": r.Params.PRNumber,
	}
	var respData PRMetricsResponse
	if err := r.client.Query(ctx, fetchPRMetricsQuery, vars, &respData); err != nil {
		return nil, fmt.Errorf("Fetch PR metrics: %w", err)
	}

	pr := respData.Repository.PullRequest
	result := &metrics.PRMetrics{
		Number:     pr.Number,
		Title:      pr.Title,
		BaseBranch: pr.BaseBranch,
		Branch:     pr.Branch,
		Metrics:    make([]metrics.RepositoryMetric, 0, len(pr.Metrics)),
	}

	for _, m := range pr.Metrics {
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

	return result, nil
}
