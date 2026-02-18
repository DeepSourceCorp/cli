package tests

import (
	"testing"

	"github.com/deepsourcelabs/cli/command/cmddeps"
	loginCmd "github.com/deepsourcelabs/cli/command/auth/login"
	"github.com/deepsourcelabs/cli/internal/testutil"
)

func TestLoginPATFlow(t *testing.T) {
	// Empty token → IsExpired() returns true → skips re-auth prompt
	cfgMgr := testutil.CreateExpiredTestConfigManager(t, "", "deepsource.com", "")

	deps := &cmddeps.Deps{
		ConfigMgr: cfgMgr,
	}

	cmd := loginCmd.NewCmdLoginWithDeps(deps)
	cmd.SetArgs([]string{"--with-token", "dsp_abc123"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Verify token was saved
	cfg, err := cfgMgr.Load()
	if err != nil {
		t.Fatalf("failed to load config: %v", err)
	}
	if cfg.Token != "dsp_abc123" {
		t.Errorf("expected token %q, got %q", "dsp_abc123", cfg.Token)
	}
	if cfg.Host != "deepsource.com" {
		t.Errorf("expected host %q, got %q", "deepsource.com", cfg.Host)
	}
}

func TestLoginPATWithHostname(t *testing.T) {
	cfgMgr := testutil.CreateExpiredTestConfigManager(t, "", "deepsource.com", "")

	deps := &cmddeps.Deps{
		ConfigMgr: cfgMgr,
	}

	cmd := loginCmd.NewCmdLoginWithDeps(deps)
	cmd.SetArgs([]string{"--with-token", "dsp_xyz789", "--hostname", "enterprise.example.com"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	cfg, err := cfgMgr.Load()
	if err != nil {
		t.Fatalf("failed to load config: %v", err)
	}
	if cfg.Token != "dsp_xyz789" {
		t.Errorf("expected token %q, got %q", "dsp_xyz789", cfg.Token)
	}
	if cfg.Host != "enterprise.example.com" {
		t.Errorf("expected host %q, got %q", "enterprise.example.com", cfg.Host)
	}
}

func TestLoginDefaultHostname(t *testing.T) {
	cfgMgr := testutil.CreateExpiredTestConfigManager(t, "", "deepsource.com", "")

	deps := &cmddeps.Deps{
		ConfigMgr: cfgMgr,
	}

	cmd := loginCmd.NewCmdLoginWithDeps(deps)
	cmd.SetArgs([]string{"--with-token", "dsp_default"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	cfg, err := cfgMgr.Load()
	if err != nil {
		t.Fatalf("failed to load config: %v", err)
	}
	// Without --hostname, host defaults to deepsource.com
	if cfg.Host != "deepsource.com" {
		t.Errorf("expected host %q, got %q", "deepsource.com", cfg.Host)
	}
}
