package tests

import (
	"bytes"
	"context"
	"encoding/json"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"

	"github.com/deepsourcelabs/cli/command/cmddeps"
	issuesCmd "github.com/deepsourcelabs/cli/command/issues"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/internal/testutil"
)

func goldenPath(name string) string {
	_, callerFile, _, _ := runtime.Caller(0)
	return filepath.Join(filepath.Dir(callerFile), "golden_files", name)
}

func TestIssuesAutoDetectBranch(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"pullRequests(":         goldenPath("get_pr_by_branch_empty_response.json"),
		"query GetAnalysisRuns(": goldenPath("get_analysis_runs_response.json"),
		"checks {":              goldenPath("commit_scope_response.json"),
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
		HasUnpushedCommitsFunc:    func() bool { return false },
		HasUncommittedChangesFunc: func() bool { return false },
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

func TestIssuesAutoDetectPR(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"pullRequests(":                   goldenPath("get_pr_by_branch_found_response.json"),
		"query GetAnalysisRuns(":          goldenPath("get_analysis_runs_response.json"),
		"issueOccurrences(first:": goldenPath("pr_scope_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
		BranchNameFunc: func() (string, error) {
			return "feature/new-auth", nil
		},
		HasUnpushedCommitsFunc:    func() bool { return false },
		HasUncommittedChangesFunc: func() bool { return false },
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := string(testutil.LoadGoldenFile(t, goldenPath("pr_scope_output.json")))
	got := buf.String()

	if strings.TrimSpace(got) != strings.TrimSpace(expected) {
		t.Errorf("output mismatch.\nExpected:\n%s\nGot:\n%s", expected, got)
	}
}

func TestIssuesNoRunsForBranch(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"pullRequests(":         goldenPath("get_pr_by_branch_empty_response.json"),
		"query GetAnalysisRuns(": goldenPath("get_analysis_runs_empty_response.json"),
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
		"issues(first:": goldenPath("default_branch_response.json"),
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
		"issueOccurrences(first:": goldenPath("pr_scope_response.json"),
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
		"issues(first:": goldenPath("filtered_severity_response.json"),
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
		"issues(first:": goldenPath("default_branch_response.json"),
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
		"issues(first:": goldenPath("default_branch_response.json"),
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

func TestIssuesFilterByPath(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"issues(first:": goldenPath("default_branch_response.json"),
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
		"issues(first:": goldenPath("default_branch_response.json"),
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

func TestIssuesRunInProgress(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"pullRequests(":         goldenPath("get_pr_by_branch_empty_response.json"),
		"query GetAnalysisRuns(": goldenPath("get_analysis_runs_pending_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
		BranchNameFunc: func() (string, error) {
			return "feature/new-auth", nil
		},
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("expected nil error for in-progress run, got: %v", err)
	}
	got := buf.String()
	// In non-TTY (test runner), in-progress auto-falls back to last completed run.
	// Since the mock only has a PENDING run, no completed run is found.
	if !strings.Contains(got, "No completed analysis runs found") {
		t.Errorf("expected fallback 'no completed runs' message, got: %q", got)
	}
}

func TestIssuesRunTimeout(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"pullRequests(":         goldenPath("get_pr_by_branch_empty_response.json"),
		"query GetAnalysisRuns(": goldenPath("get_analysis_runs_timeout_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
		BranchNameFunc: func() (string, error) {
			return "feature/new-auth", nil
		},
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("expected nil error for timed-out run, got: %v", err)
	}
	got := buf.String()
	if !strings.Contains(got, "Warning:") || !strings.Contains(got, "Analysis timed out for branch") {
		t.Errorf("expected timeout warning message, got: %q", got)
	}
}

func TestIssuesLimitFlag(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"issues(first:": goldenPath("default_branch_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--default-branch", "--limit", "5", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error with --limit flag: %v", err)
	}
	if strings.TrimSpace(buf.String()) == "" {
		t.Error("expected non-empty JSON output")
	}
}

func TestIssuesEmptyResults(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"issues(first:": goldenPath("empty_response.json"),
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

func TestIssuesUnpushedCommitsWarning(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"pullRequests(":         goldenPath("get_pr_by_branch_empty_response.json"),
		"query GetAnalysisRuns(": goldenPath("get_analysis_runs_response.json"),
		"checks {":              goldenPath("commit_scope_response.json"),
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
		HasUnpushedCommitsFunc:    func() bool { return true },
		HasUncommittedChangesFunc: func() bool { return false },
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	got := buf.String()
	if !strings.Contains(got, "unpushed commits") {
		t.Errorf("expected unpushed commits warning, got: %q", got)
	}
	if strings.Contains(got, "uncommitted changes") {
		t.Errorf("should not mention uncommitted changes when only unpushed, got: %q", got)
	}
}

func TestIssuesUncommittedChangesWarning(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"pullRequests(":         goldenPath("get_pr_by_branch_empty_response.json"),
		"query GetAnalysisRuns(": goldenPath("get_analysis_runs_response.json"),
		"checks {":              goldenPath("commit_scope_response.json"),
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
		HasUnpushedCommitsFunc:    func() bool { return false },
		HasUncommittedChangesFunc: func() bool { return true },
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	got := buf.String()
	if !strings.Contains(got, "uncommitted changes") {
		t.Errorf("expected uncommitted changes warning, got: %q", got)
	}
	if strings.Contains(got, "unpushed commits") {
		t.Errorf("should not mention unpushed commits when only uncommitted, got: %q", got)
	}
}

func TestIssuesBothUnpushedAndUncommitted(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"pullRequests(":         goldenPath("get_pr_by_branch_empty_response.json"),
		"query GetAnalysisRuns(": goldenPath("get_analysis_runs_response.json"),
		"checks {":              goldenPath("commit_scope_response.json"),
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
		HasUnpushedCommitsFunc:    func() bool { return true },
		HasUncommittedChangesFunc: func() bool { return true },
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	got := buf.String()
	if !strings.Contains(got, "unpushed commits") {
		t.Errorf("expected 'unpushed commits' in warning, got: %q", got)
	}
	if !strings.Contains(got, "uncommitted changes") {
		t.Errorf("expected 'uncommitted changes' in warning, got: %q", got)
	}
}

func TestIssuesNoUnpushedWarningWithCommitFlag(t *testing.T) {
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
		HasUnpushedCommitsFunc:    func() bool { return true },
		HasUncommittedChangesFunc: func() bool { return true },
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--commit", "abc123f", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	got := buf.String()
	if strings.Contains(got, "unpushed commits") {
		t.Errorf("should not show unpushed warning with --commit flag, got: %q", got)
	}
	if strings.Contains(got, "uncommitted changes") {
		t.Errorf("should not show uncommitted warning with --commit flag, got: %q", got)
	}
}

// TestIssuesCategoryHyphenWithCommit verifies that hyphenated category values
// like "bug-risk" and "anti-pattern" are normalised to the GraphQL enum form
// (BUG_RISK, ANTI_PATTERN) when sent as server-side filters with --commit.
func TestIssuesCategoryHyphenWithCommit(t *testing.T) {
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
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--commit", "abc123f", "--category", "bug-risk", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := string(testutil.LoadGoldenFile(t, goldenPath("filtered_category_commit_output.json")))
	got := buf.String()

	if strings.TrimSpace(got) != strings.TrimSpace(expected) {
		t.Errorf("output mismatch.\nExpected:\n%s\nGot:\n%s", expected, got)
	}
}

func TestIssuesPagination(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")

	page1Data, err := os.ReadFile(goldenPath("pagination_page1_response.json"))
	if err != nil {
		t.Fatalf("failed to read page1 golden file: %v", err)
	}
	page2Data, err := os.ReadFile(goldenPath("pagination_page2_response.json"))
	if err != nil {
		t.Fatalf("failed to read page2 golden file: %v", err)
	}

	mock := graphqlclient.NewMockClient()
	callCount := 0
	mock.QueryFunc = func(_ context.Context, query string, vars map[string]any, result any) error {
		if !strings.Contains(query, "issues(first:") {
			t.Fatalf("unexpected query: %s", query)
		}
		callCount++
		if _, hasAfter := vars["after"]; hasAfter {
			return json.Unmarshal(page2Data, result)
		}
		return json.Unmarshal(page1Data, result)
	}
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

	if callCount != 2 {
		t.Errorf("expected 2 API calls for pagination, got %d", callCount)
	}

	// Parse output JSON to verify both pages were collected
	var issues []map[string]any
	if err := json.Unmarshal([]byte(strings.TrimSpace(buf.String())), &issues); err != nil {
		t.Fatalf("failed to parse JSON output: %v", err)
	}
	if len(issues) != 2 {
		t.Errorf("expected 2 issues from 2 pages, got %d", len(issues))
	}
	if issues[0]["issue_code"] != "GO-W1007" {
		t.Errorf("expected first issue GO-W1007, got %v", issues[0]["issue_code"])
	}
	if issues[1]["issue_code"] != "GO-S1010" {
		t.Errorf("expected second issue GO-S1010, got %v", issues[1]["issue_code"])
	}
}

func TestIssuesPaginationHardCap(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")

	// Build a single-issue page that always claims hasNextPage: true.
	// Without the hard cap, this would loop forever.
	pageJSON := []byte(`{
  "repository": {
    "issues": {
      "edges": [{
        "node": {
          "occurrences": {
            "edges": [{
              "node": {
                "path": "cmd/deepsource/main.go",
                "beginLine": 1,
                "endLine": 1,
                "issue": {
                  "title": "Test issue",
                  "shortcode": "GO-W1007",
                  "shortDescription": "desc",
                  "category": "BUG_RISK",
                  "severity": "MAJOR",
                  "isRecommended": false,
                  "analyzer": {"name": "Go", "shortcode": "go"}
                }
              }
            }]
          }
        }
      }],
      "pageInfo": {"hasNextPage": true, "endCursor": "cursor-next"}
    }
  }
}`)

	mock := graphqlclient.NewMockClient()
	callCount := 0
	mock.QueryFunc = func(_ context.Context, query string, _ map[string]any, result any) error {
		callCount++
		return json.Unmarshal(pageJSON, result)
	}
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

	var issues []map[string]any
	if err := json.Unmarshal([]byte(strings.TrimSpace(buf.String())), &issues); err != nil {
		t.Fatalf("failed to parse JSON output: %v", err)
	}

	// The hard cap is 1000. Each page returns 1 issue, so we expect exactly 1000 issues
	// and 1000 API calls (not infinite).
	if len(issues) != 1000 {
		t.Errorf("expected 1000 issues (hard cap), got %d", len(issues))
	}
	if callCount != 1000 {
		t.Errorf("expected 1000 API calls, got %d", callCount)
	}
}

func TestIssuesPaginationHardCapWarning(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")

	// Same infinite-page mock as TestIssuesPaginationHardCap.
	pageJSON := []byte(`{
  "repository": {
    "issues": {
      "edges": [{
        "node": {
          "occurrences": {
            "edges": [{
              "node": {
                "path": "cmd/deepsource/main.go",
                "beginLine": 1,
                "endLine": 1,
                "issue": {
                  "title": "Test issue",
                  "shortcode": "GO-W1007",
                  "shortDescription": "desc",
                  "category": "BUG_RISK",
                  "severity": "MAJOR",
                  "isRecommended": false,
                  "analyzer": {"name": "Go", "shortcode": "go"}
                }
              }
            }]
          }
        }
      }],
      "pageInfo": {"hasNextPage": true, "endCursor": "cursor-next"}
    }
  }
}`)

	mock := graphqlclient.NewMockClient()
	mock.QueryFunc = func(_ context.Context, query string, vars map[string]any, result any) error {
		return json.Unmarshal(pageJSON, result)
	}
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	// Pretty output (no --output json) to exercise renderHumanIssues.
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--default-branch"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	output := buf.String()
	if !strings.Contains(output, "Results capped at 1000") {
		t.Errorf("expected truncation warning in pretty output, got:\n%s", output[max(0, len(output)-300):])
	}
}

func TestIssuesLimitCapAfterPagination(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")

	page1Data, err := os.ReadFile(goldenPath("pagination_page1_response.json"))
	if err != nil {
		t.Fatalf("failed to read page1 golden file: %v", err)
	}
	page2Data, err := os.ReadFile(goldenPath("pagination_page2_response.json"))
	if err != nil {
		t.Fatalf("failed to read page2 golden file: %v", err)
	}

	mock := graphqlclient.NewMockClient()
	mock.QueryFunc = func(_ context.Context, query string, vars map[string]any, result any) error {
		if _, hasAfter := vars["after"]; hasAfter {
			return json.Unmarshal(page2Data, result)
		}
		return json.Unmarshal(page1Data, result)
	}
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--default-branch", "--limit", "1", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	var issues []map[string]any
	if err := json.Unmarshal([]byte(strings.TrimSpace(buf.String())), &issues); err != nil {
		t.Fatalf("failed to parse JSON output: %v", err)
	}
	if len(issues) != 1 {
		t.Errorf("expected 1 issue after --limit 1 cap, got %d", len(issues))
	}
}


