package tests

import (
	"bytes"
	"path/filepath"
	"runtime"
	"strings"
	"testing"

	"github.com/deepsourcelabs/cli/command/cmddeps"
	dashboardCmd "github.com/deepsourcelabs/cli/command/repository/dashboard"
	"github.com/deepsourcelabs/cli/deepsource"
	reposvc "github.com/deepsourcelabs/cli/internal/services/repo"
	"github.com/deepsourcelabs/cli/internal/testutil"
)

func goldenPath(name string) string {
	_, callerFile, _, _ := runtime.Caller(0)
	return filepath.Join(filepath.Dir(callerFile), "golden_files", name)
}

func TestDashboardRepoFlag(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"isActivated": goldenPath("repo_status_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)
	svc := reposvc.NewTestService(cfgMgr, func(opts deepsource.ClientOpts) (reposvc.Client, error) {
		return client, nil
	})

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		ConfigMgr:   cfgMgr,
		Stdout:      &buf,
		RepoService: svc,
	}

	cmd := dashboardCmd.NewCmdDashboardWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/owner/repo"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	got := strings.TrimSpace(buf.String())
	expected := "https://deepsource.com/gh/owner/repo/"
	if got != expected {
		t.Errorf("expected URL %q, got %q", expected, got)
	}
}

func TestDashboardShortFlag(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"isActivated": goldenPath("repo_status_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)
	svc := reposvc.NewTestService(cfgMgr, func(opts deepsource.ClientOpts) (reposvc.Client, error) {
		return client, nil
	})

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		ConfigMgr:   cfgMgr,
		Stdout:      &buf,
		RepoService: svc,
	}

	cmd := dashboardCmd.NewCmdDashboardWithDeps(deps)
	cmd.SetArgs([]string{"-r", "gh/owner/repo"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	got := strings.TrimSpace(buf.String())
	expected := "https://deepsource.com/gh/owner/repo/"
	if got != expected {
		t.Errorf("expected URL %q, got %q", expected, got)
	}
}
