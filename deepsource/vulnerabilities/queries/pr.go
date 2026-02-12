// Fetches vulnerabilities from a pull request
package queries

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/deepsource/vulnerabilities"
)

const fetchPRVulnsQuery = `query GetPRVulns(
  $name: String!
  $owner: String!
  $provider: VCSProvider!
  $prNumber: Int!
  $limit: Int!
) {
  repository(name: $name, login: $owner, vcsProvider: $provider) {
    pullRequest(number: $prNumber) {
      number
      title
      baseBranch
      branch
      vulnerabilityOccurrences(first: $limit) {
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
  }
}`

type PRVulnsParams struct {
	Owner    string
	RepoName string
	Provider string
	PRNumber int
	Limit    int
}

type PRVulnsRequest struct {
	client graphqlclient.GraphQLClient
	Params PRVulnsParams
}

type PRVulnsResponse struct {
	Repository struct {
		PullRequest struct {
			Number                   int    `json:"number"`
			Title                    string `json:"title"`
			BaseBranch               string `json:"baseBranch"`
			Branch                   string `json:"branch"`
			VulnerabilityOccurrences struct {
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
			} `json:"vulnerabilityOccurrences"`
		} `json:"pullRequest"`
	} `json:"repository"`
}

func NewPRVulnsRequest(client graphqlclient.GraphQLClient, params PRVulnsParams) *PRVulnsRequest {
	return &PRVulnsRequest{client: client, Params: params}
}

func (r *PRVulnsRequest) Do(ctx context.Context) (*vulnerabilities.PRVulns, error) {
	vars := map[string]any{
		"name":     r.Params.RepoName,
		"owner":    r.Params.Owner,
		"provider": r.Params.Provider,
		"prNumber": r.Params.PRNumber,
		"limit":    r.Params.Limit,
	}
	var respData PRVulnsResponse
	if err := r.client.Query(ctx, fetchPRVulnsQuery, vars, &respData); err != nil {
		return nil, fmt.Errorf("Fetch PR vulnerabilities: %w", err)
	}

	pr := respData.Repository.PullRequest
	result := &vulnerabilities.PRVulns{
		Number:     pr.Number,
		Title:      pr.Title,
		BaseBranch: pr.BaseBranch,
		Branch:     pr.Branch,
		Vulns:      make([]vulnerabilities.VulnerabilityOccurrence, 0),
	}

	for _, edge := range pr.VulnerabilityOccurrences.Edges {
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
		result.Vulns = append(result.Vulns, v)
	}

	return result, nil
}
