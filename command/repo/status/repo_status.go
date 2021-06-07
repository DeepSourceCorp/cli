package status

import (
	"fmt"
	"strings"

	"github.com/deepsourcelabs/cli/api"
	"github.com/deepsourcelabs/cli/cmdutils"
	cliConfig "github.com/deepsourcelabs/cli/internal/config"
	"github.com/spf13/cobra"
)

type RepoStatusOptions struct {
	graphqlClient *api.DSClient
	RepoArg       string
	Config        cliConfig.ConfigData
	TokenExpired  bool
	Owner         string
	RepoName      string
	VCSProvider   string
}

// NewCmdVersion returns the current version of cli being used
func NewCmdRepoStatus(cf *cmdutils.CLIFactory) *cobra.Command {

	opts := RepoStatusOptions{
		graphqlClient: cf.GQLClient,
		RepoArg:       "",
		Config:        cf.Config,
		TokenExpired:  cf.TokenExpired,
		Owner:         "",
		RepoName:      "",
		VCSProvider:   "",
	}

	cmd := &cobra.Command{
		Use:   "status",
		Short: "Refresh stored authentication credentials",
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

	if opts.RepoArg == "" {

		remotesData, err := cmdutils.ListRemotes()
		if err != nil {
			if strings.Contains(err.Error(), "exit status 128") {
				fmt.Println("This repository has not been initialized with git. Please initialize it with git using `git init`")
			}
			return err
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

			selectedRemote, err := cmdutils.SelectFromOptions("Please select which repository you want to check?", "", promptOpts)
			if err != nil {
				return err
			}

			for _, value := range remotesData {
				if value[3] == selectedRemote {
					opts.Owner = value[0]
					opts.RepoName = value[1]
					opts.VCSProvider = value[2]
				}
			}
		}
	} else {

		// Parsing the arguments to --repo flag
		repoData, err := cmdutils.RepoArgumentResolver(opts.RepoArg)
		if err != nil {
			return err
		}

		opts.VCSProvider = repoData[0]
		opts.Owner = repoData[1]
		opts.RepoName = repoData[2]
	}

	// Send the isActivated graphQL request

	activationStatus, err := api.GetRepoStatus(opts.graphqlClient, opts.Owner, opts.RepoName, opts.VCSProvider)
	if err != nil {
		return err
	}

	if activationStatus == true {
		fmt.Println("Analysis active.")
	} else {
		fmt.Println("Analysis is currently not actived on this repository.")
	}

	return nil

}
