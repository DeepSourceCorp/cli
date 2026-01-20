package adapters

import (
	"bytes"
	"os"
	"os/exec"
	"strings"

	"github.com/deepsourcelabs/cli/internal/interfaces"
	"github.com/deepsourcelabs/cli/internal/vcs"
)

// RealGitClient provides git operations using the host environment.
type RealGitClient struct{}

func NewRealGitClient() *RealGitClient {
	return &RealGitClient{}
}

func (g *RealGitClient) GetHead(workspaceDir string) (string, string, error) {
	return gitGetHead(workspaceDir)
}

func (g *RealGitClient) ListRemotes(dir string) (map[string]interfaces.RemoteInfo, error) {
	remotes, err := vcs.ListRemotes()
	if err != nil {
		return nil, err
	}

	result := make(map[string]interfaces.RemoteInfo, len(remotes))
	for name, fields := range remotes {
		info := interfaces.RemoteInfo{}
		if len(fields) > 0 {
			info.Owner = fields[0]
		}
		if len(fields) > 1 {
			info.RepoName = fields[1]
		}
		if len(fields) > 2 {
			info.Provider = fields[2]
		}
		if len(fields) > 3 {
			info.DisplayName = fields[3]
		}
		result[name] = info
	}

	return result, nil
}

// gitGetHead accepts a git directory and returns head commit OID / error.
func gitGetHead(workspaceDir string) (headOID string, warning string, err error) {
	// Check if DeepSource's Test coverage action triggered this first before executing any git commands.
	headOID, err = getTestCoverageActionCommit()
	if headOID != "" {
		return
	}

	// Check if the `GIT_COMMIT_SHA` environment variable exists. If yes, return this as
	// the latest commit sha.
	if injectedSHA, isManuallyInjectedSHA := os.LookupEnv("GIT_COMMIT_SHA"); isManuallyInjectedSHA {
		return injectedSHA, "", nil
	}

	// Get the top commit manually, using git command.
	headOID, err = fetchHeadManually(workspaceDir)
	if err != nil {
		return
	}

	// TRAVIS CI
	if envUser := os.Getenv("USER"); envUser == "travis" {
		headOID, warning, err = getTravisCommit(headOID)
		return
	}

	// GITHUB ACTIONS
	if _, isGitHubEnv := os.LookupEnv("GITHUB_ACTIONS"); isGitHubEnv {
		headOID, warning, err = getGitHubActionsCommit(headOID)
		return
	}

	// If we are here, it means there weren't any special cases.
	return
}

// Fetches the latest commit hash using the command `git rev-parse HEAD`.
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

	// Trim newline suffix from Commit OID.
	return strings.TrimSuffix(outStr, "\n"), nil
}

// Handle special cases for GitHub Actions.
func getGitHubActionsCommit(topCommit string) (headOID string, warning string, err error) {
	// When GITHUB_REF is not set, GITHUB_SHA points to original commit.
	if _, isRefPresent := os.LookupEnv("GITHUB_REF"); !isRefPresent {
		headOID = os.Getenv("GITHUB_SHA")
		return
	}

	// Detect merge commit made by GitHub Actions for pull_request events.
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

// Return PR's HEAD ref set as env variable manually by DeepSource's Test coverage action.
func getTestCoverageActionCommit() (headOID string, err error) {
	headOID = os.Getenv("GHA_HEAD_COMMIT_SHA")
	return
}

// Handle special case for TravisCI.
func getTravisCommit(topCommit string) (string, string, error) {
	if prSHA := os.Getenv("TRAVIS_PULL_REQUEST_SHA"); len(prSHA) > 0 {
		return prSHA, "", nil
	}

	return topCommit, "", nil
}
