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

// ResolveLatestRun finds the latest analysis run for the current git branch.
// Returns the commitOid of the latest run and the branch name.
func ResolveLatestRun(
	ctx context.Context,
	client *deepsource.Client,
	remote *vcs.RemoteData,
	branchNameFunc func() (string, error),
) (commitOid string, branchName string, err error) {
	if branchNameFunc != nil {
		branchName, err = branchNameFunc()
	} else {
		branchName, err = getCurrentBranch()
	}
	if err != nil {
		return "", "", fmt.Errorf("failed to detect current branch: %w", err)
	}

	const maxPages = 5
	var after *string

	for page := 0; page < maxPages; page++ {
		runs, pageInfo, err := client.GetAnalysisRuns(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, 30, after)
		if err != nil {
			return "", "", fmt.Errorf("failed to fetch analysis runs: %w", err)
		}

		for _, run := range runs {
			if run.BranchName == branchName && run.Status == "SUCCESS" {
				return run.CommitOid, branchName, nil
			}
		}

		if !pageInfo.HasNextPage || pageInfo.EndCursor == nil {
			break
		}
		after = pageInfo.EndCursor
	}

	return "", branchName, fmt.Errorf(
		"no analysis runs found for branch %q.\nTry: --default-branch, --commit <sha>, or push and analyze this branch first",
		branchName,
	)
}

// ResolveLatestRunForBranch finds the latest successful analysis run for a given branch name.
// Returns the full AnalysisRun (which includes the ReportCard).
func ResolveLatestRunForBranch(
	ctx context.Context,
	client *deepsource.Client,
	remote *vcs.RemoteData,
	branchName string,
) (*runs.AnalysisRun, error) {
	const maxPages = 5
	var after *string

	for page := 0; page < maxPages; page++ {
		analysisRuns, pageInfo, err := client.GetAnalysisRuns(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, 30, after)
		if err != nil {
			return nil, fmt.Errorf("failed to fetch analysis runs: %w", err)
		}

		for i := range analysisRuns {
			if analysisRuns[i].BranchName == branchName && analysisRuns[i].Status == "SUCCESS" {
				return &analysisRuns[i], nil
			}
		}

		if !pageInfo.HasNextPage || pageInfo.EndCursor == nil {
			break
		}
		after = pageInfo.EndCursor
	}

	return nil, fmt.Errorf(
		"no successful analysis runs found for branch %q",
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
