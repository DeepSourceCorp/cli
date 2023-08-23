package report

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"github.com/getsentry/sentry-go"
)

// gitGetHead accepts a git directory and returns head commit OID / error
func gitGetHead(workspaceDir string) (commitOID string, warning string, err error) {
	// TRAVIS CI
	// Get USER env variable.
	if envUser := os.Getenv("USER"); envUser == "travis" {
		// Travis creates a merge commit for pull requests on forks.
		// The head of commit is this merge commit, which does not match the commit of deepsource check.
		// Fetch value of pull request SHA. If this is a PR, it will return SHA of HEAD commit of the PR, else "".
		// If prSHA is not empty, that means we got an SHA, which is HEAD. Return this.
		if prSHA := os.Getenv("TRAVIS_PULL_REQUEST_SHA"); len(prSHA) > 0 {
			return prSHA, "", nil
		}
	}

	// GITHUB ACTIONS
	// Check if it is a GitHub Action Environment
	// If it is: then get the HEAD commit from `GITHUB_SHA` environment and do an early exit
	_, isGitHubEnv := os.LookupEnv("GITHUB_ACTIONS")
	if isGitHubEnv {
		// When GITHUB_REF is not set, GITHUB_SHA points to original commit.
		// When set, it points to the "latest *merge* commit in the branch".
		// We don't want early exit in the above case.
		// Ref: https://help.github.com/en/actions/reference/events-that-trigger-workflows#pull-request-event-pull_request
		if _, isBranchCommit := os.LookupEnv("GITHUB_REF"); !isBranchCommit {
			return os.Getenv("GITHUB_SHA"), "", nil
		}
	}

	// Check if the `GIT_COMMIT_SHA` environment variable exists. If yes, return this as
	// the latest commit sha.
	// This is used in cases when the user:
	// 1. Is using a CI other than GH Actions/ Travis CI (handled above)
	// 2. Wants to report tcv from inside a docker container in which they are running tests.
	// In this scenario, the container doesn't have data about the latest git commit sha so
	// it is injected by the user manually while running the container.
	// Example:
	// GIT_COMMIT_SHA=$(git --no-pager rev-parse HEAD | tr -d '\n')
	// docker run -e DEEPSOURCE_DSN -e GIT_COMMIT_SHA ...
	if _, isManuallyInjectedSHA := os.LookupEnv("GIT_COMMIT_SHA"); isManuallyInjectedSHA {
		return os.Getenv("GIT_COMMIT_SHA"), "", nil
	}

	// If we are here, it means that we couldn't reliably find the HEAD commit.
	// Fetch it manually using the git command.
	headOID, err := fetchHeadManually(workspaceDir)
	if err != nil {
		fmt.Println(err)
		sentry.CaptureException(err)
		return "", "", err
	}

	// One last check for GitHub Actions. In the above code for GitHub Action, we did an early exit
	// only when the GITHUB_REF wasn't set. This would be for a very small subset of GitHub events.
	// We want to automatically detect merge commits, which pull_request events are nutorious to make.
	// We are anyways going to return `headOID` fetched manually, but want to warn users about the merge commit.
	if isGitHubEnv {
		eventName := os.Getenv("GITHUB_EVENT_NAME")
		eventCommitSha := os.Getenv("GITHUB_SHA")
		// When ref is not provided during the checkout step, headOID would be the same as GITHUB_SHA
		// This confirms the merge commit.
		// event names where GITHUB_SHA would be of a merge commit:
		//    "pull_request",
		// 	  "pull_request_review",
		// 	  "pull_request_review",
		// 	  "pull_request_review_comment",
		if strings.HasPrefix(eventName, "pull_request") && headOID == eventCommitSha {
			warning = "Warning: Looks like the checkout step is making a merge commit. " +
				"Test coverage Analyzer would not run for the reported artifact because the merge commit doesn't exist upstream.\n" +
				"Please refer to the docs for required changes. Ref: https://docs.deepsource.com/docs/analyzers-test-coverage#with-github-actions"
		}
	}

	return headOID, warning, nil
}

// Fetches the latest commit hash using the command `git rev-parse HEAD`
// through git
func fetchHeadManually(directoryPath string) (string, error) {
	cmd := exec.Command("git", "--no-pager", "rev-parse", "HEAD")
	cmd.Dir = directoryPath

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()
	outStr, _ := stdout.String(), stderr.String()
	if err != nil {
		return "", err
	}

	// Trim newline suffix from Commit OID
	return strings.TrimSuffix(outStr, "\n"), nil
}
