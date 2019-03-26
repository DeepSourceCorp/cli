package main

import (
	"bytes"
	"os/exec"
	"strings"
)

// gitGetHead accepts a git directory and returns head commit OID / error
func gitGetHead(workspaceDir string) (string, error) {
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
