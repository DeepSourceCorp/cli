package auth

import (
	"github.com/spf13/cobra"

	"github.com/deepsourcelabs/cli/cmdutils"
	"github.com/deepsourcelabs/cli/command/auth/login"
	"github.com/deepsourcelabs/cli/command/auth/logout"
	"github.com/deepsourcelabs/cli/command/auth/refresh"
)

// Options holds the metadata.
type Options struct{}

// NewCmdVersion returns the current version of cli being used
func NewCmdAuth(cmdFactory *cmdutils.CLIFactory) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "auth",
		Short: "Authenticate with DeepSource",
	}
	cmd.AddCommand(login.NewCmdLogin(cmdFactory))
	cmd.AddCommand(logout.NewCmdLogout(cmdFactory))
	cmd.AddCommand(refresh.NewCmdRefresh(cmdFactory))
	return cmd
}

// Validate impletments the Validate method for the ICommand interface.
func (Options) Validate() error {
	return nil
}
