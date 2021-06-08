package status

import (
	"github.com/deepsourcelabs/cli/cmdutils"
	cliConfig "github.com/deepsourcelabs/cli/internal/config"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

type AuthStatusOptions struct {
	TokenExpired  bool
	Authenticated bool
	Config        cliConfig.ConfigData
}

// NewCmdVersion returns the current version of cli being used
func NewCmdStatus(cf *cmdutils.CLIFactory) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "status",
		Short: "View the authentication status",
		Run: func(cmd *cobra.Command, args []string) {
			opts := AuthStatusOptions{
				TokenExpired:  cf.TokenExpired,
				Authenticated: false,
				Config:        cf.Config,
			}
			opts.Run()
		},
	}
	return cmd
}

func (opts *AuthStatusOptions) Run() {

	if opts.TokenExpired == false {
		opts.Authenticated = true

		pterm.Success.Printf("Logged in to DeepSource (deepsource.io) as %s\n", opts.Config.User)
	} else {
		pterm.Error.Println("You are not logged into DeepSource. Run \"deepsource auth login\" to authenticate.")
	}

}
