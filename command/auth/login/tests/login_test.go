package tests

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"testing"

	loginCmd "github.com/deepsourcelabs/cli/command/auth/login"
	"github.com/deepsourcelabs/cli/command/cmddeps"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/internal/adapters"
	"github.com/deepsourcelabs/cli/internal/testutil"

	"github.com/deepsourcelabs/cli/buildinfo"
)

func newMockViewerClient(t *testing.T) *deepsource.Client {
	t.Helper()
	mock := graphqlclient.NewMockClient()
	mock.QueryFunc = func(_ context.Context, _ string, _ map[string]any, result any) error {
		resp := `{"viewer":{"id":"1","firstName":"Test","lastName":"User","email":"test@example.com","accounts":{"edges":[]}}}`
		return json.Unmarshal([]byte(resp), result)
	}
	return deepsource.NewWithGraphQLClient(mock)
}

func TestLoginPATFlow(t *testing.T) {
	// Empty token → IsExpired() returns false → but token=="" check skips re-auth prompt
	cfgMgr := testutil.CreateExpiredTestConfigManager(t, "", "deepsource.com", "")

	deps := &cmddeps.Deps{
		ConfigMgr: cfgMgr,
		Client:    newMockViewerClient(t),
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
	if cfg.User != "test@example.com" {
		t.Errorf("expected user %q, got %q", "test@example.com", cfg.User)
	}
}

func TestLoginPATWithHost(t *testing.T) {
	cfgMgr := testutil.CreateExpiredTestConfigManager(t, "", "deepsource.com", "")

	deps := &cmddeps.Deps{
		ConfigMgr: cfgMgr,
		Client:    newMockViewerClient(t),
	}

	cmd := loginCmd.NewCmdLoginWithDeps(deps)
	cmd.SetArgs([]string{"--with-token", "dsp_xyz789", "--host", "enterprise.example.com"})

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

func TestLoginPATWithHostnameDeprecated(t *testing.T) {
	// --hostname still works as a deprecated alias
	cfgMgr := testutil.CreateExpiredTestConfigManager(t, "", "deepsource.com", "")

	deps := &cmddeps.Deps{
		ConfigMgr: cfgMgr,
		Client:    newMockViewerClient(t),
	}

	cmd := loginCmd.NewCmdLoginWithDeps(deps)
	cmd.SetArgs([]string{"--with-token", "dsp_compat", "--hostname", "legacy.example.com"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	cfg, err := cfgMgr.Load()
	if err != nil {
		t.Fatalf("failed to load config: %v", err)
	}
	if cfg.Token != "dsp_compat" {
		t.Errorf("expected token %q, got %q", "dsp_compat", cfg.Token)
	}
	if cfg.Host != "legacy.example.com" {
		t.Errorf("expected host %q, got %q", "legacy.example.com", cfg.Host)
	}
}

func TestLoginDefaultHostname(t *testing.T) {
	cfgMgr := testutil.CreateExpiredTestConfigManager(t, "", "deepsource.com", "")

	deps := &cmddeps.Deps{
		ConfigMgr: cfgMgr,
		Client:    newMockViewerClient(t),
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
	// Without --host, host defaults to deepsource.com
	if cfg.Host != "deepsource.com" {
		t.Errorf("expected host %q, got %q", "deepsource.com", cfg.Host)
	}
}

func TestLoginConfigLoadError(t *testing.T) {
	// When LoadConfig fails, login should use NewDefault() and proceed with PAT flow
	tmpDir := t.TempDir()
	fs := adapters.NewOSFileSystem()
	cfgMgr := config.NewManager(fs, func() (string, error) {
		return tmpDir, nil
	})
	// Don't write any config — but the directory exists, so Load succeeds.
	// To simulate a real failure we need a corrupt file.
	configDir := filepath.Join(tmpDir, buildinfo.ConfigDirName)
	if err := os.MkdirAll(configDir, 0o700); err != nil {
		t.Fatalf("failed to create config dir: %v", err)
	}
	if err := os.WriteFile(filepath.Join(configDir, config.ConfigFileName), []byte("invalid[toml"), 0o644); err != nil {
		t.Fatalf("failed to write corrupt config: %v", err)
	}

	deps := &cmddeps.Deps{
		ConfigMgr: cfgMgr,
		Client:    newMockViewerClient(t),
	}

	cmd := loginCmd.NewCmdLoginWithDeps(deps)
	cmd.SetArgs([]string{"--with-token", "dsp_fallback"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("expected PAT flow to succeed despite config load error: %v", err)
	}

	// Token should have been saved
	cfg, err := cfgMgr.Load()
	if err != nil {
		t.Fatalf("failed to load config: %v", err)
	}
	if cfg.Token != "dsp_fallback" {
		t.Errorf("expected token %q, got %q", "dsp_fallback", cfg.Token)
	}
}

func TestLoginVerifyTokenBackfillsUser(t *testing.T) {
	// Valid token + empty user → verifyTokenWithServer backfills email from server
	cfgMgr := testutil.CreateTestConfigManager(t, "valid-token", "deepsource.com", "")

	deps := &cmddeps.Deps{
		ConfigMgr: cfgMgr,
		Client:    newMockViewerClient(t),
	}

	cmd := loginCmd.NewCmdLoginWithDeps(deps)
	cmd.SetArgs([]string{"--with-token", "dsp_new"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	cfg, err := cfgMgr.Load()
	if err != nil {
		t.Fatalf("failed to load config: %v", err)
	}
	// User should have been backfilled by verifyTokenWithServer
	if cfg.User != "test@example.com" {
		t.Errorf("expected user %q, got %q", "test@example.com", cfg.User)
	}
}

func TestLoginVerifyTokenServerReject(t *testing.T) {
	// Server rejects token → marks expired, PAT flow re-authenticates
	cfgMgr := testutil.CreateTestConfigManager(t, "old-token", "deepsource.com", "old@example.com")

	rejectMock := graphqlclient.NewMockClient()
	callCount := 0
	rejectMock.QueryFunc = func(_ context.Context, _ string, _ map[string]any, result any) error {
		callCount++
		if callCount == 1 {
			// First call: verifyTokenWithServer — reject the token
			return fmt.Errorf("unauthorized")
		}
		// Subsequent calls: PAT verification — succeed
		resp := `{"viewer":{"id":"1","firstName":"Test","lastName":"User","email":"new@example.com","accounts":{"edges":[]}}}`
		return json.Unmarshal([]byte(resp), result)
	}
	client := deepsource.NewWithGraphQLClient(rejectMock)

	deps := &cmddeps.Deps{
		ConfigMgr: cfgMgr,
		Client:    client,
	}

	cmd := loginCmd.NewCmdLoginWithDeps(deps)
	cmd.SetArgs([]string{"--with-token", "dsp_renewed"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	cfg, err := cfgMgr.Load()
	if err != nil {
		t.Fatalf("failed to load config: %v", err)
	}
	if cfg.Token != "dsp_renewed" {
		t.Errorf("expected renewed token %q, got %q", "dsp_renewed", cfg.Token)
	}
}

func TestLoginPATSkipTLSVerifyNotPersisted(t *testing.T) {
	cfgMgr := testutil.CreateExpiredTestConfigManager(t, "", "deepsource.com", "")

	deps := &cmddeps.Deps{
		ConfigMgr: cfgMgr,
		Client:    newMockViewerClient(t),
	}

	cmd := loginCmd.NewCmdLoginWithDeps(deps)
	cmd.SetArgs([]string{"--with-token", "dsp_noskip"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	cfg, err := cfgMgr.Load()
	if err != nil {
		t.Fatalf("failed to load config: %v", err)
	}
	if cfg.SkipTLSVerify {
		t.Error("expected SkipTLSVerify=false when flag is not set")
	}
}

func TestLoginPATSkipTLSVerifyFromConfig(t *testing.T) {
	// Write a config with SkipTLSVerify already set to true
	tmpDir := t.TempDir()
	fs := adapters.NewOSFileSystem()
	cfgMgr := config.NewManager(fs, func() (string, error) {
		return tmpDir, nil
	})

	// Use manager.Write to create valid TOML with expired token + SkipTLSVerify
	initialCfg := &config.CLIConfig{
		Host:          "enterprise.example.com",
		Token:         "",
		SkipTLSVerify: true,
	}
	if err := cfgMgr.Write(initialCfg); err != nil {
		t.Fatalf("failed to write initial config: %v", err)
	}

	deps := &cmddeps.Deps{
		ConfigMgr: cfgMgr,
		Client:    newMockViewerClient(t),
	}

	cmd := loginCmd.NewCmdLoginWithDeps(deps)
	cmd.SetArgs([]string{"--with-token", "dsp_skipyes"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	cfg, err := cfgMgr.Load()
	if err != nil {
		t.Fatalf("failed to load config: %v", err)
	}
	if !cfg.SkipTLSVerify {
		t.Error("expected SkipTLSVerify=true to be preserved from config after login")
	}
}

func TestLoginPATInvalidToken(t *testing.T) {
	cfgMgr := testutil.CreateExpiredTestConfigManager(t, "", "deepsource.com", "")

	mock := graphqlclient.NewMockClient()
	mock.QueryFunc = func(_ context.Context, _ string, _ map[string]any, _ any) error {
		return fmt.Errorf("unauthorized")
	}
	client := deepsource.NewWithGraphQLClient(mock)

	deps := &cmddeps.Deps{
		ConfigMgr: cfgMgr,
		Client:    client,
	}

	cmd := loginCmd.NewCmdLoginWithDeps(deps)
	cmd.SetArgs([]string{"--with-token", "bad_token"})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error for invalid token, got nil")
	}
}
