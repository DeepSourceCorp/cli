package initialize

import (
	"bytes"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
)

// Contains the list of supported SDKs for building DeepSource Analyzers
var supportedAnalyzerSDKs = []string{}

func processAnalyzerTags(userInput string) []string {
	re := regexp.MustCompile("[ ,]")
	return delete_empty(re.Split(userInput, -1))
}

func delete_empty(s []string) []string {
	var r []string
	for _, str := range s {
		if str != "" {
			r = append(r, str)
		}
	}
	return r
}

func fetchRemoteURL() (string, error) {
	var remoteRepoURL string

	// TODO: Add support for fetching URLs for other remotes here as well
	remoteURL, err := exec.Command("git", "config", "--get", "remote.origin.url").Output()
	if err != nil {
		return "", err
	}
	remoteRepoURL = strings.TrimRight(string(remoteURL), "\000\n")

	// Return the remoteURL if it already begins with `https://`
	if strings.HasPrefix(remoteRepoURL, "https://") {
		return remoteRepoURL, nil
	}

	// If the URL doesn't begin with `git@` don't move further and send an empty default remoteURL
	if !strings.HasPrefix(remoteRepoURL, "git@") {
		return "", fmt.Errorf("couldn't parse the default remote URL")
	}

	// If the URL begins with `git@`, extract the substring till the colon(:) in the remote URL
	colonIndex := strings.Index(remoteRepoURL, ":")
	if colonIndex == -1 {
		return remoteRepoURL, fmt.Errorf("couldn't parse the default remote URL")
	}

	vcsURL := remoteRepoURL[:colonIndex]
	switch vcsURL {
	case "git@github.com":
		urlComponent := strings.TrimPrefix(remoteRepoURL, "git@github.com:")
		remoteRepoURL = "https://github.com/" + urlComponent
	case "git@gitlab.com":
		urlComponent := strings.TrimPrefix(remoteRepoURL, "git@gitlab.com:")
		remoteRepoURL = "https://gitlab.com/" + urlComponent
	case "git@bitbucket.org":
		urlComponent := strings.TrimPrefix(remoteRepoURL, "git@bitbucket.org:")
		remoteRepoURL = "https://bitbucket.org/" + urlComponent
	}
	return strings.TrimSuffix(remoteRepoURL, ".git"), nil
}

// Returns the list of supported SDKs
func getSupportedSDKs() []string {
	return supportedAnalyzerSDKs
}

// Sanitize the input of namespace and Analyzer shortcode for any spaces
// or special characters and replace them with hyphen
func sanitizeInput(input string) string {
	re := regexp.MustCompile("[^a-zA-Z0-9_]+")
	return re.ReplaceAllString(input, "-")
}

// Writes the Analyzer TOML data to the file
func (a *AnalyzerInitOpts) writeAnalyzerTOMLConfig(buf *bytes.Buffer) (err error) {
	// Create the .deepsource/analyzer directory and issues/ directory
	directoriesToCreate := []string{".deepsource", ".deepsource/analyzer", ".deepsource/analyzer/issues/"}

	// Create the required directories mentioned above
	for _, dir := range directoriesToCreate {
		if _, err := os.Stat(filepath.Join(a.ProjectRootPath, dir)); errors.Is(err, os.ErrNotExist) {
			if err = os.Mkdir(filepath.Join(a.ProjectRootPath, dir), 0o750); err != nil {
				return err
			}
		}
	}

	// Write the input data to analyzer.toml
	if err = os.WriteFile(a.AnalyzerTOMLPath, buf.Bytes(), 0o750); err != nil {
		return err
	}
	return
}
