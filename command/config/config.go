package config

import (
	"github.com/deepsourcelabs/cli/command/config/validate"
	"github.com/spf13/cobra"
)

// Options holds the metadata.
type Options struct{}

// NewCmdVersion returns the current version of cli being used
func NewCmdConfig() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "config <command>",
		Short: "Generate and Validate DeepSource config",
	}
	cmd.AddCommand(validate.NewCmdValidate())

	return cmd
}

// Validate impletments the Validate method for the ICommand interface.
func (Options) Validate() error {
	return nil
}
