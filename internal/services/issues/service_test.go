package issues

import (
	"context"
	"path/filepath"
	"testing"

	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/issues"
	"github.com/deepsourcelabs/cli/internal/adapters"
	"github.com/deepsourcelabs/cli/internal/secrets"
	"github.com/deepsourcelabs/cli/internal/vcs"
	"github.com/stretchr/testify/assert"
)

type fakeIssuesClient struct {
	issues []issues.Issue
}

func (f *fakeIssuesClient) GetIssues(ctx context.Context, owner, repoName, provider string, limit int) ([]issues.Issue, error) {
	return f.issues, nil
}

func TestServiceListFilters(t *testing.T) {
	tempDir := t.TempDir()
	homeDir := func() (string, error) { return tempDir, nil }
	mgr := config.NewManagerWithSecrets(adapters.NewOSFileSystem(), homeDir, secrets.NoopStore{}, "test-key")

	cfg := &config.CLIConfig{Host: "deepsource.io", User: "demo", Token: "token"}
	assert.NoError(t, mgr.Write(cfg))

	svc := NewService(mgr)
	svc.resolveRemote = func(repoArg string) (*vcs.RemoteData, error) {
		return &vcs.RemoteData{Owner: "o", RepoName: "r", VCSProvider: "GITHUB"}, nil
	}
	svc.newClient = func(opts deepsource.ClientOpts) (Client, error) {
		return &fakeIssuesClient{issues: []issues.Issue{
			{IssueCode: "A", IssueText: "one", Analyzer: issues.AnalyzerMeta{Shortcode: "py"}, Location: issues.Location{Path: "src/app.py", Position: issues.Position{BeginLine: 1, EndLine: 1}}},
			{IssueCode: "B", IssueText: "two", Analyzer: issues.AnalyzerMeta{Shortcode: "js"}, Location: issues.Location{Path: "src/app.js", Position: issues.Position{BeginLine: 2, EndLine: 2}}},
		}}, nil
	}

	result, err := svc.List(context.Background(), ListOptions{RepoArg: "", FileArgs: []string{"src"}, AnalyzerArgs: []string{"py"}, Limit: 30})
	assert.NoError(t, err)
	if assert.NotNil(t, result) {
		assert.Len(t, result.Issues, 1)
		assert.Equal(t, "A", result.Issues[0].IssueCode)
	}
}

func TestServiceListMissingAuth(t *testing.T) {
	tempDir := t.TempDir()
	homeDir := func() (string, error) { return tempDir, nil }
	mgr := config.NewManagerWithSecrets(adapters.NewOSFileSystem(), homeDir, secrets.NoopStore{}, "test-key")

	cfg := &config.CLIConfig{Host: "deepsource.io"}
	assert.NoError(t, mgr.Write(cfg))

	svc := NewService(mgr)
	svc.resolveRemote = func(repoArg string) (*vcs.RemoteData, error) {
		return &vcs.RemoteData{Owner: "o", RepoName: "r", VCSProvider: "GITHUB"}, nil
	}

	_, err := svc.List(context.Background(), ListOptions{RepoArg: "", Limit: 30})
	assert.Error(t, err)
}

func TestFilterIssuesByPath(t *testing.T) {
	issuesData := []issues.Issue{
		{IssueCode: "A", Location: issues.Location{Path: filepath.Join("src", "app.py")}},
		{IssueCode: "B", Location: issues.Location{Path: filepath.Join("docs", "readme.md")}},
	}
	filtered, err := FilterIssuesByPath("src", issuesData)
	assert.NoError(t, err)
	assert.Len(t, filtered, 1)
	assert.Equal(t, "A", filtered[0].IssueCode)
}
