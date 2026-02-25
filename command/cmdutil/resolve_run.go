package cmdutil

import (
	"bytes"
	"context"
	"fmt"
	"os/exec"
	"strings"

	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/runs"
	"github.com/deepsourcelabs/cli/internal/debug"
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

// ResolveLatestRunForBranch finds the latest analysis run for a given branch name
// that has a completed report card. It fetches up to 10 recent runs and returns
// the first one with a non-nil ReportCard. If no run has a report card, it returns
// the most recent run (so callers can still show in-progress/timeout status messages).
func ResolveLatestRunForBranch(
	ctx context.Context,
	client *deepsource.Client,
	branchName string,
	remote *vcs.RemoteData,
) (*runs.AnalysisRun, error) {
	debug.Log("resolve: fetching recent analysis runs for branch %q (limit=10)", branchName)
	allRuns, _, err := client.GetAnalysisRuns(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, 10, nil, &branchName)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch analysis runs: %w", err)
	}
	if len(allRuns) == 0 {
		return nil, fmt.Errorf(
			"no analysis runs found for branch %q.\nTry: --default-branch, --commit <sha>, or --pr <number>",
			branchName,
		)
	}
	for i, run := range allRuns {
		if run.ReportCard != nil {
			debug.Log("resolve: found run %s (status=%s) with report card at index %d", run.RunUid, run.Status, i)
			return &allRuns[i], nil
		}
	}
	debug.Log("resolve: no run with report card found, returning latest run %s (status=%s)", allRuns[0].RunUid, allRuns[0].Status)
	return &allRuns[0], nil
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
			"no analysis runs found for branch %q.\nTry: --default-branch, --commit <sha>, or --pr <number>",
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
