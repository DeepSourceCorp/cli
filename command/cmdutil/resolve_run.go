package cmdutil

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"os/exec"
	"strings"
	"time"

	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/runs"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	"github.com/deepsourcelabs/cli/internal/debug"
	clierrors "github.com/deepsourcelabs/cli/internal/errors"
	"github.com/deepsourcelabs/cli/internal/vcs"
)

// ResolveLatestRun finds the latest analysis run for the current git branch.
// It fetches recent runs via the GetAnalysisRuns bulk API and filters by branch name.
// Returns the commitOid, branch name, and run status of the latest run.
func ResolveLatestRun(
	ctx context.Context,
	client *deepsource.Client,
	branchNameFunc func() (string, error),
	remote *vcs.RemoteData,
) (commitOid string, branchName string, runStatus string, err error) {
	if branchNameFunc != nil {
		branchName, err = branchNameFunc()
	} else {
		branchName, err = getCurrentBranch()
	}
	if err != nil {
		return "", "", "", fmt.Errorf("failed to detect current branch: %w", err)
	}

	run, err := resolveRunFromCommits(ctx, client, branchName, remote)
	if err != nil {
		return "", branchName, "", err
	}
	return run.CommitOid, branchName, run.Status, nil
}

// ResolveLatestRunForBranch finds the latest analysis run for a given branch name.
func ResolveLatestRunForBranch(
	ctx context.Context,
	client *deepsource.Client,
	branchName string,
	remote *vcs.RemoteData,
) (*runs.AnalysisRun, error) {
	return resolveRunFromCommits(ctx, client, branchName, remote)
}

// resolveRunFromCommits fetches the latest analysis run for a given branch using
// server-side filtering. Returns the most recent run for the branch.
func resolveRunFromCommits(
	ctx context.Context,
	client *deepsource.Client,
	branchName string,
	remote *vcs.RemoteData,
) (*runs.AnalysisRun, error) {
	debug.Log("resolve: fetching analysis runs for branch %q", branchName)
	allRuns, _, err := client.GetAnalysisRuns(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, 1, nil, &branchName)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch analysis runs: %w", err)
	}
	if len(allRuns) == 0 {
		return nil, fmt.Errorf(
			"no analysis runs found for branch %q. Has this branch been pushed and analyzed on DeepSource?\nTry: --default-branch, --commit <sha>, or --pr <number>",
			branchName,
		)
	}
	debug.Log("resolve: found run %s (status=%s) at commit %.7s", allRuns[0].RunUid, allRuns[0].Status, allRuns[0].CommitOid)
	return &allRuns[0], nil
}

// IsRunInProgress returns true if the run status indicates analysis hasn't completed.
func IsRunInProgress(status string) bool {
	return status == "PENDING" || status == "RUNNING"
}

// IsRunTimedOut returns true if the run status indicates analysis timed out.
func IsRunTimedOut(status string) bool {
	return status == "TIMEOUT"
}

// WaitOrFallback handles in-progress analysis runs by falling back to the
// last completed run. Returns the final run status, or "FALLBACK" if the
// caller should fetch the last completed run instead.
func WaitOrFallback(
	_ context.Context,
	_ io.Writer,
	initialStatus string,
	_ string,
	_ string,
	_ time.Duration,
	_ func(ctx context.Context) (status string, err error),
) (string, error) {
	if !IsRunInProgress(initialStatus) {
		return initialStatus, nil
	}

	return "FALLBACK", nil
}

// ResolveLatestCompletedRun finds the most recent completed analysis run on
// a branch, skipping any that are still in-progress or timed out. Returns
// nil if no completed run is found.
func ResolveLatestCompletedRun(
	ctx context.Context,
	client *deepsource.Client,
	branchName string,
	remote *vcs.RemoteData,
) (*runs.AnalysisRun, error) {
	debug.Log("resolve: fetching recent runs for branch %q to find last completed (limit=10)", branchName)
	allRuns, _, err := client.GetAnalysisRuns(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, 10, nil, &branchName)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch analysis runs: %w", err)
	}
	for i, run := range allRuns {
		if !IsRunInProgress(run.Status) && !IsRunTimedOut(run.Status) {
			debug.Log("resolve: found completed run %s (status=%s) at index %d", run.RunUid, run.Status, i)
			return &allRuns[i], nil
		}
	}
	debug.Log("resolve: no completed run found among %d runs", len(allRuns))
	return nil, nil
}

// ResolveCommitOid expands a short commit SHA to a full 40-char SHA using git rev-parse.
// If the input is already 40 chars or git rev-parse fails, returns the original value.
func ResolveCommitOid(commitOid string) string {
	if len(commitOid) == 40 {
		return commitOid
	}
	cmd := exec.Command("git", "--no-pager", "rev-parse", commitOid)
	var stdout bytes.Buffer
	cmd.Stdout = &stdout
	if err := cmd.Run(); err != nil {
		return commitOid
	}
	resolved := strings.TrimSpace(stdout.String())
	if len(resolved) == 40 {
		return resolved
	}
	return commitOid
}

// ResolveBranchName returns the current branch name using the provided function,
// or falls back to git rev-parse if branchNameFunc is nil.
func ResolveBranchName(branchNameFunc func() (string, error)) (string, error) {
	if branchNameFunc != nil {
		return branchNameFunc()
	}
	return getCurrentBranch()
}

func getCurrentBranch() (string, error) {
	cmd := exec.Command("git", "--no-pager", "rev-parse", "--abbrev-ref", "HEAD")
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		if strings.Contains(err.Error(), "128") {
			return "", clierrors.ErrNotGitRepo()
		}
		return "", err
	}
	branch := strings.TrimSuffix(stdout.String(), "\n")
	debug.Log("git: current branch = %q", branch)
	return branch, nil
}

// ResolvePRForBranch checks whether the given branch has an open pull request.
// Returns the PR number if found, or found=false otherwise.
// Errors are swallowed (best-effort) — callers fall back to run-based resolution.
func ResolvePRForBranch(ctx context.Context, client *deepsource.Client, branchName string, remote *vcs.RemoteData) (prNumber int, found bool) {
	debug.Log("resolve: checking for open PR on branch %q", branchName)
	prNumber, found, err := client.GetPRForBranch(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, branchName)
	if err != nil {
		debug.Log("resolve: PR lookup failed: %v", err)
		return 0, false
	}
	if found {
		debug.Log("resolve: found open PR #%d for branch %q", prNumber, branchName)
	} else {
		debug.Log("resolve: no open PR for branch %q", branchName)
	}
	return prNumber, found
}

// HasUnpushedCommits returns true if the current branch has commits that
// haven't been pushed to the upstream remote. Returns false if the upstream
// is not configured or if git is unavailable.
func HasUnpushedCommits() bool {
	cmd := exec.Command("git", "--no-pager", "rev-list", "@{upstream}..HEAD", "--count")
	var stdout bytes.Buffer
	cmd.Stdout = &stdout
	if err := cmd.Run(); err != nil {
		return false
	}
	count := strings.TrimSpace(stdout.String())
	return count != "0"
}

// HasUncommittedChanges returns true if the working tree has uncommitted
// changes (staged or unstaged). Returns false if git is unavailable.
func HasUncommittedChanges() bool {
	cmd := exec.Command("git", "status", "--porcelain")
	var stdout bytes.Buffer
	cmd.Stdout = &stdout
	if err := cmd.Run(); err != nil {
		return false
	}
	return strings.TrimSpace(stdout.String()) != ""
}

// AutoBranchResult holds the outcome of automatic branch resolution.
type AutoBranchResult struct {
	BranchName string
	CommitOid  string
	PRNumber   int  // >0 if a PR was detected for the branch
	UseRepo    bool // true when the caller should fall back to repo-level (default branch) data
	Empty      bool // true when there are no results (timeout, no completed runs)
}

// ResolveAutoBranch encapsulates the shared "default" branch resolution logic
// used by the issues, metrics, and vulnerabilities commands. It detects the
// current branch, checks for an open PR, waits for in-progress runs, and
// handles fallback/timeout scenarios.
func ResolveAutoBranch(
	ctx context.Context,
	w io.Writer,
	client *deepsource.Client,
	branchNameFunc func() (string, error),
	remote *vcs.RemoteData,
) (*AutoBranchResult, error) {
	branchName, err := ResolveBranchName(branchNameFunc)
	if err != nil {
		return nil, err
	}

	result := &AutoBranchResult{BranchName: branchName}

	// Check for an open PR on this branch.
	if prNumber, found := ResolvePRForBranch(ctx, client, branchName, remote); found {
		result.PRNumber = prNumber
		return resolveWithPR(ctx, w, client, branchName, remote, result)
	}

	return resolveWithoutPR(ctx, w, client, branchNameFunc, branchName, remote, result)
}

// resolveWithPR handles branch resolution when an open PR exists.
func resolveWithPR(
	ctx context.Context,
	w io.Writer,
	client *deepsource.Client,
	branchName string,
	remote *vcs.RemoteData,
	result *AutoBranchResult,
) (*AutoBranchResult, error) {
	run, runErr := ResolveLatestRunForBranch(ctx, client, branchName, remote)
	if runErr == nil && IsRunInProgress(run.Status) {
		finalStatus, waitErr := WaitOrFallback(
			ctx, w, run.Status, run.CommitOid[:8], branchName, 5*time.Second,
			func(ctx context.Context) (string, error) {
				r, err := ResolveLatestRunForBranch(ctx, client, branchName, remote)
				if err != nil {
					return "", err
				}
				return r.Status, nil
			})
		if waitErr != nil {
			return nil, waitErr
		}
		if IsRunTimedOut(finalStatus) {
			style.Warnf(w, "Analysis timed out for branch %q.", branchName)
			result.Empty = true
			return result, nil
		}
		if finalStatus == "FALLBACK" {
			completedRun, fallbackErr := ResolveLatestCompletedRun(ctx, client, branchName, remote)
			if fallbackErr != nil {
				return nil, fallbackErr
			}
			if completedRun == nil {
				style.Infof(w, "Analysis is still in progress for branch %q. Try again shortly, or use --default-branch to see results from the default branch.", branchName)
				result.Empty = true
				return result, nil
			}
			style.Infof(w, "Analysis is running on commit %s. Showing results from the last analyzed commit (%s).", run.CommitOid[:8], completedRun.CommitOid[:8])
			result.CommitOid = completedRun.CommitOid
			return result, nil
		}
	}
	if runErr == nil {
		result.CommitOid = run.CommitOid
	}
	return result, nil
}

// resolveWithoutPR handles branch resolution when no PR exists.
func resolveWithoutPR(
	ctx context.Context,
	w io.Writer,
	client *deepsource.Client,
	branchNameFunc func() (string, error),
	branchName string,
	remote *vcs.RemoteData,
	result *AutoBranchResult,
) (*AutoBranchResult, error) {
	// If on the default branch, use repo-level data directly.
	if branchName != "" && branchName == GetDefaultBranch() {
		result.UseRepo = true
		return result, nil
	}

	commitOid, _, runStatus, resolveErr := ResolveLatestRun(ctx, client, branchNameFunc, remote)
	if resolveErr != nil {
		return nil, resolveErr
	}

	finalStatus, waitErr := WaitOrFallback(ctx, w, runStatus, commitOid[:8], branchName, 5*time.Second,
		func(ctx context.Context) (string, error) {
			_, _, s, err := ResolveLatestRun(ctx, client, branchNameFunc, remote)
			return s, err
		})
	if waitErr != nil {
		return nil, waitErr
	}
	if finalStatus == "FALLBACK" {
		run, fallbackErr := ResolveLatestCompletedRun(ctx, client, branchName, remote)
		if fallbackErr != nil {
			return nil, fallbackErr
		}
		if run == nil {
			style.Infof(w, "Analysis is still in progress for branch %q. Try again shortly, or use --default-branch to see results from the default branch.", branchName)
			result.Empty = true
			return result, nil
		}
		style.Infof(w, "Analysis is running on commit %s. Showing results from the last analyzed commit (%s).", commitOid[:8], run.CommitOid[:8])
		commitOid = run.CommitOid
	}
	if IsRunTimedOut(finalStatus) {
		style.Warnf(w, "Analysis timed out for branch %q.", branchName)
		result.Empty = true
		return result, nil
	}

	result.CommitOid = commitOid
	return result, nil
}

// GetDefaultBranch returns the default branch name of the origin remote
// (e.g. "master" or "main"). Returns an empty string if it cannot be determined.
func GetDefaultBranch() string {
	cmd := exec.Command("git", "--no-pager", "symbolic-ref", "refs/remotes/origin/HEAD")
	var stdout bytes.Buffer
	cmd.Stdout = &stdout
	if err := cmd.Run(); err != nil {
		return ""
	}
	ref := strings.TrimSpace(stdout.String())
	return strings.TrimPrefix(ref, "refs/remotes/origin/")
}
