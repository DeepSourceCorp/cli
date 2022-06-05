package initialize

import (
	"fmt"
	"os/exec"
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
	fmt.Println("here")

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
