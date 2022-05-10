package utils

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

var configFolder string = ".deepsource/analyzer"

// Extracts the path of the config sent as a parameter in the user repo
// Checks in the current working directory as well as the root directory
// of the project
func extractProjectRootPath() (string, error) {
	// Fetch the top-level directory
	output, err := exec.Command("git", "rev-parse", "--show-toplevel").Output()
	if err != nil {
		return "", err
	}

	// Removing trailing null characters
	return strings.TrimRight(string(output), "\000\n"), nil
}

func InitAnalyzerConfigurationPaths() (string, string, string) {
	cwd, _ := os.Getwd()

	// Extracting the path of the project root
	projectRoot, err := extractProjectRootPath()
	if err != nil {
		projectRoot = cwd
	}

	// Configuring the paths of analyzer.toml and issues directory
	analyzerTOMLPath := filepath.Join(projectRoot, configFolder, "analyzer.toml")
	issuesDirPath := filepath.Join(projectRoot, configFolder, "issues/")
	return projectRoot, analyzerTOMLPath, issuesDirPath
}
