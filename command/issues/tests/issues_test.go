package tests

import (
	"bytes"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"

	"github.com/deepsourcelabs/cli/command/cmddeps"
	issuesCmd "github.com/deepsourcelabs/cli/command/issues"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/internal/testutil"
)

func goldenPath(name string) string {
	_, callerFile, _, _ := runtime.Caller(0)
	return filepath.Join(filepath.Dir(callerFile), "golden_files", name)
}

func TestIssuesAutoDetectBranch(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"analysisRuns(first:": goldenPath("analysis_runs_response.json"),
		"checks {":           goldenPath("commit_scope_response.json"),
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

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := string(testutil.LoadGoldenFile(t, goldenPath("commit_scope_output.json")))
	got := buf.String()

	if strings.TrimSpace(got) != strings.TrimSpace(expected) {
		t.Errorf("output mismatch.\nExpected:\n%s\nGot:\n%s", expected, got)
	}
}

func TestIssuesNoRunsForBranch(t *testing.T) {
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

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--output", "json"})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error for branch with no runs, got nil")
	}
	if !strings.Contains(err.Error(), "no analysis runs found") {
		t.Errorf("expected error about no analysis runs, got: %s", err.Error())
	}
}

func TestIssuesDefaultBranchFlag(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"issues(first: $limit)": goldenPath("default_branch_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--default-branch", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := string(testutil.LoadGoldenFile(t, goldenPath("default_branch_output.json")))
	got := buf.String()

	if strings.TrimSpace(got) != strings.TrimSpace(expected) {
		t.Errorf("output mismatch.\nExpected:\n%s\nGot:\n%s", expected, got)
	}
}

func TestIssuesCommitScope(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"checks {": goldenPath("commit_scope_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--commit", "abc123f", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := string(testutil.LoadGoldenFile(t, goldenPath("commit_scope_output.json")))
	got := buf.String()

	if strings.TrimSpace(got) != strings.TrimSpace(expected) {
		t.Errorf("output mismatch.\nExpected:\n%s\nGot:\n%s", expected, got)
	}
}

func TestIssuesPRScope(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"issueOccurrences(first: $limit)": goldenPath("pr_scope_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--pr", "42", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := string(testutil.LoadGoldenFile(t, goldenPath("pr_scope_output.json")))
	got := buf.String()

	if strings.TrimSpace(got) != strings.TrimSpace(expected) {
		t.Errorf("output mismatch.\nExpected:\n%s\nGot:\n%s", expected, got)
	}
}

func TestIssuesFilterBySeverity(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"issues(first: $limit)": goldenPath("filtered_severity_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--default-branch", "--severity", "critical", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := string(testutil.LoadGoldenFile(t, goldenPath("filtered_severity_output.json")))
	got := buf.String()

	if strings.TrimSpace(got) != strings.TrimSpace(expected) {
		t.Errorf("output mismatch.\nExpected:\n%s\nGot:\n%s", expected, got)
	}
}

func TestIssuesMutualExclusivity(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")

	deps := &cmddeps.Deps{
		ConfigMgr: cfgMgr,
	}

	// --commit and --pr are mutually exclusive
	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--commit", "abc123", "--pr", "42"})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error for mutually exclusive flags, got nil")
	}

	errMsg := err.Error()
	if !strings.Contains(errMsg, "commit") || !strings.Contains(errMsg, "pr") {
		t.Errorf("expected error mentioning 'commit' and 'pr', got: %s", errMsg)
	}

	// --commit and --default-branch are mutually exclusive
	cmd = issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--commit", "abc123", "--default-branch"})

	err = cmd.Execute()
	if err == nil {
		t.Fatal("expected error for mutually exclusive flags --commit and --default-branch, got nil")
	}

	errMsg = err.Error()
	if !strings.Contains(errMsg, "commit") || !strings.Contains(errMsg, "default-branch") {
		t.Errorf("expected error mentioning 'commit' and 'default-branch', got: %s", errMsg)
	}
}

func TestIssuesFilterByCategory(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"issues(first: $limit)": goldenPath("default_branch_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--default-branch", "--category", "security", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := string(testutil.LoadGoldenFile(t, goldenPath("filtered_category_output.json")))
	got := buf.String()

	if strings.TrimSpace(got) != strings.TrimSpace(expected) {
		t.Errorf("output mismatch.\nExpected:\n%s\nGot:\n%s", expected, got)
	}
}

func TestIssuesFilterByAnalyzer(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"issues(first: $limit)": goldenPath("default_branch_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	// All issues in default_branch_response.json are analyzer "go", so filtering by "python" yields 0
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--default-branch", "--analyzer", "python", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	got := strings.TrimSpace(buf.String())
	if got != "[]" {
		t.Errorf("expected empty array '[]', got: %s", got)
	}
}

func TestIssuesFilterByCode(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"issues(first: $limit)": goldenPath("default_branch_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--default-branch", "--code", "GO-S1001", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := string(testutil.LoadGoldenFile(t, goldenPath("filtered_code_output.json")))
	got := buf.String()

	if strings.TrimSpace(got) != strings.TrimSpace(expected) {
		t.Errorf("output mismatch.\nExpected:\n%s\nGot:\n%s", expected, got)
	}
}

func TestIssuesFilterByPath(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"issues(first: $limit)": goldenPath("default_branch_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--default-branch", "--path", "internal/", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := string(testutil.LoadGoldenFile(t, goldenPath("filtered_path_output.json")))
	got := buf.String()

	if strings.TrimSpace(got) != strings.TrimSpace(expected) {
		t.Errorf("output mismatch.\nExpected:\n%s\nGot:\n%s", expected, got)
	}
}

func TestIssuesFilterBySource(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"checks {": goldenPath("commit_scope_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--commit", "abc123f", "--source", "ai", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := string(testutil.LoadGoldenFile(t, goldenPath("filtered_source_output.json")))
	got := buf.String()

	if strings.TrimSpace(got) != strings.TrimSpace(expected) {
		t.Errorf("output mismatch.\nExpected:\n%s\nGot:\n%s", expected, got)
	}
}

func TestIssuesMultipleFilters(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"issues(first: $limit)": goldenPath("default_branch_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--default-branch", "--severity", "critical", "--category", "security", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := string(testutil.LoadGoldenFile(t, goldenPath("filtered_combined_output.json")))
	got := buf.String()

	if strings.TrimSpace(got) != strings.TrimSpace(expected) {
		t.Errorf("output mismatch.\nExpected:\n%s\nGot:\n%s", expected, got)
	}
}

func TestIssuesYAMLOutput(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"issues(first: $limit)": goldenPath("default_branch_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--default-branch", "--output", "yaml"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := string(testutil.LoadGoldenFile(t, goldenPath("default_branch_output.yaml")))
	got := buf.String()

	if strings.TrimSpace(got) != strings.TrimSpace(expected) {
		t.Errorf("output mismatch.\nExpected:\n%s\nGot:\n%s", expected, got)
	}
}

func TestIssuesOutputFile(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"issues(first: $limit)": goldenPath("default_branch_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
	}

	tmpFile := filepath.Join(t.TempDir(), "issues_output.json")

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--default-branch", "--output", "json", "--output-file", tmpFile})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// stdout should NOT contain the JSON (it goes to the file)
	if strings.Contains(buf.String(), "GO-R1005") {
		t.Error("expected JSON output to go to file, not stdout")
	}

	// Verify file content
	fileContent, err := os.ReadFile(tmpFile)
	if err != nil {
		t.Fatalf("failed to read output file: %v", err)
	}

	expected := string(testutil.LoadGoldenFile(t, goldenPath("default_branch_output.json")))
	if strings.TrimSpace(string(fileContent)) != strings.TrimSpace(expected) {
		t.Errorf("file output mismatch.\nExpected:\n%s\nGot:\n%s", expected, string(fileContent))
	}
}

func TestIssuesEmptyResults(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"issues(first: $limit)": goldenPath("empty_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--default-branch", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	got := strings.TrimSpace(buf.String())
	if got != "[]" {
		t.Errorf("expected empty array '[]', got: %s", got)
	}
}
