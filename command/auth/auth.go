package auth

import (
	"github.com/spf13/cobra"

	"github.com/deepsourcelabs/cli/command/auth/login"
	"github.com/deepsourcelabs/cli/command/auth/logout"
	"github.com/deepsourcelabs/cli/command/auth/refresh"
	"github.com/deepsourcelabs/cli/command/auth/status"
)

// Options holds the metadata.
type Options struct{}

// NewCmdVersion returns the current version of cli being used
func NewCmdAuth() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "auth",
		Short: "Authenticate with DeepSource",
	}
	cmd.AddCommand(login.NewCmdLogin())
	cmd.AddCommand(logout.NewCmdLogout())
	cmd.AddCommand(refresh.NewCmdRefresh())
	cmd.AddCommand(status.NewCmdStatus())
	return cmd
}

// Validate impletments the Validate method for the ICommand interface.
func (Options) Validate() error {
	return nil
}
