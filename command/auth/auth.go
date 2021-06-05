package auth

import (
	"github.com/spf13/cobra"

	"github.com/deepsourcelabs/cli/command/auth/login"
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
    }
	return cmd
}

// Validate impletments the Validate method for the ICommand interface.
func (Options) Validate() error {
	return nil
}
