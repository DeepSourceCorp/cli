package issues

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/deepsource/issues"
	"github.com/deepsourcelabs/cli/deepsource/pagination"
)

const fetchPRIssuesQuery = `query GetPRIssues(
  $name: String!
  $owner: String!
  $provider: VCSProvider!
  $prNumber: Int!
  $limit: Int!
  $after: String
  $source: AnalysisIssueSource
  $category: IssueCategory
  $severity: IssueSeverity
  $q: String
) {
  repository(name: $name, login: $owner, vcsProvider: $provider) {
    pullRequest(number: $prNumber) {
      issues(first: $limit, after: $after, source: $source, category: $category, severity: $severity, q: $q) {
        edges {
          node {
            source
            path
            beginLine
            endLine
            title
            shortcode
            category
            severity
            explanation
            issue {
              analyzer {
                name
                shortcode
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
}`

type PRIssuesListParams struct {
	Owner    string
	RepoName string
	Provider string
	PRNumber int
	Source   *string
	Category *string
	Severity *string
	Q        *string
}

type PRIssuesListRequest struct {
	client graphqlclient.GraphQLClient
	Params PRIssuesListParams
}

type PRIssuesListResponse struct {
	Repository struct {
		PullRequest struct {
			Issues struct {
				Edges []struct {
					Node struct {
						Source      string `json:"source"`
						Path       string `json:"path"`
						BeginLine  int    `json:"beginLine"`
						EndLine    int    `json:"endLine"`
						Title      string `json:"title"`
						Shortcode  string `json:"shortcode"`
						Category   string `json:"category"`
						Severity   string `json:"severity"`
						Explanation string `json:"explanation"`
						Issue       *struct {
							Analyzer struct {
								Name      string `json:"name"`
								Shortcode string `json:"shortcode"`
							} `json:"analyzer"`
						} `json:"issue"`
					} `json:"node"`
				} `json:"edges"`
				PageInfo pagination.PageInfo `json:"pageInfo"`
			} `json:"issues"`
		} `json:"pullRequest"`
	} `json:"repository"`
}

func NewPRIssuesListRequest(client graphqlclient.GraphQLClient, params PRIssuesListParams) *PRIssuesListRequest {
	return &PRIssuesListRequest{client: client, Params: params}
}

func (r *PRIssuesListRequest) Do(ctx context.Context) ([]issues.Issue, error) {
	allIssues := make([]issues.Issue, 0)
	var cursor *string

	for {
		vars := map[string]any{
			"name":     r.Params.RepoName,
			"owner":    r.Params.Owner,
			"provider": r.Params.Provider,
			"prNumber": r.Params.PRNumber,
			"limit":    pagination.DefaultPageSize,
		}
		if cursor != nil {
			vars["after"] = *cursor
		}
		if r.Params.Source != nil {
			vars["source"] = *r.Params.Source
		}
		if r.Params.Category != nil {
			vars["category"] = *r.Params.Category
		}
		if r.Params.Severity != nil {
			vars["severity"] = *r.Params.Severity
		}
		if r.Params.Q != nil {
			vars["q"] = *r.Params.Q
		}

		var respData PRIssuesListResponse
		if err := r.client.Query(ctx, fetchPRIssuesQuery, vars, &respData); err != nil {
			return nil, fmt.Errorf("List PR issues: %w", err)
		}

		for _, edge := range respData.Repository.PullRequest.Issues.Edges {
			node := edge.Node
			issue := issues.Issue{
				IssueText:     node.Title,
				IssueCode:     node.Shortcode,
				IssueCategory: node.Category,
				IssueSeverity: node.Severity,
				IssueSource:   node.Source,
				Description:   node.Explanation,
				Location: issues.Location{
					Path: node.Path,
					Position: issues.Position{
						BeginLine: node.BeginLine,
						EndLine:   node.EndLine,
					},
				},
			}
			if node.Issue != nil {
				issue.Analyzer = issues.AnalyzerMeta{
					Name:      node.Issue.Analyzer.Name,
					Shortcode: node.Issue.Analyzer.Shortcode,
				}
			}
			allIssues = append(allIssues, issue)
		}

		if len(allIssues) >= pagination.MaxResults {
			break
		}
		if !respData.Repository.PullRequest.Issues.PageInfo.HasNextPage {
			break
		}
		cursor = respData.Repository.PullRequest.Issues.PageInfo.EndCursor
	}

	return allIssues, nil
}
