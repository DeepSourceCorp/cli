package status

import (
	"github.com/deepsourcelabs/cli/global"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

type AuthStatusOptions struct {
	User          string
	TokenExpired  bool
	Authenticated bool
}

// NewCmdVersion returns the current version of cli being used
func NewCmdStatus() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "status",
		Short: "View the authentication status",
		Args:  utils.NoArgs,
		Run: func(cmd *cobra.Command, args []string) {
			opts := AuthStatusOptions{
				User:          global.User,
				TokenExpired:  global.TokenExpired,
				Authenticated: false,
			}
			opts.Run()
		},
	}
	return cmd
}

func (opts *AuthStatusOptions) Run() {

	if opts.TokenExpired == false {
		opts.Authenticated = true

		pterm.Success.Printf("Logged in to DeepSource (deepsource.io) as %s\n", opts.User)
	} else {
		pterm.Error.Println("You are not logged into DeepSource. Run \"deepsource auth login\" to authenticate.")
	}

}
