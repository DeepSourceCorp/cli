package queries

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/deepsource/metrics"
)

const fetchRepoMetricsQuery = `query GetRepoMetrics(
  $name: String!
  $owner: String!
  $provider: VCSProvider!
) {
  repository(name: $name, login: $owner, vcsProvider: $provider) {
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
}`

type RepoMetricsParams struct {
	Owner    string
	RepoName string
	Provider string
}

type RepoMetricsRequest struct {
	client graphqlclient.GraphQLClient
	Params RepoMetricsParams
}

type RepoMetricsResponse struct {
	Repository struct {
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
	} `json:"repository"`
}

func NewRepoMetricsRequest(client graphqlclient.GraphQLClient, params RepoMetricsParams) *RepoMetricsRequest {
	return &RepoMetricsRequest{client: client, Params: params}
}

func (r *RepoMetricsRequest) Do(ctx context.Context) ([]metrics.RepositoryMetric, error) {
	vars := map[string]any{
		"name":     r.Params.RepoName,
		"owner":    r.Params.Owner,
		"provider": r.Params.Provider,
	}
	var respData RepoMetricsResponse
	if err := r.client.Query(ctx, fetchRepoMetricsQuery, vars, &respData); err != nil {
		return nil, fmt.Errorf("Fetch repo metrics: %w", err)
	}

	result := make([]metrics.RepositoryMetric, 0, len(respData.Repository.Metrics))
	for _, m := range respData.Repository.Metrics {
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
		result = append(result, metric)
	}

	return result, nil
}
