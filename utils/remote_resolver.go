package utils

import (
	"fmt"
	"strings"
)

type RemoteData struct {
	Owner       string
	RepoName    string
	VCSProvider string
}

func ResolveRemote(repoArg string) (*RemoteData, error) {
	var remote RemoteData

	// If the user supplied a --repo flag with the repo URL
	if repoArg != "" {
		repoData, err := RepoArgumentResolver(repoArg)
		if err != nil {
			return nil, err
		}
		remote.VCSProvider = repoData[0]
		remote.Owner = repoData[1]
		remote.RepoName = repoData[2]
		return &remote, nil
	}

	// If the user didn't pass --repo flag
	// Figure out list of remotes by reading git config
	remotesData, err := ListRemotes()
	if err != nil {
		if strings.Contains(err.Error(), "exit status 128") {
			fmt.Println("This repository has not been initialized with git. Please initialize it with git using `git init`")
		}
		return nil, err
	}

	// If there is only one remote, use it
	if len(remotesData) == 1 {
		for _, value := range remotesData {
			remote.Owner = value[0]
			remote.RepoName = value[1]
			remote.VCSProvider = value[2]
		}
		return &remote, nil
	}

	// If there are more than one remotes, give the option to user
	// to select the one which they want
	var promptOpts []string
	// Preparing the options to show to the user
	for _, value := range remotesData {
		promptOpts = append(promptOpts, value[3])
	}

	selectedRemote, err := SelectFromOptions("Please select the repository:", "", promptOpts)
	if err != nil {
		return nil, err
	}

	// Matching the list of remotes with the one selected by user
	for _, value := range remotesData {
		if value[3] == selectedRemote {
			remote.Owner = value[0]
			remote.RepoName = value[1]
			remote.VCSProvider = value[2]
		}
	}
	return &remote, nil
}

// Utility to parse the --repo flag
func RepoArgumentResolver(arg string) ([]string, error) {

	// github.com/deepsourcelabs/cli or gh/deepsourcelabs/cli

	argComponents := strings.Split(arg, "/")

	switch argComponents[0] {
	case "gh", "github.com":
		argComponents[0] = "GITHUB"

	case "gl", "gitlab.com":
		argComponents[0] = "GITLAB"

	case "bb", "bitbucket.com":
		argComponents[0] = "BITBUCKET"
	default:
		return argComponents, fmt.Errorf("VCSProvider `%s` not supported", argComponents[0])
	}

	return argComponents, nil
}
