package status

import (
	"context"
	"errors"
	"strings"

	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

type RepoStatusOptions struct {
	RepoArg      string
	TokenExpired bool
	Owner        string
	RepoName     string
	VCSProvider  string
}

// NewCmdVersion returns the current version of cli being used
func NewCmdRepoStatus() *cobra.Command {

	opts := RepoStatusOptions{
		RepoArg:      "",
		TokenExpired: config.TokenExpired,
		Owner:        "",
		RepoName:     "",
		VCSProvider:  "",
	}

	cmd := &cobra.Command{
		Use:   "status",
		Short: "Refresh stored authentication credentials",
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
	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "Get the activation status of the specified repository")
	return cmd
}

func (opts *RepoStatusOptions) Run() error {
	// extract the repo URL whose status has to be found
	err := opts.extractRepositoryRemotes()
	if err != nil {
		return err
	}

	// Use the SDK to find the activation status
	deepsource := deepsource.New()
	ctx := context.Background()
	statusResponse, err := deepsource.GetRepoStatus(ctx, opts.Owner, opts.RepoName, opts.VCSProvider)
	if err != nil {
		return err
	}

	// Check response and show corresponding output
	if statusResponse.Activated {
		pterm.Info.Println("Analysis active on DeepSource (deepsource.io)")
	} else {
		pterm.Info.Println("DeepSource analysis is currently not actived on this repository.")
	}
	return nil
}

// Extracts various remotes (origin/upstream etc.) present in a certain repository's .git config file
// Helps in deciding the repo for which activation status has to be found
func (opts *RepoStatusOptions) extractRepositoryRemotes() error {
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
