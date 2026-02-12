// Fetches vulnerabilities from a repository's default branch
package queries

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/deepsource/vulnerabilities"
)

const fetchRepoVulnsQuery = `query GetRepoVulns(
  $name: String!
  $owner: String!
  $provider: VCSProvider!
  $limit: Int!
) {
  repository(name: $name, login: $owner, vcsProvider: $provider) {
    dependencyVulnerabilityOccurrences(first: $limit) {
      edges {
        node {
          id
          reachability
          fixability
          vulnerability {
            identifier
            severity
            summary
            cvssV3BaseScore
            fixedVersions
          }
          package {
            name
            ecosystem
          }
          packageVersion {
            version
          }
        }
      }
    }
  }
}`

type RepoVulnsParams struct {
	Owner    string
	RepoName string
	Provider string
	Limit    int
}

type RepoVulnsRequest struct {
	client graphqlclient.GraphQLClient
	Params RepoVulnsParams
}

type RepoVulnsResponse struct {
	Repository struct {
		DependencyVulnerabilityOccurrences struct {
			Edges []struct {
				Node struct {
					ID           string `json:"id"`
					Reachability string `json:"reachability"`
					Fixability   string `json:"fixability"`
					Vulnerability struct {
						Identifier      string   `json:"identifier"`
						Severity        string   `json:"severity"`
						Summary         string   `json:"summary"`
						CvssV3BaseScore *float64 `json:"cvssV3BaseScore"`
						FixedVersions   []string `json:"fixedVersions"`
					} `json:"vulnerability"`
					Package struct {
						Name      string `json:"name"`
						Ecosystem string `json:"ecosystem"`
					} `json:"package"`
					PackageVersion struct {
						Version string `json:"version"`
					} `json:"packageVersion"`
				} `json:"node"`
			} `json:"edges"`
		} `json:"dependencyVulnerabilityOccurrences"`
	} `json:"repository"`
}

func NewRepoVulnsRequest(client graphqlclient.GraphQLClient, params RepoVulnsParams) *RepoVulnsRequest {
	return &RepoVulnsRequest{client: client, Params: params}
}

func (r *RepoVulnsRequest) Do(ctx context.Context) ([]vulnerabilities.VulnerabilityOccurrence, error) {
	vars := map[string]any{
		"name":     r.Params.RepoName,
		"owner":    r.Params.Owner,
		"provider": r.Params.Provider,
		"limit":    r.Params.Limit,
	}
	var respData RepoVulnsResponse
	if err := r.client.Query(ctx, fetchRepoVulnsQuery, vars, &respData); err != nil {
		return nil, fmt.Errorf("Fetch repo vulnerabilities: %w", err)
	}

	result := make([]vulnerabilities.VulnerabilityOccurrence, 0)
	for _, edge := range respData.Repository.DependencyVulnerabilityOccurrences.Edges {
		node := edge.Node
		v := vulnerabilities.VulnerabilityOccurrence{
			ID:           node.ID,
			Reachability: node.Reachability,
			Fixability:   node.Fixability,
			Vulnerability: vulnerabilities.Vulnerability{
				Identifier:      node.Vulnerability.Identifier,
				Severity:        node.Vulnerability.Severity,
				Summary:         node.Vulnerability.Summary,
				CvssV3BaseScore: node.Vulnerability.CvssV3BaseScore,
				FixedVersions:   node.Vulnerability.FixedVersions,
			},
			Package: vulnerabilities.Package{
				Name:      node.Package.Name,
				Ecosystem: node.Package.Ecosystem,
			},
			PackageVersion: vulnerabilities.PackageVersion{
				Version: node.PackageVersion.Version,
			},
		}
		result = append(result, v)
	}

	return result, nil
}
