package cmdutil

import (
	"context"
	"errors"
	"path/filepath"
	"runtime"
	"strings"
	"testing"

	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/internal/testutil"
	"github.com/deepsourcelabs/cli/internal/vcs"
)

func testdataPath(name string) string {
	_, callerFile, _, _ := runtime.Caller(0)
	return filepath.Join(filepath.Dir(callerFile), "testdata", name)
}

var testRemote = &vcs.RemoteData{
	Owner:       "testowner",
	RepoName:    "testrepo",
	VCSProvider: "GITHUB",
}

// TestIsRunInProgress checks that only PENDING and RUNNING are considered in-progress.
func TestIsRunInProgress(t *testing.T) {
	tests := []struct {
		status string
		want   bool
	}{
		{"PENDING", true},
		{"RUNNING", true},
		{"SUCCESS", false},
		{"FAILURE", false},
		{"TIMEOUT", false},
		{"", false},
	}
	for _, tt := range tests {
		if got := IsRunInProgress(tt.status); got != tt.want {
			t.Errorf("IsRunInProgress(%q) = %v, want %v", tt.status, got, tt.want)
		}
	}
}

// TestIsRunTimedOut checks that only TIMEOUT returns true.
func TestIsRunTimedOut(t *testing.T) {
	tests := []struct {
		status string
		want   bool
	}{
		{"TIMEOUT", true},
		{"PENDING", false},
		{"RUNNING", false},
		{"SUCCESS", false},
		{"FAILURE", false},
		{"", false},
	}
	for _, tt := range tests {
		if got := IsRunTimedOut(tt.status); got != tt.want {
			t.Errorf("IsRunTimedOut(%q) = %v, want %v", tt.status, got, tt.want)
		}
	}
}

// TestResolveBranchName_WithFunc verifies the injected function is used when non-nil.
func TestResolveBranchName_WithFunc(t *testing.T) {
	got, err := ResolveBranchName(func() (string, error) {
		return "main", nil
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got != "main" {
		t.Errorf("expected %q, got %q", "main", got)
	}
}

// TestResolveBranchName_FuncError verifies the error is propagated from the injected function.
func TestResolveBranchName_FuncError(t *testing.T) {
	_, err := ResolveBranchName(func() (string, error) {
		return "", errors.New("git not available")
	})
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

// TestResolveCommitOid_AlreadyFull verifies 40-char SHAs pass through unchanged.
func TestResolveCommitOid_AlreadyFull(t *testing.T) {
	full := "3f4a2b1c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a"
	got := ResolveCommitOid(full)
	if got != full {
		t.Errorf("expected %q, got %q", full, got)
	}
}

// TestResolveCommitOid_Short verifies short SHAs are returned as-is when git is unavailable.
func TestResolveCommitOid_Short(t *testing.T) {
	short := "abc123f"
	// Outside a real git repo, rev-parse fails and the original value is returned.
	got := ResolveCommitOid(short)
	if got != short {
		t.Errorf("expected original %q to be returned, got %q", short, got)
	}
}

// TestResolveLatestRun_FindsRun verifies a SUCCESS run is returned when found.
func TestResolveLatestRun_FindsRun(t *testing.T) {
	mock := testutil.MockQueryFunc(t, map[string]string{
		"query GetAnalysisRuns(": testdataPath("get_analysis_runs_success_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	const sha = "3f4a2b1c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a"

	commitOid, branchName, status, err := ResolveLatestRun(
		context.Background(),
		client,
		func() (string, error) { return "main", nil },
		testRemote,
	)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if commitOid != sha {
		t.Errorf("commitOid: expected %q, got %q", sha, commitOid)
	}
	if branchName != "main" {
		t.Errorf("branchName: expected %q, got %q", "main", branchName)
	}
	if status != "SUCCESS" {
		t.Errorf("status: expected %q, got %q", "SUCCESS", status)
	}
}

// TestResolveLatestRun_NoRuns verifies the "no analysis runs found" error path.
func TestResolveLatestRun_NoRuns(t *testing.T) {
	mock := testutil.MockQueryFunc(t, map[string]string{
		"query GetAnalysisRuns(": testdataPath("get_analysis_runs_empty_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	_, _, _, err := ResolveLatestRun(
		context.Background(),
		client,
		func() (string, error) { return "feature/no-runs", nil },
		testRemote,
	)
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	if !strings.Contains(err.Error(), "no analysis runs found") {
		t.Errorf("expected 'no analysis runs found' in error, got: %s", err.Error())
	}
}

// TestResolveLatestRun_BranchError verifies error when branch name resolution fails.
func TestResolveLatestRun_BranchError(t *testing.T) {
	mock := testutil.MockQueryFunc(t, map[string]string{})
	client := deepsource.NewWithGraphQLClient(mock)

	_, _, _, err := ResolveLatestRun(
		context.Background(),
		client,
		func() (string, error) { return "", errors.New("no git repo") },
		testRemote,
	)
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	if !strings.Contains(err.Error(), "failed to detect current branch") {
		t.Errorf("expected branch detection error, got: %s", err.Error())
	}
}

// TestResolvePRForBranch_Found verifies an open PR is returned when the API finds one.
func TestResolvePRForBranch_Found(t *testing.T) {
	mock := testutil.MockQueryFunc(t, map[string]string{
		"pullRequests(": testdataPath("get_pr_by_branch_found_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	prNumber, found := ResolvePRForBranch(context.Background(), client, "feature/new-auth", testRemote)
	if !found {
		t.Fatal("expected found=true, got false")
	}
	if prNumber != 42 {
		t.Errorf("expected prNumber=42, got %d", prNumber)
	}
}

// TestResolvePRForBranch_NotFound verifies no PR is returned when the API returns empty edges.
func TestResolvePRForBranch_NotFound(t *testing.T) {
	mock := testutil.MockQueryFunc(t, map[string]string{
		"pullRequests(": testdataPath("get_pr_by_branch_empty_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	prNumber, found := ResolvePRForBranch(context.Background(), client, "feature/no-pr", testRemote)
	if found {
		t.Fatal("expected found=false, got true")
	}
	if prNumber != 0 {
		t.Errorf("expected prNumber=0, got %d", prNumber)
	}
}

// TestResolvePRForBranch_ClosedPR verifies a closed PR is treated as not found.
func TestResolvePRForBranch_ClosedPR(t *testing.T) {
	mock := testutil.MockQueryFunc(t, map[string]string{
		"pullRequests(": testdataPath("get_pr_by_branch_closed_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	prNumber, found := ResolvePRForBranch(context.Background(), client, "feature/closed-pr", testRemote)
	if found {
		t.Fatal("expected found=false for CLOSED PR, got true")
	}
	if prNumber != 0 {
		t.Errorf("expected prNumber=0, got %d", prNumber)
	}
}

// TestResolvePRForBranch_Error verifies that errors are swallowed and return found=false.
func TestResolvePRForBranch_Error(t *testing.T) {
	mock := graphqlclient.NewMockClient()
	mock.QueryFunc = func(_ context.Context, _ string, _ map[string]any, _ any) error {
		return errors.New("network error")
	}
	client := deepsource.NewWithGraphQLClient(mock)

	prNumber, found := ResolvePRForBranch(context.Background(), client, "feature/error-branch", testRemote)
	if found {
		t.Fatal("expected found=false on error, got true")
	}
	if prNumber != 0 {
		t.Errorf("expected prNumber=0, got %d", prNumber)
	}
}

// TestResolveLatestRunForBranch_Success verifies the public wrapper returns a run.
func TestResolveLatestRunForBranch_Success(t *testing.T) {
	mock := testutil.MockQueryFunc(t, map[string]string{
		"query GetAnalysisRuns(": testdataPath("get_analysis_runs_success_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	const sha = "3f4a2b1c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a"

	run, err := ResolveLatestRunForBranch(
		context.Background(),
		client,
		"main",
		testRemote,
	)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if run == nil {
		t.Fatal("expected non-nil run, got nil")
	}
	if run.Status != "SUCCESS" {
		t.Errorf("expected status SUCCESS, got %q", run.Status)
	}
	if run.CommitOid != sha {
		t.Errorf("expected commitOid %q, got %q", sha, run.CommitOid)
	}
}
