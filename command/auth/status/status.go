package status

import (
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

type AuthStatusOptions struct {
	User         string
	Token        string
	TokenExpired bool
}

// NewCmdStatus handles the fetching of authentication status of CLI
func NewCmdStatus() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "status",
		Short: "View the authentication status",
		Args:  utils.NoArgs,
		Run: func(cmd *cobra.Command, args []string) {
			opts := AuthStatusOptions{
				User:         config.Cfg.User,
				Token:        config.Cfg.Token,
				TokenExpired: config.Cfg.IsExpired(),
			}
			opts.Run()
		},
	}
	return cmd
}

func (opts *AuthStatusOptions) Run() {
	// Check if the user is logged in
	if opts.Token == "" {
		pterm.Info.Println("You are not logged into DeepSource. Run \"deepsource auth login\" to authenticate.")
		return
	}

	// Check if the token has already expired
	if !opts.TokenExpired {
		pterm.Info.Printf("Logged in to DeepSource (deepsource.io) as %s\n", opts.User)
	} else {
		pterm.Info.Println("The authentication has expired. Run \"deepsource auth refresh\" to refresh the credentials.")
	}
}
