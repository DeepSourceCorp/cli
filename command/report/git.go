package report

import (
	"bytes"
	"os"
	"os/exec"
	"strings"
)

func gitGetHead(workspaceDir string) (headOID string, warning string, err error) {
	headOID, err = getTestCoverageActionCommit()
	if headOID != "" {
		return
	}

	// GIT_COMMIT_SHA allows injecting the commit SHA manually (e.g. from a Docker container
	// that doesn't have git history).
	if injectedSHA, isManuallyInjectedSHA := os.LookupEnv("GIT_COMMIT_SHA"); isManuallyInjectedSHA {
		return injectedSHA, "", nil
	}

	headOID, err = fetchHeadManually(workspaceDir)
	if err != nil {
		return
	}

	if envUser := os.Getenv("USER"); envUser == "travis" {
		headOID, warning, err = getTravisCommit(headOID)
		return
	}

	if _, isGitHubEnv := os.LookupEnv("GITHUB_ACTIONS"); isGitHubEnv {
		headOID, warning, err = getGitHubActionsCommit(headOID)
		return
	}

	return
}

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

	return strings.TrimSuffix(outStr, "\n"), nil
}

func getGitHubActionsCommit(topCommit string) (headOID string, warning string, err error) {
	// When GITHUB_REF is not set, GITHUB_SHA points to the original commit.
	// Ref: https://help.github.com/en/actions/reference/events-that-trigger-workflows#pull-request-event-pull_request
	if _, isRefPresent := os.LookupEnv("GITHUB_REF"); !isRefPresent {
		headOID = os.Getenv("GITHUB_SHA")
		return
	}

	// Detect merge commits created by pull_request events.
	eventName := os.Getenv("GITHUB_EVENT_NAME")
	eventCommitSha := os.Getenv("GITHUB_SHA")
	if strings.HasPrefix(eventName, "pull_request") && topCommit == eventCommitSha {
		warning = "Warning: Looks like the checkout step is making a merge commit. " +
			"Test coverage Analyzer would not run for the reported artifact because the merge commit doesn't exist upstream.\n" +
			"Please refer to the docs for required changes. Ref: https://docs.deepsource.com/docs/analyzers-test-coverage#with-github-actions"
	}
	headOID = topCommit
	return
}

func getTestCoverageActionCommit() (headOID string, err error) {
	headOID = os.Getenv("GHA_HEAD_COMMIT_SHA")

	return
}

func getTravisCommit(topCommit string) (string, string, error) {
	// Travis creates a merge commit for PR forks; use the real PR head instead.
	if prSHA := os.Getenv("TRAVIS_PULL_REQUEST_SHA"); len(prSHA) > 0 {
		return prSHA, "", nil
	}

	return topCommit, "", nil
}
