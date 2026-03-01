package repo

import (
	"context"
	"errors"
	"testing"

	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/analyzers"
	"github.com/deepsourcelabs/cli/deepsource/repository"
	"github.com/deepsourcelabs/cli/internal/adapters"
	"github.com/deepsourcelabs/cli/internal/vcs"
	"github.com/stretchr/testify/assert"
)

type fakeRepoClient struct {
	status    *repository.Meta
	analyzers []analyzers.Analyzer
	err       error
}

func (f *fakeRepoClient) GetRepoStatus(_ context.Context, _, _, _ string) (*repository.Meta, error) {
	return f.status, f.err
}

func (f *fakeRepoClient) GetEnabledAnalyzers(_ context.Context, _, _, _ string) ([]analyzers.Analyzer, error) {
	return f.analyzers, f.err
}

func TestServiceStatus(t *testing.T) {
	tempDir := t.TempDir()
	homeDir := func() (string, error) { return tempDir, nil }
	mgr := config.NewManager(adapters.NewOSFileSystem(), homeDir)
	cfg := &config.CLIConfig{Host: "deepsource.com", User: "demo", Token: "token"}
	assert.NoError(t, mgr.Write(cfg))

	svc := NewService(mgr)
	svc.resolveRemote = func(_ string) (*vcs.RemoteData, error) {
		return &vcs.RemoteData{Owner: "o", RepoName: "r", VCSProvider: "GITHUB"}, nil
	}
	svc.newClient = func(_ deepsource.ClientOpts) (Client, error) {
		return &fakeRepoClient{status: &repository.Meta{Activated: true}}, nil
	}

	result, err := svc.Status(context.Background(), "")
	assert.NoError(t, err)
	if assert.NotNil(t, result) {
		assert.True(t, result.Activated)
		assert.Equal(t, "deepsource.com", result.Host)
	}
}

func TestGetDashboardHost(t *testing.T) {
	tests := []struct {
		host string
		want string
	}{
		{"deepsource.com", "app.deepsource.com"},
		{"deepsource.io", "app.deepsource.com"},
		{"deepsource.one", "app.deepsource.one"},
		{"on-prem.example.com", "on-prem.example.com"},
	}
	for _, tt := range tests {
		t.Run(tt.host, func(t *testing.T) {
			assert.Equal(t, tt.want, getDashboardHost(tt.host))
		})
	}
}

func TestServiceViewURLUnauthorized(t *testing.T) {
	tempDir := t.TempDir()
	homeDir := func() (string, error) { return tempDir, nil }
	mgr := config.NewManager(adapters.NewOSFileSystem(), homeDir)
	cfg := &config.CLIConfig{Host: "deepsource.com", User: "demo", Token: "token"}
	assert.NoError(t, mgr.Write(cfg))

	svc := NewService(mgr)
	svc.resolveRemote = func(_ string) (*vcs.RemoteData, error) {
		return &vcs.RemoteData{Owner: "o", RepoName: "r", VCSProvider: "GITHUB"}, nil
	}
	svc.newClient = func(_ deepsource.ClientOpts) (Client, error) {
		return &fakeRepoClient{err: errors.New("Repository matching query does not exist")}, nil
	}

	_, err := svc.ViewURL(context.Background(), "")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "Not logged in")
}

func TestServiceStatusWithAnalyzers_Activated(t *testing.T) {
	tempDir := t.TempDir()
	homeDir := func() (string, error) { return tempDir, nil }
	mgr := config.NewManager(adapters.NewOSFileSystem(), homeDir)
	cfg := &config.CLIConfig{Host: "deepsource.com", User: "demo", Token: "token"}
	assert.NoError(t, mgr.Write(cfg))

	svc := NewService(mgr)
	svc.resolveRemote = func(_ string) (*vcs.RemoteData, error) {
		return &vcs.RemoteData{Owner: "owner", RepoName: "cli", VCSProvider: "GITHUB"}, nil
	}
	svc.newClient = func(_ deepsource.ClientOpts) (Client, error) {
		return &fakeRepoClient{
			status: &repository.Meta{Activated: true},
			analyzers: []analyzers.Analyzer{
				{Name: "Go", Shortcode: "go"},
				{Name: "Python", Shortcode: "python"},
			},
		}, nil
	}

	result, err := svc.StatusWithAnalyzers(context.Background(), "")
	assert.NoError(t, err)
	if assert.NotNil(t, result) {
		assert.True(t, result.Activated)
		assert.Equal(t, "gh/owner/cli", result.RepoSlug)
		assert.Equal(t, "https://app.deepsource.com/gh/owner/cli/", result.DashboardURL)
		assert.Len(t, result.Analyzers, 2)
		assert.Equal(t, "go", result.Analyzers[0].Shortcode)
	}
}

func TestServiceStatusWithAnalyzers_NotActivated(t *testing.T) {
	tempDir := t.TempDir()
	homeDir := func() (string, error) { return tempDir, nil }
	mgr := config.NewManager(adapters.NewOSFileSystem(), homeDir)
	cfg := &config.CLIConfig{Host: "deepsource.com", User: "demo", Token: "token"}
	assert.NoError(t, mgr.Write(cfg))

	svc := NewService(mgr)
	svc.resolveRemote = func(_ string) (*vcs.RemoteData, error) {
		return &vcs.RemoteData{Owner: "owner", RepoName: "cli", VCSProvider: "GITHUB"}, nil
	}
	svc.newClient = func(_ deepsource.ClientOpts) (Client, error) {
		return &fakeRepoClient{status: &repository.Meta{Activated: false}}, nil
	}

	result, err := svc.StatusWithAnalyzers(context.Background(), "")
	assert.NoError(t, err)
	if assert.NotNil(t, result) {
		assert.False(t, result.Activated)
		assert.Equal(t, "gh/owner/cli", result.RepoSlug)
		assert.Empty(t, result.DashboardURL)
		assert.Nil(t, result.Analyzers)
	}
}
