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

	// If we are here, it means either this is not a travis env, or this is not a travis PR.
	// Continue to fetch the headOID via the git command.
	headOID := ""

	cmd := exec.Command("git", "--no-pager", "rev-parse", "HEAD")
	cmd.Dir = workspaceDir

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()

	outStr, _ := string(stdout.Bytes()), string(stderr.Bytes())

	if err != nil {
		return headOID, err
	}

	// Trim newline suffix from Commit OID
	headOID = strings.TrimSuffix(outStr, "\n")

	return headOID, nil
}
