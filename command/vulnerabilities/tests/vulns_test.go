package tests

import (
	"bytes"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"

	"github.com/deepsourcelabs/cli/command/cmddeps"
	vulnsCmd "github.com/deepsourcelabs/cli/command/vulnerabilities"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/internal/testutil"
)

func goldenPath(name string) string {
	_, callerFile, _, _ := runtime.Caller(0)
	return filepath.Join(filepath.Dir(callerFile), "golden_files", name)
}

func TestVulnsDefaultBranchFlag(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"dependencyVulnerabilityOccurrences(first: $limit)": goldenPath("repo_vulns_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
	}

	cmd := vulnsCmd.NewCmdVulnerabilitiesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--default-branch", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := string(testutil.LoadGoldenFile(t, goldenPath("repo_vulns_output.json")))
	got := buf.String()

	if strings.TrimSpace(got) != strings.TrimSpace(expected) {
		t.Errorf("output mismatch.\nExpected:\n%s\nGot:\n%s", expected, got)
	}
}

func TestVulnsAutoDetectBranch(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"analysisRuns(first:": goldenPath("analysis_runs_response.json"),
		"scaChecks {":         goldenPath("run_vulns_response.json"),
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

	cmd := vulnsCmd.NewCmdVulnerabilitiesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := string(testutil.LoadGoldenFile(t, goldenPath("run_vulns_output.json")))
	got := buf.String()

	if strings.TrimSpace(got) != strings.TrimSpace(expected) {
		t.Errorf("output mismatch.\nExpected:\n%s\nGot:\n%s", expected, got)
	}
}

func TestVulnsNoRunsForBranch(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"analysisRuns(first:": goldenPath("analysis_runs_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
		BranchNameFunc: func() (string, error) {
			return "feature-no-runs", nil
		},
	}

	cmd := vulnsCmd.NewCmdVulnerabilitiesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--output", "json"})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error for branch with no runs, got nil")
	}
	if !strings.Contains(err.Error(), "no analysis runs found") {
		t.Errorf("expected error about no analysis runs, got: %s", err.Error())
	}
}

func TestVulnsCommitScope(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"scaChecks {": goldenPath("run_vulns_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
	}

	cmd := vulnsCmd.NewCmdVulnerabilitiesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--commit", "abc123f", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := string(testutil.LoadGoldenFile(t, goldenPath("run_vulns_output.json")))
	got := buf.String()

	if strings.TrimSpace(got) != strings.TrimSpace(expected) {
		t.Errorf("output mismatch.\nExpected:\n%s\nGot:\n%s", expected, got)
	}
}

func TestVulnsPRScope(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"vulnerabilityOccurrences(first: $limit)": goldenPath("pr_vulns_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
	}

	cmd := vulnsCmd.NewCmdVulnerabilitiesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--pr", "42", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := string(testutil.LoadGoldenFile(t, goldenPath("pr_vulns_output.json")))
	got := buf.String()

	if strings.TrimSpace(got) != strings.TrimSpace(expected) {
		t.Errorf("output mismatch.\nExpected:\n%s\nGot:\n%s", expected, got)
	}
}

func TestVulnsFilterBySeverity(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"dependencyVulnerabilityOccurrences(first: $limit)": goldenPath("severity_filter_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
	}

	cmd := vulnsCmd.NewCmdVulnerabilitiesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--default-branch", "--severity", "critical,high", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := string(testutil.LoadGoldenFile(t, goldenPath("severity_filter_output.json")))
	got := buf.String()

	if strings.TrimSpace(got) != strings.TrimSpace(expected) {
		t.Errorf("output mismatch.\nExpected:\n%s\nGot:\n%s", expected, got)
	}
}

func TestVulnsMutualExclusivity(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")

	deps := &cmddeps.Deps{
		ConfigMgr: cfgMgr,
	}

	// --commit and --pr
	cmd := vulnsCmd.NewCmdVulnerabilitiesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--commit", "abc123", "--pr", "42"})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error for mutually exclusive flags, got nil")
	}

	errMsg := err.Error()
	if !strings.Contains(errMsg, "commit") || !strings.Contains(errMsg, "pr") {
		t.Errorf("expected error mentioning 'commit' and 'pr', got: %s", errMsg)
	}

	// --commit and --default-branch
	cmd2 := vulnsCmd.NewCmdVulnerabilitiesWithDeps(deps)
	cmd2.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--commit", "abc123", "--default-branch"})

	err2 := cmd2.Execute()
	if err2 == nil {
		t.Fatal("expected error for mutually exclusive flags --commit and --default-branch, got nil")
	}

	errMsg2 := err2.Error()
	if !strings.Contains(errMsg2, "commit") || !strings.Contains(errMsg2, "default-branch") {
		t.Errorf("expected error mentioning 'commit' and 'default-branch', got: %s", errMsg2)
	}
}

func TestVulnsYAMLOutput(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"dependencyVulnerabilityOccurrences(first: $limit)": goldenPath("repo_vulns_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
	}

	cmd := vulnsCmd.NewCmdVulnerabilitiesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--default-branch", "--output", "yaml"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := string(testutil.LoadGoldenFile(t, goldenPath("repo_vulns_output.yaml")))
	got := buf.String()

	if strings.TrimSpace(got) != strings.TrimSpace(expected) {
		t.Errorf("output mismatch.\nExpected:\n%s\nGot:\n%s", expected, got)
	}
}

func TestVulnsOutputFile(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"dependencyVulnerabilityOccurrences(first: $limit)": goldenPath("repo_vulns_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
	}

	tmpFile := filepath.Join(t.TempDir(), "vulns_output.json")

	cmd := vulnsCmd.NewCmdVulnerabilitiesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--default-branch", "--output", "json", "--output-file", tmpFile})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// stdout should NOT contain the JSON
	if strings.Contains(buf.String(), "CVE-2024-1234") {
		t.Error("expected JSON output to go to file, not stdout")
	}

	// Verify file content
	fileContent, err := os.ReadFile(tmpFile)
	if err != nil {
		t.Fatalf("failed to read output file: %v", err)
	}

	expected := string(testutil.LoadGoldenFile(t, goldenPath("repo_vulns_output.json")))
	if strings.TrimSpace(string(fileContent)) != strings.TrimSpace(expected) {
		t.Errorf("file output mismatch.\nExpected:\n%s\nGot:\n%s", expected, string(fileContent))
	}
}

func TestVulnsEmptyResults(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"dependencyVulnerabilityOccurrences(first: $limit)": goldenPath("empty_vulns_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
	}

	cmd := vulnsCmd.NewCmdVulnerabilitiesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--default-branch", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	got := strings.TrimSpace(buf.String())
	if got != "[]" {
		t.Errorf("expected empty array '[]', got: %s", got)
	}
}
