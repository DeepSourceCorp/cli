package tests

import (
	"bytes"
	"path/filepath"
	"runtime"
	"strings"
	"testing"

	"github.com/deepsourcelabs/cli/command/cmddeps"
	reportcardCmd "github.com/deepsourcelabs/cli/command/reportcard"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/internal/testutil"
)

func goldenPath(name string) string {
	_, callerFile, _, _ := runtime.Caller(0)
	return filepath.Join(filepath.Dir(callerFile), "golden_files", name)
}

func TestReportCardCommitScope(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"GetAnalysisRuns": goldenPath("report_card_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
	}

	cmd := reportcardCmd.NewCmdReportCardWithDeps(deps)
	cmd.SetArgs([]string{
		"--repo", "gh/testowner/testrepo",
		"--commit", "abc123f0000000000000000000000000deadbeef",
		"--output", "json",
	})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := string(testutil.LoadGoldenFile(t, goldenPath("report_card_output.json")))
	got := buf.String()

	if strings.TrimSpace(got) != strings.TrimSpace(expected) {
		t.Errorf("output mismatch.\nExpected:\n%s\nGot:\n%s", expected, got)
	}
}

func TestReportCardAutoDetect(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	// ResolveLatestRun does GetAnalysisRuns, then resolveByCurrentBranch does another GetAnalysisRuns
	// Both match the same route since they use the same query substring
	mock := testutil.MockQueryFunc(t, map[string]string{
		"analysisRuns(first:": goldenPath("report_card_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
		BranchNameFunc: func() (string, error) {
			return "main", nil
		},
	}

	cmd := reportcardCmd.NewCmdReportCardWithDeps(deps)
	cmd.SetArgs([]string{
		"--repo", "gh/testowner/testrepo",
		"--output", "json",
	})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := string(testutil.LoadGoldenFile(t, goldenPath("report_card_output.json")))
	got := buf.String()

	if strings.TrimSpace(got) != strings.TrimSpace(expected) {
		t.Errorf("output mismatch.\nExpected:\n%s\nGot:\n%s", expected, got)
	}
}
