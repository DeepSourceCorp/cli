package tests

import (
	"bytes"
	"path/filepath"
	"runtime"
	"strings"
	"sync/atomic"
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
		"issueOccurrences(first: $limit)": goldenPath("pr_scope_response.json"),
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

// TestIssuesScopeMenuDefaultBranch verifies that when no issues are found on
// the current branch with no explicit scope flags, an interactive menu appears
// and selecting "default branch" re-queries and shows results.
func TestIssuesScopeMenuDefaultBranch(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"pullRequests(":          goldenPath("get_pr_by_branch_empty_response.json"),
		"query GetAnalysisRuns(": goldenPath("get_analysis_runs_empty_issues_response.json"),
		"checks {":               goldenPath("commit_scope_empty_response.json"),
		"issues(first: $limit)":  goldenPath("default_branch_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
		BranchNameFunc: func() (string, error) {
			return "feature/empty-branch", nil
		},
		HasUnpushedCommitsFunc:    func() bool { return false },
		HasUncommittedChangesFunc: func() bool { return false },
		IsInteractiveFunc:         func() bool { return true },
		SelectFromOptionsFunc: func(msg, help string, opts []string) (string, error) {
			return "View issues on default branch", nil
		},
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	got := buf.String()
	// Should contain the issues from the default branch re-query
	if !strings.Contains(got, "Issues") {
		t.Errorf("expected issues output after scope menu selection, got: %q", got)
	}
}

// TestIssuesScopeMenuExit verifies that picking "Exit" from the scope menu
// cleanly returns without re-querying.
func TestIssuesScopeMenuExit(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"pullRequests(":          goldenPath("get_pr_by_branch_empty_response.json"),
		"query GetAnalysisRuns(": goldenPath("get_analysis_runs_empty_issues_response.json"),
		"checks {":               goldenPath("commit_scope_empty_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
		BranchNameFunc: func() (string, error) {
			return "feature/empty-branch", nil
		},
		HasUnpushedCommitsFunc:    func() bool { return false },
		HasUncommittedChangesFunc: func() bool { return false },
		IsInteractiveFunc:         func() bool { return true },
		SelectFromOptionsFunc: func(msg, help string, opts []string) (string, error) {
			return "Exit", nil
		},
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	got := buf.String()
	if !strings.Contains(got, "No issues found") {
		t.Errorf("expected 'No issues found' message, got: %q", got)
	}
	// Should NOT contain a second query result
	if strings.Contains(got, "── Issues") {
		t.Errorf("should not show issues after Exit selection, got: %q", got)
	}
}

// TestIssuesScopeMenuNotShownWithExplicitFlag verifies that no interactive menu
// is shown when an explicit scope flag like --default-branch is provided.
func TestIssuesScopeMenuNotShownWithExplicitFlag(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"issues(first: $limit)": goldenPath("empty_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	menuShown := false
	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
		IsInteractiveFunc: func() bool { return true },
		SelectFromOptionsFunc: func(msg, help string, opts []string) (string, error) {
			menuShown = true
			return "Exit", nil
		},
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--default-branch"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if menuShown {
		t.Error("scope menu should not be shown when --default-branch flag is provided")
	}
}

// TestIssuesScopeMenuNotShownForJSON verifies that no interactive menu is shown
// when output format is JSON.
func TestIssuesScopeMenuNotShownForJSON(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"issues(first: $limit)": goldenPath("empty_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	menuShown := false
	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
		IsInteractiveFunc: func() bool { return true },
		SelectFromOptionsFunc: func(msg, help string, opts []string) (string, error) {
			menuShown = true
			return "Exit", nil
		},
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo", "--default-branch", "--output", "json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if menuShown {
		t.Error("scope menu should not be shown for JSON output")
	}
}

// TestIssuesSafetyNetPRPathInProgress verifies that when a branch has a PR
// and the latest run is PENDING, the safety net in outputHuman catches it
// (non-interactive path) and prints "No completed analysis runs found"
// instead of showing the scope menu.
func TestIssuesSafetyNetPRPathInProgress(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"pullRequests(":                   goldenPath("get_pr_by_branch_found_response.json"),
		"query GetAnalysisRuns(":          goldenPath("get_analysis_runs_pending_response.json"),
		"issueOccurrences(first: $limit)": goldenPath("pr_scope_empty_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	var scopeMenuCalls int32
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
		// Non-interactive: isInteractive returns false by default in tests.
		SelectFromOptionsFunc: func(msg, help string, opts []string) (string, error) {
			atomic.AddInt32(&scopeMenuCalls, 1)
			return "Exit", nil
		},
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	got := buf.String()
	if !strings.Contains(got, "No completed analysis runs found") {
		t.Errorf("expected 'No completed analysis runs found' message, got: %q", got)
	}
	if atomic.LoadInt32(&scopeMenuCalls) > 0 {
		t.Error("scope menu should not be shown when safety net handles in-progress run")
	}
}

// TestIssuesSafetyNetPRPathInteractive verifies the interactive safety net:
// when the latest run is PENDING and the user chooses to show last completed
// results, the scope menu is skipped.
func TestIssuesSafetyNetPRPathInteractive(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"pullRequests(":                   goldenPath("get_pr_by_branch_found_response.json"),
		"query GetAnalysisRuns(":          goldenPath("get_analysis_runs_pending_response.json"),
		"issueOccurrences(first: $limit)": goldenPath("pr_scope_empty_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	scopeMenuShown := false
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
		IsInteractiveFunc:         func() bool { return true },
		SelectFromOptionsFunc: func(msg, help string, opts []string) (string, error) {
			if strings.Contains(msg, "different scope") {
				scopeMenuShown = true
				return "Exit", nil
			}
			// Safety-net prompt
			return "Show results from the last completed analysis", nil
		},
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	got := buf.String()
	if !strings.Contains(got, "Analysis is still running") {
		t.Errorf("expected 'Analysis is still running' prompt, got: %q", got)
	}
	if !strings.Contains(got, "No completed analysis runs found") {
		t.Errorf("expected 'No completed analysis runs found' message, got: %q", got)
	}
	if scopeMenuShown {
		t.Error("scope menu should not be shown when safety net handles in-progress run")
	}
}

// TestIssuesSafetyNetNotTriggeredWhenCompleted verifies that when the latest
// run is SUCCESS (not in-progress), the safety net returns false and the scope
// menu is shown as usual.
func TestIssuesSafetyNetNotTriggeredWhenCompleted(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "test@example.com")
	mock := testutil.MockQueryFunc(t, map[string]string{
		"pullRequests(":          goldenPath("get_pr_by_branch_empty_response.json"),
		"query GetAnalysisRuns(": goldenPath("get_analysis_runs_empty_issues_response.json"),
		"checks {":               goldenPath("commit_scope_empty_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	scopeMenuShown := false
	var buf bytes.Buffer
	deps := &cmddeps.Deps{
		Client:    client,
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
		BranchNameFunc: func() (string, error) {
			return "feature/empty-branch", nil
		},
		HasUnpushedCommitsFunc:    func() bool { return false },
		HasUncommittedChangesFunc: func() bool { return false },
		IsInteractiveFunc:         func() bool { return true },
		SelectFromOptionsFunc: func(msg, help string, opts []string) (string, error) {
			if strings.Contains(msg, "different scope") {
				scopeMenuShown = true
			}
			return "Exit", nil
		},
	}

	cmd := issuesCmd.NewCmdIssuesWithDeps(deps)
	cmd.SetArgs([]string{"--repo", "gh/testowner/testrepo"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !scopeMenuShown {
		t.Error("scope menu should be shown when run is completed (safety net should not trigger)")
	}

	got := buf.String()
	if !strings.Contains(got, "No issues found") {
		t.Errorf("expected 'No issues found' message, got: %q", got)
	}
}

