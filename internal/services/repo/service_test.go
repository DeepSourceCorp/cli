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
	"github.com/deepsourcelabs/cli/internal/secrets"
	"github.com/deepsourcelabs/cli/internal/vcs"
	"github.com/stretchr/testify/assert"
)

type fakeRepoClient struct {
	status *repository.Meta
	err    error
}

func (f *fakeRepoClient) GetRepoStatus(_ context.Context, _, _, _ string) (*repository.Meta, error) {
	return f.status, f.err
}

func (f *fakeRepoClient) GetEnabledAnalyzers(_ context.Context, _, _, _ string) ([]analyzers.Analyzer, error) {
	return nil, f.err
}

func TestServiceStatus(t *testing.T) {
	tempDir := t.TempDir()
	homeDir := func() (string, error) { return tempDir, nil }
	mgr := config.NewManagerWithSecrets(adapters.NewOSFileSystem(), homeDir, secrets.NoopStore{}, "test-key")
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

func TestServiceViewURLUnauthorized(t *testing.T) {
	tempDir := t.TempDir()
	homeDir := func() (string, error) { return tempDir, nil }
	mgr := config.NewManagerWithSecrets(adapters.NewOSFileSystem(), homeDir, secrets.NoopStore{}, "test-key")
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
	assert.Contains(t, err.Error(), "Unauthorized")
}
