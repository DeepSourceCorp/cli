package testutil

import (
	"context"
	"encoding/json"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/internal/adapters"
	"github.com/deepsourcelabs/cli/internal/secrets"
)

// CreateTestConfigManager creates a config.Manager backed by a temp directory
// with a valid token, host, and user pre-written to config.
func CreateTestConfigManager(t *testing.T, token, host, user string) *config.Manager {
	t.Helper()

	tmpDir := t.TempDir()
	fs := adapters.NewOSFileSystem()
	mgr := config.NewManagerWithSecrets(fs, func() (string, error) {
		return tmpDir, nil
	}, secrets.NoopStore{}, "")

	cfg := &config.CLIConfig{
		Token:          token,
		Host:           host,
		User:           user,
		TokenExpiresIn: time.Now().Add(24 * time.Hour),
	}
	if err := mgr.Write(cfg); err != nil {
		t.Fatalf("failed to write test config: %v", err)
	}

	return mgr
}

// CreateExpiredTestConfigManager creates a config.Manager backed by a temp directory
// with a zero-value token expiry, so IsExpired() returns true.
func CreateExpiredTestConfigManager(t *testing.T, token, host, user string) *config.Manager {
	t.Helper()

	tmpDir := t.TempDir()
	fs := adapters.NewOSFileSystem()
	mgr := config.NewManagerWithSecrets(fs, func() (string, error) {
		return tmpDir, nil
	}, secrets.NoopStore{}, "")

	cfg := &config.CLIConfig{
		Token: token,
		Host:  host,
		User:  user,
		// Zero TokenExpiresIn → IsExpired() returns true
	}
	if err := mgr.Write(cfg); err != nil {
		t.Fatalf("failed to write test config: %v", err)
	}

	return mgr
}

// LoadGoldenFile reads a golden file from the given absolute path.
func LoadGoldenFile(t *testing.T, path string) []byte {
	t.Helper()

	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("failed to read golden file %s: %v", path, err)
	}
	return data
}

// MockQueryFunc creates a graphqlclient.MockClient with a QueryFunc that
// routes based on query content substrings and returns golden file responses.
// The routes map keys are substrings matched against the GraphQL query string,
// and values are absolute paths to golden JSON response files.
func MockQueryFunc(t *testing.T, routes map[string]string) *graphqlclient.MockClient {
	t.Helper()

	type route struct {
		substring string
		data      []byte
	}
	loaded := make([]route, 0, len(routes))
	for substr, filePath := range routes {
		data, err := os.ReadFile(filePath)
		if err != nil {
			t.Fatalf("failed to read golden response file %s: %v", filePath, err)
		}
		loaded = append(loaded, route{substring: substr, data: data})
	}

	mock := graphqlclient.NewMockClient()
	mock.QueryFunc = func(_ context.Context, query string, _ map[string]any, result any) error {
		for _, r := range loaded {
			if strings.Contains(query, r.substring) {
				return json.Unmarshal(r.data, result)
			}
		}
		t.Fatalf("no mock route matched query: %s", query)
		return nil
	}
	return mock
}
