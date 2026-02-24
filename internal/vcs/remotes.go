package vcs

import (
	"fmt"
	"net/url"
	"os/exec"
	"regexp"
	"strings"

	"github.com/deepsourcelabs/cli/internal/debug"
)

func getRemoteMap(remoteList []string) (map[string][]string, error) {
	remoteMap := make(map[string][]string)
	for _, remoteData := range remoteList {

		var VCSProvider string

		// Split the single remote to fetch the name and URL of the remote
		// TLDR; Fetch "origin" and "<url>" from "origin <url>"
		remoteParams := strings.Fields(remoteData)
		remoteName := remoteParams[0]
		remoteURL := remoteParams[1]

		// Parsing out VCS Provider from the remote URL
		if strings.Contains(remoteURL, "github") {
			VCSProvider = "GITHUB"
		} else if strings.Contains(remoteURL, "gitlab") {
			VCSProvider = "GITLAB"
		} else if strings.Contains(remoteURL, "bitbucket") {
			VCSProvider = "BITBUCKET"
		} else if strings.Contains(remoteURL, "dev.azure.com") || strings.Contains(remoteURL, "visualstudio.com") {
			VCSProvider = "ADS"
		} else {
			continue
		}

		RepoNameRegexp := regexp.MustCompile(`.+/([^/]+)(\.git)?$`)

		// Parsing out repository name from the remote URL using the above regex
		matched := RepoNameRegexp.FindStringSubmatch(remoteURL)
		repositoryName := strings.TrimSuffix(matched[1], ".git")

		var owner string

		if VCSProvider == "ADS" {
			// Azure DevOps has non-standard URL structures that need special handling
			if strings.HasPrefix(remoteURL, "https://") {
				u, err := url.Parse(remoteURL)
				if err != nil {
					continue
				}
				if strings.Contains(remoteURL, "dev.azure.com") {
					// https://dev.azure.com/{org}/{project}/_git/{repo}
					splitPath := strings.Split(strings.Trim(u.Path, "/"), "/")
					if len(splitPath) > 0 {
						owner = splitPath[0]
					}
				} else if strings.Contains(remoteURL, "visualstudio.com") {
					// https://{org}.visualstudio.com/{project}/_git/{repo}
					hostParts := strings.Split(u.Hostname(), ".")
					if len(hostParts) > 0 {
						owner = hostParts[0]
					}
				}
			} else {
				// SSH variants:
				// git@ssh.dev.azure.com:v3/{org}/{project}/{repo}
				// {org}@vs-ssh.visualstudio.com:v3/{org}/{project}/{repo}
				pathURL := strings.Split(remoteURL, ":")
				if len(pathURL) > 1 {
					splitPath := strings.Split(pathURL[1], "/")
					// path starts with v3/{org}/...
					if len(splitPath) > 1 {
						owner = splitPath[1]
					}
				}
			}
		} else if strings.HasPrefix(remoteURL, "git@") {
			// git@ ssh urls
			pathURL := strings.Split(remoteURL, ":")
			newPathURL := pathURL[1]
			u, err := url.Parse(newPathURL)
			if err != nil {
				continue
			}
			splitPath := strings.Split(u.Path, "/")
			owner = splitPath[0]
		} else if strings.HasPrefix(remoteURL, "https://") {
			remoteRegexp := regexp.MustCompile(`.+//(.+)/(.+)/(.+)(\.git)?$`)
			matched := remoteRegexp.FindStringSubmatch(remoteURL)
			owner = matched[2]
		}

		completeRepositoryName := fmt.Sprintf("%s/%s", owner, repositoryName)
		remoteMap[remoteName] = []string{owner, repositoryName, VCSProvider, completeRepositoryName}
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
