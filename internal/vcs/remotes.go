package vcs

import (
	"fmt"
	"net/url"
	"os/exec"
	"regexp"
	"strings"

	"github.com/deepsourcelabs/cli/internal/debug"
)

func detectProvider(remoteURL string) string {
	switch {
	case strings.Contains(remoteURL, "github"):
		return "GITHUB"
	case strings.Contains(remoteURL, "gitlab"):
		return "GITLAB"
	case strings.Contains(remoteURL, "bitbucket"):
		return "BITBUCKET"
	case strings.Contains(remoteURL, "dev.azure.com"), strings.Contains(remoteURL, "visualstudio.com"):
		return "ADS"
	default:
		return ""
	}
}

func extractRepoName(remoteURL string) string {
	repoNameRegexp := regexp.MustCompile(`.+/([^/]+)(\.git)?$`)
	matched := repoNameRegexp.FindStringSubmatch(remoteURL)
	return strings.TrimSuffix(matched[1], ".git")
}

func extractOwner(remoteURL, provider string) string {
	if provider == "ADS" {
		return extractADSOwner(remoteURL)
	}
	if strings.HasPrefix(remoteURL, "git@") {
		pathURL := strings.Split(remoteURL, ":")
		u, err := url.Parse(pathURL[1])
		if err != nil {
			return ""
		}
		splitPath := strings.Split(u.Path, "/")
		return splitPath[0]
	}
	if strings.HasPrefix(remoteURL, "https://") {
		remoteRegexp := regexp.MustCompile(`.+//(.+)/(.+)/(.+)(\.git)?$`)
		matched := remoteRegexp.FindStringSubmatch(remoteURL)
		return matched[2]
	}
	return ""
}

func extractADSOwner(remoteURL string) string {
	if strings.HasPrefix(remoteURL, "https://") {
		u, err := url.Parse(remoteURL)
		if err != nil {
			return ""
		}
		if strings.Contains(remoteURL, "dev.azure.com") {
			splitPath := strings.Split(strings.Trim(u.Path, "/"), "/")
			if len(splitPath) > 0 {
				return splitPath[0]
			}
		} else if strings.Contains(remoteURL, "visualstudio.com") {
			hostParts := strings.Split(u.Hostname(), ".")
			if len(hostParts) > 0 {
				return hostParts[0]
			}
		}
		return ""
	}
	// SSH variants:
	// git@ssh.dev.azure.com:v3/{org}/{project}/{repo}
	// {org}@vs-ssh.visualstudio.com:v3/{org}/{project}/{repo}
	pathURL := strings.Split(remoteURL, ":")
	if len(pathURL) > 1 {
		splitPath := strings.Split(pathURL[1], "/")
		if len(splitPath) > 1 {
			return splitPath[1]
		}
	}
	return ""
}

func getRemoteMap(remoteList []string) (map[string][]string, error) {
	remoteMap := make(map[string][]string)
	for _, remoteData := range remoteList {
		remoteParams := strings.Fields(remoteData)
		remoteName := remoteParams[0]
		remoteURL := remoteParams[1]

		provider := detectProvider(remoteURL)
		if provider == "" {
			continue
		}

		repoName := extractRepoName(remoteURL)
		owner := extractOwner(remoteURL, provider)

		completeRepositoryName := fmt.Sprintf("%s/%s", owner, repoName)
		remoteMap[remoteName] = []string{owner, repoName, provider, completeRepositoryName}
	}

	return remoteMap, nil
}

// 1. Run git remote -v
// 2. Parse the output and get the list of remotes
// 3. Do git config --get --local remote.<remote-name>.url
// 4. Parse the urls to filter out reponame,owner,provider
// 5. Send them back

// Returns a map of remotes to their urls
// { "origin":["reponame","owner","provider"]}
// { "upstream":["reponame","owner","provider"]}
func ListRemotes() (map[string][]string, error) {
	remoteMap := make(map[string][]string)

	remotes, err := runCmd("git", []string{"remote", "-v"})
	if err != nil {
		return remoteMap, err
	}

	// Split the remotes into single remote array
	remoteList := strings.Split(string(remotes), "\n")

	if len(remoteList) <= 1 {
		return remoteMap, fmt.Errorf("No remotes found")
	}

	// Removing the last blank element
	remoteList = remoteList[:len(remoteList)-1]

	// Get remote map
	remoteMap, err = getRemoteMap(remoteList)
	if err != nil {
		return remoteMap, err
	}

	return remoteMap, nil
}

func runCmd(command string, args []string) (string, error) {
	debug.Log("git: exec %s %s", command, strings.Join(args, " "))
	output, err := exec.Command(command, args...).Output()
	if err != nil {
		debug.Log("git: exec failed: %v", err)
		return "", err
	}

	result := strings.TrimRight(string(output), "\000")
	debug.Log("git: exec ok (%d bytes)", len(result))
	return result, nil
}
