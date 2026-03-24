package issues

import (
	"context"
	"encoding/json"
	"fmt"
	"testing"

	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
)

func TestPRIssuesList_Do(t *testing.T) {
	respJSON := `{
  "repository": {
    "pullRequest": {
      "issues": {
        "edges": [
          {
            "node": {
              "source": "static",
              "path": "cmd/deepsource/main.go",
              "beginLine": 42,
              "endLine": 42,
              "title": "Unchecked error return value",
              "shortcode": "GO-W1007",
              "category": "BUG_RISK",
              "severity": "MAJOR",
              "explanation": "Return value not checked",
              "issue": {
                "analyzer": {
                  "name": "Go",
                  "shortcode": "go"
                }
              }
            }
          },
          {
            "node": {
              "source": "ai",
              "path": "internal/vcs/remotes.go",
              "beginLine": 87,
              "endLine": 91,
              "title": "HTTP request with user-controlled URL",
              "shortcode": "GO-S1010",
              "category": "SECURITY",
              "severity": "MAJOR",
              "explanation": "SSRF risk",
              "issue": null
            }
          }
        ],
        "pageInfo": {
          "hasNextPage": false,
          "endCursor": null
        }
      }
    }
  }
}`

	mock := graphqlclient.NewMockClient()
	mock.QueryFunc = func(_ context.Context, _ string, _ map[string]any, result any) error {
		return json.Unmarshal([]byte(respJSON), result)
	}

	req := NewPRIssuesListRequest(mock, PRIssuesListParams{
		Owner:    "testowner",
		RepoName: "testrepo",
		Provider: "GITHUB",
		PRNumber: 42,
	})

	issues, err := req.Do(context.Background())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(issues) != 2 {
		t.Fatalf("expected 2 issues, got %d", len(issues))
	}

	// First issue: has analyzer
	if issues[0].IssueCode != "GO-W1007" {
		t.Errorf("expected issue code GO-W1007, got %s", issues[0].IssueCode)
	}
	if issues[0].IssueText != "Unchecked error return value" {
		t.Errorf("expected title 'Unchecked error return value', got %s", issues[0].IssueText)
	}
	if issues[0].IssueCategory != "BUG_RISK" {
		t.Errorf("expected category BUG_RISK, got %s", issues[0].IssueCategory)
	}
	if issues[0].Analyzer.Name != "Go" {
		t.Errorf("expected analyzer name 'Go', got %s", issues[0].Analyzer.Name)
	}
	if issues[0].Location.Path != "cmd/deepsource/main.go" {
		t.Errorf("expected path 'cmd/deepsource/main.go', got %s", issues[0].Location.Path)
	}

	// Second issue: nil analyzer (AI-detected)
	if issues[1].IssueCode != "GO-S1010" {
		t.Errorf("expected issue code GO-S1010, got %s", issues[1].IssueCode)
	}
	if issues[1].Analyzer.Name != "" {
		t.Errorf("expected empty analyzer name for nil issue, got %s", issues[1].Analyzer.Name)
	}
	if issues[1].IssueSource != "ai" {
		t.Errorf("expected source 'ai', got %s", issues[1].IssueSource)
	}
}

func TestPRIssuesList_QueryError(t *testing.T) {
	mock := graphqlclient.NewMockClient()
	mock.QueryFunc = func(_ context.Context, _ string, _ map[string]any, _ any) error {
		return fmt.Errorf("network error")
	}

	req := NewPRIssuesListRequest(mock, PRIssuesListParams{
		Owner:    "testowner",
		RepoName: "testrepo",
		Provider: "GITHUB",
		PRNumber: 42,
	})

	_, err := req.Do(context.Background())
	if err == nil {
		t.Fatal("expected error from query")
	}
}
