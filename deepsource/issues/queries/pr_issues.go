// Lists the issues from a pull request
package issues

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/deepsource/issues"
)

const fetchPRIssuesQuery = `query GetPRIssues(
  $name: String!
  $owner: String!
  $provider: VCSProvider!
  $prNumber: Int!
  $limit: Int!
) {
  repository(name: $name, login: $owner, vcsProvider: $provider) {
    pullRequest(number: $prNumber) {
      issueOccurrences(first: $limit) {
        edges {
          node {
            path
            beginLine
            endLine
            title
            issue {
              shortcode
              shortDescription
              category
              severity
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
}`

type PRIssuesListParams struct {
	Owner    string
	RepoName string
	Provider string
	PRNumber int
	Limit    int
}

type PRIssuesListRequest struct {
	client graphqlclient.GraphQLClient
	Params PRIssuesListParams
}

type PRIssuesListResponse struct {
	Repository struct {
		PullRequest struct {
			IssueOccurrences struct {
				Edges []struct {
					Node struct {
						Path      string `json:"path"`
						BeginLine int    `json:"beginLine"`
						EndLine   int    `json:"endLine"`
						Title     string `json:"title"`
						Issue struct {
							Shortcode        string `json:"shortcode"`
							ShortDescription string `json:"shortDescription"`
							Category         string `json:"category"`
							Severity         string `json:"severity"`
							Analyzer         struct {
								Name      string `json:"name"`
								Shortcode string `json:"shortcode"`
							} `json:"analyzer"`
						} `json:"issue"`
					} `json:"node"`
				} `json:"edges"`
			} `json:"issueOccurrences"`
		} `json:"pullRequest"`
	} `json:"repository"`
}

func NewPRIssuesListRequest(client graphqlclient.GraphQLClient, params PRIssuesListParams) *PRIssuesListRequest {
	return &PRIssuesListRequest{client: client, Params: params}
}

func (r *PRIssuesListRequest) Do(ctx context.Context) ([]issues.Issue, error) {
	vars := map[string]interface{}{
		"name":     r.Params.RepoName,
		"owner":    r.Params.Owner,
		"provider": r.Params.Provider,
		"prNumber": r.Params.PRNumber,
		"limit":    r.Params.Limit,
	}
	var respData PRIssuesListResponse
	if err := r.client.Query(ctx, fetchPRIssuesQuery, vars, &respData); err != nil {
		return nil, fmt.Errorf("List PR issues: %w", err)
	}

	result := make([]issues.Issue, 0)
	for _, edge := range respData.Repository.PullRequest.IssueOccurrences.Edges {
		node := edge.Node
		issue := issues.Issue{
			IssueText:     node.Title,
			IssueCode:     node.Issue.Shortcode,
			IssueCategory: node.Issue.Category,
			IssueSeverity: node.Issue.Severity,
			Description:   node.Issue.ShortDescription,
			Location: issues.Location{
				Path: node.Path,
				Position: issues.Position{
					BeginLine: node.BeginLine,
					EndLine:   node.EndLine,
				},
			},
			Analyzer: issues.AnalyzerMeta{
				Name:      node.Issue.Analyzer.Name,
				Shortcode: node.Issue.Analyzer.Shortcode,
			},
		}
		result = append(result, issue)
	}

	return result, nil
}
