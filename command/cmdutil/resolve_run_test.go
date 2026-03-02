package cmdutil

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
	"time"

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

// --- WaitOrFallback tests ---

// TestWaitOrFallback_AlreadyCompleted verifies that a non-in-progress status
// is returned immediately without any polling or prompt.
func TestWaitOrFallback_AlreadyCompleted(t *testing.T) {
	var buf bytes.Buffer
	status, err := WaitOrFallback(
		context.Background(),
		&buf,
		"SUCCESS",
		"abc12345",
		"main",
		10*time.Millisecond,
		func(_ context.Context) (string, error) {
			t.Fatal("check should not be called for completed status")
			return "", nil
		},
	)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if status != "SUCCESS" {
		t.Errorf("expected SUCCESS, got %q", status)
	}
}

// TestWaitOrFallback_TimeoutStatus verifies TIMEOUT is returned immediately.
func TestWaitOrFallback_TimeoutStatus(t *testing.T) {
	var buf bytes.Buffer
	status, err := WaitOrFallback(
		context.Background(),
		&buf,
		"TIMEOUT",
		"abc12345",
		"main",
		10*time.Millisecond,
		func(_ context.Context) (string, error) {
			t.Fatal("check should not be called for TIMEOUT status")
			return "", nil
		},
	)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if status != "TIMEOUT" {
		t.Errorf("expected TIMEOUT, got %q", status)
	}
}

// TestWaitOrFallback_NonTTYFallback verifies that in a non-TTY environment
// (like a test runner), an in-progress status returns FALLBACK.
func TestWaitOrFallback_NonTTYFallback(t *testing.T) {
	var buf bytes.Buffer
	status, err := WaitOrFallback(
		context.Background(),
		&buf,
		"RUNNING",
		"abc12345",
		"feature/test",
		10*time.Millisecond,
		func(_ context.Context) (string, error) {
			t.Fatal("check should not be called in non-TTY fallback")
			return "", nil
		},
	)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if status != "FALLBACK" {
		t.Errorf("expected FALLBACK, got %q", status)
	}
}

// TestWaitOrFallback_PendingFallback verifies PENDING also triggers FALLBACK in non-TTY.
func TestWaitOrFallback_PendingFallback(t *testing.T) {
	var buf bytes.Buffer
	status, err := WaitOrFallback(
		context.Background(),
		&buf,
		"PENDING",
		"def67890",
		"develop",
		10*time.Millisecond,
		func(_ context.Context) (string, error) {
			t.Fatal("check should not be called in non-TTY fallback")
			return "", nil
		},
	)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if status != "FALLBACK" {
		t.Errorf("expected FALLBACK, got %q", status)
	}
}

// --- ResolveLatestCompletedRun tests ---

// TestResolveLatestCompletedRun_MixedStatus verifies that the first completed
// run is returned when the most recent run is still in-progress.
func TestResolveLatestCompletedRun_MixedStatus(t *testing.T) {
	mock := testutil.MockQueryFunc(t, map[string]string{
		"query GetAnalysisRuns(": testdataPath("get_analysis_runs_mixed_status_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	run, err := ResolveLatestCompletedRun(
		context.Background(),
		client,
		"feature/new-auth",
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
	if run.RunUid != "run-uid-success-2" {
		t.Errorf("expected run-uid-success-2, got %q", run.RunUid)
	}
}

// TestResolveLatestCompletedRun_AllRunning verifies nil is returned when
// no completed runs exist.
func TestResolveLatestCompletedRun_AllRunning(t *testing.T) {
	mock := testutil.MockQueryFunc(t, map[string]string{
		"query GetAnalysisRuns(": testdataPath("get_analysis_runs_all_running_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	run, err := ResolveLatestCompletedRun(
		context.Background(),
		client,
		"develop",
		testRemote,
	)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if run != nil {
		t.Errorf("expected nil run, got %+v", run)
	}
}

// TestResolveWithPR_PendingFallback verifies that resolveWithPR falls back to
// the last completed run when the latest run is PENDING and WaitOrFallback
// returns FALLBACK (non-TTY environment).
func TestResolveWithPR_PendingFallback(t *testing.T) {
	pendingData := testutil.LoadGoldenFile(t, testdataPath("get_analysis_runs_pending_response.json"))
	mixedData := testutil.LoadGoldenFile(t, testdataPath("get_analysis_runs_mixed_status_response.json"))

	callCount := 0
	mock := graphqlclient.NewMockClient()
	mock.QueryFunc = func(_ context.Context, query string, _ map[string]any, result any) error {
		if !strings.Contains(query, "query GetAnalysisRuns(") {
			t.Fatalf("unexpected query: %s", query)
		}
		callCount++
		if callCount == 1 {
			// First call: ResolveLatestRunForBranch → PENDING run
			return json.Unmarshal(pendingData, result)
		}
		// Second call: ResolveLatestCompletedRun → mixed (RUNNING + SUCCESS)
		return json.Unmarshal(mixedData, result)
	}
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	result := &AutoBranchResult{BranchName: "feature/new-auth", PRNumber: 42}

	got, err := resolveWithPR(context.Background(), &buf, client, "feature/new-auth", testRemote, result)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.Empty {
		t.Fatal("expected non-empty result, got Empty=true")
	}
	// Should fall back to the completed run's commit OID
	const expectedOid = "b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1"
	if got.CommitOid != expectedOid {
		t.Errorf("expected CommitOid=%q (completed run), got %q", expectedOid, got.CommitOid)
	}
	if !strings.Contains(buf.String(), "Showing results from the last analyzed commit") {
		t.Errorf("expected fallback info message, got: %s", buf.String())
	}
}

// TestResolveWithPR_PendingNoCompletedRuns verifies that resolveWithPR returns
// Empty=true when the latest run is PENDING and no completed runs exist.
func TestResolveWithPR_PendingNoCompletedRuns(t *testing.T) {
	pendingData := testutil.LoadGoldenFile(t, testdataPath("get_analysis_runs_pending_response.json"))
	allRunningData := testutil.LoadGoldenFile(t, testdataPath("get_analysis_runs_all_running_response.json"))

	callCount := 0
	mock := graphqlclient.NewMockClient()
	mock.QueryFunc = func(_ context.Context, _ string, _ map[string]any, result any) error {
		callCount++
		if callCount == 1 {
			return json.Unmarshal(pendingData, result)
		}
		return json.Unmarshal(allRunningData, result)
	}
	client := deepsource.NewWithGraphQLClient(mock)

	var buf bytes.Buffer
	result := &AutoBranchResult{BranchName: "feature/new-auth", PRNumber: 42}

	got, err := resolveWithPR(context.Background(), &buf, client, "feature/new-auth", testRemote, result)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !got.Empty {
		t.Fatal("expected Empty=true when no completed runs exist")
	}
	if !strings.Contains(buf.String(), "Analysis is still in progress") {
		t.Errorf("expected 'analysis still in progress' message, got: %s", buf.String())
	}
}

// TestResolveLatestCompletedRun_NoRuns verifies nil is returned when the
// branch has no runs at all.
func TestResolveLatestCompletedRun_NoRuns(t *testing.T) {
	mock := testutil.MockQueryFunc(t, map[string]string{
		"query GetAnalysisRuns(": testdataPath("get_analysis_runs_empty_response.json"),
	})
	client := deepsource.NewWithGraphQLClient(mock)

	run, err := ResolveLatestCompletedRun(
		context.Background(),
		client,
		"feature/no-runs",
		testRemote,
	)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if run != nil {
		t.Errorf("expected nil run, got %+v", run)
	}
}
