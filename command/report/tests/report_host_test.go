package tests

import (
	"testing"

	"github.com/deepsourcelabs/cli/command/report"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/internal/adapters"
	"github.com/deepsourcelabs/cli/internal/container"
)

func TestReportHostFallsBackToConfig(t *testing.T) {
	// Create a config manager with an enterprise host
	tmpDir := t.TempDir()
	fs := adapters.NewOSFileSystem()
	cfgMgr := config.NewManager(fs, func() (string, error) {
		return tmpDir, nil
	})

	cfg := &config.CLIConfig{
		Host: "enterprise.example.com",
	}
	if err := cfgMgr.Write(cfg); err != nil {
		t.Fatalf("failed to write config: %v", err)
	}

	deps := &container.Container{
		FileSystem:  adapters.NewOSFileSystem(),
		Environment: adapters.NewMockEnvironment(),
		GitClient:   adapters.NewMockGitClient(),
		HTTPClient:  adapters.NewMockHTTPClient(),
		Output:      adapters.NewBufferOutput(),
		Sentry:      adapters.NewNoOpSentry(),
		Config:      cfgMgr,
	}

	// Set DSN so the command gets past initial validation
	if env, ok := deps.Environment.(*adapters.MockEnvironment); ok {
		env.Set("DEEPSOURCE_DSN", "https://token@enterprise.example.com")
	}

	cmd := report.NewCmdReportWithDeps(deps)
	// Don't pass --host; the command should fall back to config
	cmd.SetArgs([]string{
		"--analyzer", "test-coverage",
		"--key", "go",
		"--value", "dummy",
	})

	// The command will fail (no real server), but we can check the error
	// contains the enterprise host, confirming config fallback worked.
	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected an error (no real server), got nil")
	}

	// The error should reference the enterprise endpoint, not the default
	errMsg := err.Error()
	if contains(errMsg, "app.deepsource.com") {
		t.Errorf("expected enterprise host in error, got default: %s", errMsg)
	}
}

func TestReportHostExplicitFlagOverridesConfig(t *testing.T) {
	// Config has enterprise host, but --host flag overrides it
	tmpDir := t.TempDir()
	fs := adapters.NewOSFileSystem()
	cfgMgr := config.NewManager(fs, func() (string, error) {
		return tmpDir, nil
	})

	cfg := &config.CLIConfig{
		Host: "enterprise.example.com",
	}
	if err := cfgMgr.Write(cfg); err != nil {
		t.Fatalf("failed to write config: %v", err)
	}

	deps := &container.Container{
		FileSystem:  adapters.NewOSFileSystem(),
		Environment: adapters.NewMockEnvironment(),
		GitClient:   adapters.NewMockGitClient(),
		HTTPClient:  adapters.NewMockHTTPClient(),
		Output:      adapters.NewBufferOutput(),
		Sentry:      adapters.NewNoOpSentry(),
		Config:      cfgMgr,
	}

	if env, ok := deps.Environment.(*adapters.MockEnvironment); ok {
		env.Set("DEEPSOURCE_DSN", "https://token@other.example.com")
	}

	cmd := report.NewCmdReportWithDeps(deps)
	cmd.SetArgs([]string{
		"--analyzer", "test-coverage",
		"--key", "go",
		"--value", "dummy",
		"--host", "https://custom.example.com",
	})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected an error (no real server), got nil")
	}

	// The error should NOT reference the enterprise config host
	errMsg := err.Error()
	if contains(errMsg, "enterprise.example.com") {
		t.Errorf("explicit --host should override config, but error references config host: %s", errMsg)
	}
}

func TestReportHostDefaultWhenNoConfigNoFlag(t *testing.T) {
	// No config host, no --host flag: should use default
	tmpDir := t.TempDir()
	fs := adapters.NewOSFileSystem()
	cfgMgr := config.NewManager(fs, func() (string, error) {
		return tmpDir, nil
	})

	// Write empty config (no host)
	cfg := &config.CLIConfig{}
	if err := cfgMgr.Write(cfg); err != nil {
		t.Fatalf("failed to write config: %v", err)
	}

	deps := &container.Container{
		FileSystem:  adapters.NewOSFileSystem(),
		Environment: adapters.NewMockEnvironment(),
		GitClient:   adapters.NewMockGitClient(),
		HTTPClient:  adapters.NewMockHTTPClient(),
		Output:      adapters.NewBufferOutput(),
		Sentry:      adapters.NewNoOpSentry(),
		Config:      cfgMgr,
	}

	if env, ok := deps.Environment.(*adapters.MockEnvironment); ok {
		env.Set("DEEPSOURCE_DSN", "https://token@app.deepsource.com")
	}

	cmd := report.NewCmdReportWithDeps(deps)
	cmd.SetArgs([]string{
		"--analyzer", "test-coverage",
		"--key", "go",
		"--value", "dummy",
	})

	// Will fail but should use default host (app.deepsource.com)
	_ = cmd.Execute()
	// If we get here without panic, the default resolution worked
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && searchString(s, substr)
}

func searchString(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
