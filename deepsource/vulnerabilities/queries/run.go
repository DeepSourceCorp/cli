// Fetches vulnerabilities from a specific analysis run
package queries

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/deepsource/vulnerabilities"
)

const fetchRunVulnsQuery = `query GetRunVulns($commitOid: String!, $limit: Int!) {
  run(commitOid: $commitOid) {
    commitOid
    branchName
    status
    scaChecks {
      edges {
        node {
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
                  aliases
                  epssScore
                  referenceUrls
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
    }
  }
}`

type RunVulnsParams struct {
	CommitOid string
	Limit     int
}

type RunVulnsRequest struct {
	client graphqlclient.GraphQLClient
	Params RunVulnsParams
}

type RunVulnsResponse struct {
	Run struct {
		CommitOid  string `json:"commitOid"`
		BranchName string `json:"branchName"`
		Status     string `json:"status"`
		ScaChecks  struct {
			Edges []struct {
				Node struct {
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
									Aliases         []string `json:"aliases"`
									EpssScore       *float64 `json:"epssScore"`
									ReferenceUrls   []string `json:"referenceUrls"`
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
				} `json:"node"`
			} `json:"edges"`
		} `json:"scaChecks"`
	} `json:"run"`
}

func NewRunVulnsRequest(client graphqlclient.GraphQLClient, params RunVulnsParams) *RunVulnsRequest {
	return &RunVulnsRequest{client: client, Params: params}
}

func (r *RunVulnsRequest) Do(ctx context.Context) (*vulnerabilities.RunVulns, error) {
	vars := map[string]any{
		"commitOid": r.Params.CommitOid,
		"limit":     r.Params.Limit,
	}
	var respData RunVulnsResponse
	if err := r.client.Query(ctx, fetchRunVulnsQuery, vars, &respData); err != nil {
		return nil, fmt.Errorf("Fetch run vulnerabilities: %w", err)
	}

	result := &vulnerabilities.RunVulns{
		CommitOid:  respData.Run.CommitOid,
		BranchName: respData.Run.BranchName,
		Status:     respData.Run.Status,
		Vulns:      make([]vulnerabilities.VulnerabilityOccurrence, 0),
	}

	// Collect vulns from all SCA checks
	for _, checkEdge := range respData.Run.ScaChecks.Edges {
		for _, vulnEdge := range checkEdge.Node.VulnerabilityOccurrences.Edges {
			node := vulnEdge.Node
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
					Aliases:         node.Vulnerability.Aliases,
					EpssScore:       node.Vulnerability.EpssScore,
					ReferenceUrls:   node.Vulnerability.ReferenceUrls,
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
	}

	return result, nil
}
