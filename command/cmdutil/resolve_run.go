package cmdutil

import (
	"bytes"
	"context"
	"fmt"
	"os/exec"
	"strings"

	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/runs"
	"github.com/deepsourcelabs/cli/internal/vcs"
)

// ResolveLatestRun finds the latest successful analysis run for the current git branch.
// It walks recent commits from git history and looks up each via the run(commitOid) API.
// Returns the commitOid of the latest run and the branch name.
func ResolveLatestRun(
	ctx context.Context,
	client *deepsource.Client,
	remote *vcs.RemoteData,
	branchNameFunc func() (string, error),
	commitLogFunc func(branch string) ([]string, error),
) (commitOid string, branchName string, err error) {
	if branchNameFunc != nil {
		branchName, err = branchNameFunc()
	} else {
		branchName, err = getCurrentBranch()
	}
	if err != nil {
		return "", "", fmt.Errorf("failed to detect current branch: %w", err)
	}

	run, err := resolveRunFromCommits(ctx, client, branchName, commitLogFunc)
	if err != nil {
		return "", branchName, err
	}
	return run.CommitOid, branchName, nil
}

// ResolveLatestRunForBranch finds the latest successful analysis run for a given branch name.
// It walks recent commits on the branch and looks up each via the run(commitOid) API.
// Returns the full AnalysisRun (which includes the ReportCard).
func ResolveLatestRunForBranch(
	ctx context.Context,
	client *deepsource.Client,
	remote *vcs.RemoteData,
	branchName string,
	commitLogFunc func(branch string) ([]string, error),
) (*runs.AnalysisRun, error) {
	return resolveRunFromCommits(ctx, client, branchName, commitLogFunc)
}

// resolveRunFromCommits walks recent commits on a branch and returns the first
// successful analysis run found via the run(commitOid) API.
func resolveRunFromCommits(
	ctx context.Context,
	client *deepsource.Client,
	branchName string,
	commitLogFunc func(branch string) ([]string, error),
) (*runs.AnalysisRun, error) {
	var commits []string
	var err error
	if commitLogFunc != nil {
		commits, err = commitLogFunc(branchName)
	} else {
		commits, err = getCommitLog(branchName)
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get commit history for branch %q: %w", branchName, err)
	}

	for _, sha := range commits {
		run, err := client.GetRunByCommit(ctx, sha)
		if err != nil {
			continue
		}
		if run != nil && run.Status == "SUCCESS" && run.BranchName == branchName {
			return run, nil
		}
	}

	return nil, fmt.Errorf(
		"no analysis runs found for branch %q.\nTry: --default-branch, --commit <sha>, or push and analyze this branch first",
		branchName,
	)
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
	return strings.TrimSuffix(stdout.String(), "\n"), nil
}

// getCommitLog returns recent commit SHAs for a branch using git log.
func getCommitLog(branch string) ([]string, error) {
	cmd := exec.Command("git", "--no-pager", "log", branch, "--format=%H", "-n", "50")
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("%s: %s", err, strings.TrimSpace(stderr.String()))
	}
	lines := strings.TrimSpace(stdout.String())
	if lines == "" {
		return nil, nil
	}
	return strings.Split(lines, "\n"), nil
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
