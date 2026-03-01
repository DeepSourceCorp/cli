package issues

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/deepsource/issues"
	"github.com/deepsourcelabs/cli/deepsource/pagination"
)

// Query to fetch issues for a certain file specified by the user
const fetchFileIssuesQuery = `query GetIssuesForPath(
  $name: String!
  $owner: String!
  $provider: VCSProvider!
  $limit: Int!
  $filepath: String!
  $after: String
) {
  repository(name: $name, login: $owner, vcsProvider: $provider) {
    issues(first: $limit, path:$filepath, after: $after) {
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
      pageInfo {
        hasNextPage
        endCursor
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
			PageInfo pagination.PageInfo `json:"pageInfo"`
		} `json:"issues"`
	} `json:"repository"`
}

func NewFileIssuesListRequest(client graphqlclient.GraphQLClient, params FileIssuesListParams) *FileIssuesListRequest {
	return &FileIssuesListRequest{client: client, Params: params}
}

func (f *FileIssuesListRequest) Do(ctx context.Context) ([]issues.Issue, error) {
	allIssues := make([]issues.Issue, 0)
	var cursor *string

	for {
		vars := map[string]any{
			"name":     f.Params.RepoName,
			"owner":    f.Params.Owner,
			"provider": f.Params.Provider,
			"path":     f.Params.FilePath,
			"limit":    pagination.DefaultPageSize,
		}
		if cursor != nil {
			vars["after"] = *cursor
		}

		var respData FileIssuesResponse
		if err := f.client.Query(ctx, fetchFileIssuesQuery, vars, &respData); err != nil {
			return nil, fmt.Errorf("List file issues: %w", err)
		}

		for _, edge := range respData.Repository.Issues.Edges {
			if len(edge.Node.Occurrences.Edges) == 0 {
				continue
			}

			for _, occurenceEdge := range edge.Node.Occurrences.Edges {
				if occurenceEdge.Node.Path == f.Params.FilePath {
					issueData := issues.Issue{
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
					allIssues = append(allIssues, issueData)
				}
			}
		}

		if len(allIssues) >= pagination.MaxResults {
			break
		}
		if !respData.Repository.Issues.PageInfo.HasNextPage {
			break
		}
		cursor = respData.Repository.Issues.PageInfo.EndCursor
	}

	return allIssues, nil
}
