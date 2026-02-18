package cmdutil

import (
	"bytes"
	"context"
	"fmt"
	"os/exec"
	"strings"

	"github.com/deepsourcelabs/cli/deepsource"
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

	runs, err := client.GetAnalysisRuns(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, 30)
	if err != nil {
		return "", "", fmt.Errorf("failed to fetch analysis runs: %w", err)
	}

	for _, run := range runs {
		if run.BranchName == branchName && run.Status == "SUCCESS" {
			return run.CommitOid, branchName, nil
		}
	}

	return "", branchName, fmt.Errorf(
		"no analysis runs found for branch %q.\nTry: --default-branch, --commit <oid>, or push and analyze this branch first",
		branchName,
	)
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
