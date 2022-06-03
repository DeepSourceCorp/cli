package initialize

import (
	"os/exec"
	"regexp"
	"strings"
)

func processAnalyzerTags(userInput string) []string {
	re := regexp.MustCompile("[ ,]")
	return re.Split(userInput, -1)
}

func fetchRemoteURL() (string, error) {
	// TODO: Add support for fetching URLs for other remotes here as well
	remoteURL, err := exec.Command("git", "config", "--get", "remote.origin.url").Output()
	if err != nil {
		return "", err
	}
	return strings.TrimRight(string(remoteURL), "\000"), nil
}

// Returns the list of supported SDKs
// TODO: Send the list of supported SDKs from here once we start supporting any
func getSupportedSDKs() []string {
	return []string{""}
}

