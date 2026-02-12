// Lists the issues reported in a single file mentioned by the user
package issues

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/deepsource/issues"
)

// Query to fetch issues for a certain file specified by the user
const fetchFileIssuesQuery = `query GetIssuesForPath(
  $name: String!
  $owner: String!
  $provider: VCSProvider!
  $limit: Int!
  $filepath: String!
) {
  repository(name: $name, login: $owner, vcsProvider: $provider) {
    issues(first: $limit, path:$filepath) {
      edges {
        node {
          issue {
            shortcode
          }
          occurrences {
            edges {
              node {
                path
                beginLine
                endLine
                issue {
                  title
                  shortcode
                  category
                  isRecommended
                  analyzer {
                    name
                    shortcode
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`

type FileIssuesListParams struct {
	Owner    string
	RepoName string
	Provider string
	FilePath string
	Limit    int
}

// Request struct
type FileIssuesListRequest struct {
	client graphqlclient.GraphQLClient
	Params FileIssuesListParams
}

// Response struct
type FileIssuesResponse struct {
	Repository struct {
		Issues struct {
			Edges []struct {
				Node struct {
					Occurrences struct {
						Edges []struct {
							Node struct {
								Path      string `json:"path"`
								BeginLine int    `json:"beginLine"`
								EndLine   int    `json:"endLine"`
								Issue     struct {
									Title         string `json:"title"`
									Shortcode     string `json:"shortcode"`
									Category      string `json:"category"`
									IsRecommended bool   `json:"isRecommended"`
									Analyzer      struct {
										Name      string `json:"name"`
										Shortcode string `json:"shortcode"`
									} `json:"analyzer"`
								} `json:"issue"`
							} `json:"node"`
						} `json:"edges"`
					} `json:"occurrences"`
				} `json:"node"`
			} `json:"edges"`
		} `json:"issues"`
	} `json:"repository"`
}

func NewFileIssuesListRequest(client graphqlclient.GraphQLClient, params FileIssuesListParams) *FileIssuesListRequest {
	return &FileIssuesListRequest{client: client, Params: params}
}

func (f *FileIssuesListRequest) Do(ctx context.Context) ([]issues.Issue, error) {
	vars := map[string]interface{}{
		"name":     f.Params.RepoName,
		"owner":    f.Params.Owner,
		"provider": f.Params.Provider,
		"path":     f.Params.FilePath,
		"limit":    f.Params.Limit,
	}
	var respData FileIssuesResponse
	if err := f.client.Query(ctx, fetchFileIssuesQuery, vars, &respData); err != nil {
		return nil, fmt.Errorf("List file issues: %w", err)
	}

	// Formatting the query response w.r.t the output format of the SDK as specified in `issues_list.go`
	issuesData := []issues.Issue{}
	issueData := issues.Issue{}
	for _, edge := range respData.Repository.Issues.Edges {
		if len(edge.Node.Occurrences.Edges) == 0 {
			continue
		}

		for _, occurenceEdge := range edge.Node.Occurrences.Edges {
			// Check if the path matches the one entered as a flag in the command
			if occurenceEdge.Node.Path == f.Params.FilePath {
				issueData = issues.Issue{
					IssueText: occurenceEdge.Node.Issue.Title,
					IssueCode: occurenceEdge.Node.Issue.Shortcode,
					Location: issues.Location{
						Path: occurenceEdge.Node.Path,
						Position: issues.Position{
							BeginLine: occurenceEdge.Node.BeginLine,
							EndLine:   occurenceEdge.Node.EndLine,
						},
					},
					Analyzer: issues.AnalyzerMeta{
						Shortcode: occurenceEdge.Node.Issue.Analyzer.Shortcode,
					},
				}
			}
			issuesData = append(issuesData, issueData)
		}
	}

	return issuesData, nil
}
