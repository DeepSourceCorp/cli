package utils

import (
	"os/exec"
	"strings"
)

var configFolder string = ".deepsource/analyzer"

// Extracts the path of the config sent as a parameter in the user repo
// Checks in the current working directory as well as the root directory
// of the project
func ExtractProjectRootPath() (string, error) {
	// Fetch the top-level directory
	output, err := exec.Command("git", "rev-parse", "--show-toplevel").Output()
	if err != nil {
		return "", err
	}

	// Removing trailing null characters
	return strings.TrimRight(string(output), "\000\n"), nil
}
