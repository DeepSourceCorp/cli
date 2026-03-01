package tests

import (
	"context"
	"fmt"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
	"time"

	statusCmd "github.com/deepsourcelabs/cli/command/auth/status"
	"github.com/deepsourcelabs/cli/command/cmddeps"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/internal/adapters"
	clierrors "github.com/deepsourcelabs/cli/internal/errors"
	"github.com/deepsourcelabs/cli/internal/testutil"
)

func goldenPath(name string) string {
	_, filename, _, _ := runtime.Caller(0)
	return filepath.Join(filepath.Dir(filename), "golden_files", name)
}

func createConfigManager(t *testing.T, token, host, user string, expiry time.Time) *config.Manager {
	t.Helper()
	tmpDir := t.TempDir()
	fs := adapters.NewOSFileSystem()
	mgr := config.NewManager(fs, func() (string, error) {
		return tmpDir, nil
	})

	cfg := &config.CLIConfig{
		Token:          token,
		Host:           host,
		User:           user,
		TokenExpiresIn: expiry,
	}
	if err := mgr.Write(cfg); err != nil {
		t.Fatalf("failed to write test config: %v", err)
	}
	return mgr
}

func TestAuthStatusLoggedIn(t *testing.T) {
	cfgMgr := createConfigManager(t, "test-token", "deepsource.com", "user@example.com", time.Now().Add(24*time.Hour))

	mock := testutil.MockQueryFunc(t, map[string]string{
		"viewer": goldenPath("viewer_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf strings.Builder
	deps := &cmddeps.Deps{
		ConfigMgr: cfgMgr,
		Client:    client,
		Stdout:    &buf,
	}

	cmd := statusCmd.NewCmdStatusWithDeps(deps)

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.Contains(buf.String(), "Logged in to DeepSource as") {
		t.Errorf("expected logged-in message, got: %q", buf.String())
	}
}

func TestAuthStatusNotLoggedIn(t *testing.T) {
	cfgMgr := createConfigManager(t, "", "deepsource.com", "", time.Time{})

	deps := &cmddeps.Deps{
		ConfigMgr: cfgMgr,
	}

	cmd := statusCmd.NewCmdStatusWithDeps(deps)

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error for not logged in, got nil")
	}

	if !strings.Contains(err.Error(), "Not logged in") {
		t.Errorf("expected not-logged-in error message, got: %s", err.Error())
	}
}

func TestAuthStatusExpired(t *testing.T) {
	cfgMgr := createConfigManager(t, "test-token", "deepsource.com", "user@example.com", time.Now().Add(-24*time.Hour))

	var buf strings.Builder
	deps := &cmddeps.Deps{
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
	}

	cmd := statusCmd.NewCmdStatusWithDeps(deps)

	// Expired token should not error, just prints a message
	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.Contains(buf.String(), "Authentication expired") {
		t.Errorf("expected expired message, got: %q", buf.String())
	}
}

func TestAuthStatusEnvVarToken(t *testing.T) {
	// No config file — token comes purely from env var
	tmpDir := t.TempDir()
	fs := adapters.NewOSFileSystem()
	cfgMgr := config.NewManager(fs, func() (string, error) {
		return tmpDir, nil
	})

	t.Setenv("DEEPSOURCE_TOKEN", "env-test-token")

	mock := testutil.MockQueryFunc(t, map[string]string{
		"viewer": goldenPath("viewer_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf strings.Builder
	deps := &cmddeps.Deps{
		ConfigMgr: cfgMgr,
		Client:    client,
		Stdout:    &buf,
	}

	cmd := statusCmd.NewCmdStatusWithDeps(deps)

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.Contains(buf.String(), "(via DEEPSOURCE_TOKEN)") {
		t.Errorf("expected env var source indicator, got: %q", buf.String())
	}
}

func TestAuthStatusServerRejected(t *testing.T) {
	cfgMgr := createConfigManager(t, "test-token", "deepsource.com", "user@example.com", time.Now().Add(24*time.Hour))

	// Mock client that returns an auth error from GetViewer
	mock := graphqlclient.NewMockClient()
	mock.QueryFunc = func(_ context.Context, query string, _ map[string]any, _ any) error {
		return clierrors.ErrTokenExpired(fmt.Errorf("token revoked"))
	}
	client := deepsource.NewWithGraphQLClient(mock)

	var buf strings.Builder
	deps := &cmddeps.Deps{
		ConfigMgr: cfgMgr,
		Client:    client,
		Stdout:    &buf,
	}

	cmd := statusCmd.NewCmdStatusWithDeps(deps)

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.Contains(buf.String(), "Authentication expired") {
		t.Errorf("expected expired message for server-rejected token, got: %q", buf.String())
	}
}
