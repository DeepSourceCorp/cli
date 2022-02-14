package utils

import (
	"fmt"
	"net/url"
	"os/exec"
	"regexp"
	"strings"
)

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

	// Iterating over the remotes to parse values
	for _, remoteData := range remoteList {

		var VCSProvider string

		// Split the single remote to fetch the name of the remote
		// TLDR; Fetch "origin" from "origin <url>"
		remoteParams := strings.Split(remoteData, "\t")
		remoteName := remoteParams[0]

		// Making the argument for the upcoming command to fetch remote url
		urlCmdString := fmt.Sprintf("remote.%s.url", remoteParams[0])

		// Fetch the remote URL using the command "git config --get --local remote.<remote-name>.url"
		rUrl, err := runCmd("git", []string{"config", "--get", "--local", "--null", urlCmdString})
		if err != nil {
			return remoteMap, err
		}
		remoteURL := string(rUrl)

		// Parsing out VCS Provider from the remote URL
		if strings.Contains(remoteURL, "github") {
			VCSProvider = "GITHUB"
		} else if strings.Contains(remoteURL, "gitlab") {
			VCSProvider = "GITLAB"
		} else if strings.Contains(remoteURL, "bitbucket") {
			VCSProvider = "BITBUCKET"
		} else {
			continue
		}

		var RepoNameRegexp = regexp.MustCompile(`.+/([^/]+)(\.git)?$`)

		// Parsing out repository name from the remote URL using the above regex
		matched := RepoNameRegexp.FindStringSubmatch(remoteURL)
		repositoryName := strings.TrimSuffix(matched[1], ".git")

		var owner string

		// git@ ssh urls
		if strings.HasPrefix(remoteURL, "git@") {
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

		// owner, err := runCmd("git", []string{"config", "--get", "--null", "user.name"})
		// if err != nil {
		//     continue
		// }

		completeRepositoryName := fmt.Sprintf("%s/%s", owner, repositoryName)
		remoteMap[remoteName] = []string{owner, repositoryName, VCSProvider, completeRepositoryName}
	}

	return remoteMap, nil
}

func runCmd(command string, args []string) (string, error) {

	output, err := exec.Command(command, args...).Output()
	if err != nil {
		return "", err
	}

	// Removing trailing null characters
	return strings.TrimRight(string(output), "\000"), nil

}
