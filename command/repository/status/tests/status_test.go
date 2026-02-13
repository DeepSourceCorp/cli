package tests

import (
	"bytes"
	"path/filepath"
	"runtime"
	"strings"
	"testing"

	"github.com/deepsourcelabs/cli/command/cmddeps"
	statusCmd "github.com/deepsourcelabs/cli/command/repository/status"
	"github.com/deepsourcelabs/cli/deepsource"
	reposvc "github.com/deepsourcelabs/cli/internal/services/repo"
	"github.com/deepsourcelabs/cli/internal/testutil"
)

func goldenPath(name string) string {
	_, callerFile, _, _ := runtime.Caller(0)
	return filepath.Join(filepath.Dir(callerFile), "golden_files", name)
}

func TestRepoStatusActivated(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"isActivated": goldenPath("activated_response.json"),
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

	cmd := statusCmd.NewCmdRepoStatusWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := string(testutil.LoadGoldenFile(t, goldenPath("activated_output.json")))
	got := buf.String()

	if strings.TrimSpace(got) != strings.TrimSpace(expected) {
		t.Errorf("output mismatch.\nExpected:\n%s\nGot:\n%s", expected, got)
	}
}

func TestRepoStatusNotActivated(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"isActivated": goldenPath("not_activated_response.json"),
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

	cmd := statusCmd.NewCmdRepoStatusWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := string(testutil.LoadGoldenFile(t, goldenPath("not_activated_output.json")))
	got := buf.String()

	if strings.TrimSpace(got) != strings.TrimSpace(expected) {
		t.Errorf("output mismatch.\nExpected:\n%s\nGot:\n%s", expected, got)
	}
}
