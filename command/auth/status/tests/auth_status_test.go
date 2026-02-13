package tests

import (
	"strings"
	"testing"
	"time"

	"github.com/deepsourcelabs/cli/command/cmddeps"
	statusCmd "github.com/deepsourcelabs/cli/command/auth/status"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/internal/adapters"
	"github.com/deepsourcelabs/cli/internal/secrets"
)

func createConfigManager(t *testing.T, token, host, user string, expiry time.Time) *config.Manager {
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
		TokenExpiresIn: expiry,
	}
	if err := mgr.Write(cfg); err != nil {
		t.Fatalf("failed to write test config: %v", err)
	}
	return mgr
}

func TestAuthStatusLoggedIn(t *testing.T) {
	cfgMgr := createConfigManager(t, "test-token", "deepsource.com", "user@example.com", time.Now().Add(24*time.Hour))

	deps := &cmddeps.Deps{
		ConfigMgr: cfgMgr,
	}

	cmd := statusCmd.NewCmdStatusWithDeps(deps)

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	// pterm output goes to real stdout in this case, but at least we verify no error
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

	if !strings.Contains(err.Error(), "not logged into DeepSource") {
		t.Errorf("expected not-logged-in error message, got: %s", err.Error())
	}
}

func TestAuthStatusExpired(t *testing.T) {
	cfgMgr := createConfigManager(t, "test-token", "deepsource.com", "user@example.com", time.Now().Add(-24*time.Hour))

	deps := &cmddeps.Deps{
		ConfigMgr: cfgMgr,
	}

	cmd := statusCmd.NewCmdStatusWithDeps(deps)

	// Expired token should not error, just prints a message
	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}
