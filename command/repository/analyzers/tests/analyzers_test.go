package tests

import (
	"bytes"
	"path/filepath"
	"runtime"
	"strings"
	"testing"

	"github.com/deepsourcelabs/cli/command/cmddeps"
	analyzersCmd "github.com/deepsourcelabs/cli/command/repository/analyzers"
	"github.com/deepsourcelabs/cli/deepsource"
	reposvc "github.com/deepsourcelabs/cli/internal/services/repo"
	"github.com/deepsourcelabs/cli/internal/testutil"
)

func goldenPath(name string) string {
	_, callerFile, _, _ := runtime.Caller(0)
	return filepath.Join(filepath.Dir(callerFile), "golden_files", name)
}

func TestRepoAnalyzersEnabled(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"enabledAnalyzers {": goldenPath("enabled_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)
	svc := reposvc.NewTestService(cfgMgr, func(_ deepsource.ClientOpts) (reposvc.Client, error) {
		return client, nil
	})

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		ConfigMgr:   cfgMgr,
		Stdout:      &buf,
		RepoService: svc,
	}

	cmd := analyzersCmd.NewCmdAnalyzersWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := string(testutil.LoadGoldenFile(t, goldenPath("enabled_output.json")))
	got := buf.String()

	if strings.TrimSpace(got) != strings.TrimSpace(expected) {
		t.Errorf("output mismatch.\nExpected:\n%s\nGot:\n%s", expected, got)
	}
}
