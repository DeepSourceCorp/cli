package main

import (
	"bytes"
	"os"
	"os/exec"
	"strings"
)

// gitGetHead accepts a git directory and returns head commit OID / error
func gitGetHead(workspaceDir string) (string, error) {
	// Get USER env variable.
	envUser := os.Getenv("USER")
	if envUser == "travis" {
		// Travis creates a merge commit for pull requests on forks.
		// The head of commit is this merge commit, which does not match the commit of deepsource check.

		// Fetch value of pull request SHA. If this is a PR, it will return SHA of HEAD commit of the PR, else "".
		prSHA := os.Getenv("TRAVIS_PULL_REQUEST_SHA")

		// If prSHA is not empty, that means we got an SHA, which is HEAD. Return this.
		if len(prSHA) > 0 {
			return prSHA, nil
		}

	}

	// Check if it is a GitHub Action Environment, If it is then get
	// the HEAD from `GITHUB_SHA` environment
	if _, isGitHubEnv := os.LookupEnv("GITHUB_ACTIONS"); isGitHubEnv {
		// When GITHUB_REF is not set, GITHUB_SHA points to original commit.
		// When set, it points to the "latest *merge* commit in the branch".
		// Ref: https://help.github.com/en/actions/reference/events-that-trigger-workflows#pull-request-event-pull_request
		if _, isBranchCommit := os.LookupEnv("GITHUB_REF"); !isBranchCommit {
			return os.Getenv("GITHUB_SHA"), nil
		}
	}

	// If we are here, it means this is neither GitHub Action on default branch,
	// nor a travis env with PR. Continue to fetch the headOID via the git command.
	headOID := ""

	cmd := exec.Command("git", "--no-pager", "rev-parse", "HEAD")
	cmd.Dir = workspaceDir

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()

	outStr, _ := stdout.String(), stderr.String()

	if err != nil {
		return headOID, err
	}

	// Trim newline suffix from Commit OID
	headOID = strings.TrimSuffix(outStr, "\n")

	return headOID, nil
}
