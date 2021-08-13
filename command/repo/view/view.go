package view

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/cli/browser"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/spf13/cobra"
)

type RepoViewOptions struct {
	RepoArg      string
	TokenExpired bool
	Owner        string
	RepoName     string
	VCSProvider  string
}

func NewCmdRepoView() *cobra.Command {

	opts := RepoViewOptions{
		RepoArg:      "",
		TokenExpired: config.Cfg.IsExpired(),
		Owner:        "",
		RepoName:     "",
		VCSProvider:  "",
	}

	cmd := &cobra.Command{
		Use:   "view",
		Short: "Open the DeepSource dashboard of a repository",
		Args:  utils.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			err := opts.Run()
			if err != nil {
				return err
			}
			return nil
		},
	}

	// --repo, -r flag
	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "Open the DeepSource dashboard of the specified repository")
	return cmd
}

func (opts *RepoViewOptions) Run() error {
	// extract the repo URL
	err := opts.extractRepositoryRemotes()
	if err != nil {
		return err
	}

	// Making the "isActivated" (repo status) query again just to confirm if the user has access to that repo
	deepsource := deepsource.New()
	ctx := context.Background()
	_, err = deepsource.GetRepoStatus(ctx, opts.Owner, opts.RepoName, opts.VCSProvider)
	if err != nil {
		if strings.Contains(err.Error(), "Signature has expired") {
			return errors.New("The token has expired. Please refresh the token using the command `deepsource auth refresh`")
		}

		if strings.Contains(err.Error(), "Repository matching query does not exist") {
			return errors.New("Unauthorized access. Please login if you haven't using the command `deepsource auth login`")
		}
	}

	// If the user has access to repo, frame the full URL of the repo and open it on the
	// default browser
	var vcs string

	// Extracting VCS name for the URL
	switch opts.VCSProvider {
	case "GITHUB":
		vcs = "gh"
	case "GITLAB":
		vcs = "gl"
	case "BITBUCKET":
		vcs = "bb"
	}

	// Framing the complete URL
	dashboardURL := fmt.Sprintf("https://deepsource.io/%s/%s/%s/", vcs, opts.Owner, opts.RepoName)
	fmt.Printf("Press enter to open %s in your browser...", dashboardURL)
	fmt.Scanln()
	err = browser.OpenURL(dashboardURL)
	if err != nil {
		return err
	}

	return nil
}

// Extracts various remotes (origin/upstream etc.) present in a certain repository's .git config file
// Helps in deciding the repo for which activation status has to be found
func (opts *RepoViewOptions) extractRepositoryRemotes() error {
	// Case: If the user didn't pass a certain repository for which they want to check the
	// activation status
	if opts.RepoArg == "" {
		// List remotes
		remotesData, err := utils.ListRemotes()
		if err != nil {
			if strings.Contains(err.Error(), "exit status 128") {
				return errors.New("This repository has not been initialized with git. Please initialize it with git using `git init`")
			}
		}

		// Condition: If only 1 remote, use it
		// If more that one remote, give the user choice which one they want to choose
		if len(remotesData) == 1 {
			for _, value := range remotesData {
				opts.Owner = value[0]
				opts.RepoName = value[1]
				opts.VCSProvider = value[2]
			}
		} else {
			var promptOpts []string
			for _, value := range remotesData {
				promptOpts = append(promptOpts, value[3])
			}

			// Show the option to user which repo's activation status they want to check
			selectedRemote, err := utils.SelectFromOptions("Please select which repository you want to check?", "", promptOpts)
			if err != nil {
				return err
			}

			// Iterate over the list and match with the response to find the
			// target remote
			for _, value := range remotesData {
				if value[3] == selectedRemote {
					opts.Owner = value[0]
					opts.RepoName = value[1]
					opts.VCSProvider = value[2]
				}
			}
		}
	} else {
		// Case: The user passed the repository for which they want to check the
		// activation status using the --repo flag

		// Parsing the arguments to --repo flag
		repoData, err := utils.RepoArgumentResolver(opts.RepoArg)
		if err != nil {
			return err
		}
		opts.VCSProvider = repoData[0]
		opts.Owner = repoData[1]
		opts.RepoName = repoData[2]
	}
	return nil
}
