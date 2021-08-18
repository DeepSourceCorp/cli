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

var VCSMap = map[string]string{
	"GITHUB":    "gh",
	"GITLAB":    "gl",
	"BITBUCKET": "bb",
}

type RepoViewOptions struct {
	RepoArg        string
	TokenExpired   bool
	SelectedRemote *utils.RemoteData
}

func NewCmdRepoView() *cobra.Command {

	opts := RepoViewOptions{
		RepoArg:        "",
		TokenExpired:   config.Cfg.IsExpired(),
		SelectedRemote: &utils.RemoteData{},
	}

	cmd := &cobra.Command{
		Use:   "view",
		Short: "Open the DeepSource dashboard of a repository",
		Args:  utils.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			return opts.Run()
		},
	}

	// --repo, -r flag
	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "Open the DeepSource dashboard of the specified repository")
	return cmd
}

func (opts *RepoViewOptions) Run() error {
	var err error
	// Get the remote repository URL for which issues have to
	// be listed
	opts.SelectedRemote, err = utils.ResolveRemote(opts.RepoArg)
	if err != nil {
		return err
	}

	// Making the "isActivated" (repo status) query again just to confirm if the user has access to that repo
	deepsource := deepsource.New()
	ctx := context.Background()
	_, err = deepsource.GetRepoStatus(ctx, opts.SelectedRemote.Owner, opts.SelectedRemote.RepoName, opts.SelectedRemote.VCSProvider)
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
	VCSShortcode := VCSMap[opts.SelectedRemote.VCSProvider]

	// Framing the complete URL
	dashboardURL := fmt.Sprintf("%s/%s/%s/%s/", config.Cfg.Host, VCSShortcode, opts.SelectedRemote.Owner, opts.SelectedRemote.RepoName)
	fmt.Printf("Press enter to open %s in your browser...", dashboardURL)
	fmt.Scanln()
	return browser.OpenURL(dashboardURL)
}
