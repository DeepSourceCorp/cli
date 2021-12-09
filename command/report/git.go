package report

import (
	"fmt"
	"os"

	"github.com/getsentry/sentry-go"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
)

// gitGetHead accepts a git directory and returns head commit OID / error
func gitGetHead(workspaceDir string) (string, error) {
	// TRAVIS CI
	// Get USER env variable.
	if envUser := os.Getenv("USER"); envUser == "travis" {
		// Travis creates a merge commit for pull requests on forks.
		// The head of commit is this merge commit, which does not match the commit of deepsource check.
		// Fetch value of pull request SHA. If this is a PR, it will return SHA of HEAD commit of the PR, else "".
		// If prSHA is not empty, that means we got an SHA, which is HEAD. Return this.
		if prSHA := os.Getenv("TRAVIS_PULL_REQUEST_SHA"); len(prSHA) > 0 {
			return prSHA, nil
		}
	}

	// GITHUB ACTIONS
	// Check if it is a GitHub Action Environment
	// If it is: then get the HEAD from `GITHUB_SHA` environment
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
	headOID, err := fetchHeadManually(workspaceDir)
	if err != nil {
		fmt.Println(err)
		sentry.CaptureException(err)
		return "", err
	}
	return headOID, nil
}

// Fetches the latest commit hash using the command `git rev-parse HEAD`
// through go-git
func fetchHeadManually(directoryPath string) (string, error) {
	// Open a new repository targeting the given path (the .git folder)
	repo, err := git.PlainOpen(directoryPath)
	if err != nil {
		return "", err
	}

	// Resolve revision into a sha1 commit
	commitHash, err := repo.ResolveRevision(plumbing.Revision("HEAD"))
	if err != nil {
		return "", err
	}
	return commitHash.String(), nil
}
