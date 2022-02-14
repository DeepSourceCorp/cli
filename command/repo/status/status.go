package status

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

type RepoStatusOptions struct {
	RepoArg        string
	TokenExpired   bool
	SelectedRemote *utils.RemoteData
}

// NewCmdRepoStatus handles querying the activation status of the repo supplied as an arg
func NewCmdRepoStatus() *cobra.Command {

	opts := RepoStatusOptions{
		RepoArg:      "",
		TokenExpired: config.Cfg.IsExpired(),
	}

	cmd := &cobra.Command{
		Use:   "status",
		Short: "Refresh stored authentication credentials",
		Args:  utils.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			return opts.Run()
		},
	}

	// --repo, -r flag
	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "Get the activation status of the specified repository")
	return cmd
}

func (opts *RepoStatusOptions) Run() (err error) {
	// Fetch config
	cfg, err := config.GetConfig()
	if err != nil {
		return fmt.Errorf("Error while reading DeepSource CLI config : %v", err)
	}
	err = cfg.VerifyAuthentication()
	if err != nil {
		return err
	}

	// Get the remote repository URL for which issues have to
	// be listed
	opts.SelectedRemote, err = utils.ResolveRemote(opts.RepoArg)
	if err != nil {
		return err
	}
	// Use the SDK to find the activation status
	deepsource, err := deepsource.New(deepsource.ClientOpts{
		Token:    config.Cfg.Token,
		HostName: config.Cfg.Host,
	})
	if err != nil {
		return err
	}
	ctx := context.Background()
	statusResponse, err := deepsource.GetRepoStatus(ctx, opts.SelectedRemote.Owner, opts.SelectedRemote.RepoName, opts.SelectedRemote.VCSProvider)
	if err != nil {
		return err
	}

	// Check response and show corresponding output
	if statusResponse.Activated {
		pterm.Info.Println("Analysis active on DeepSource (deepsource.io)")
	} else {
		pterm.Info.Println("DeepSource analysis is currently not activated on this repository.")
	}
	return nil
}
