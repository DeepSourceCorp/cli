package repo

import (
	"github.com/spf13/cobra"

	"github.com/deepsourcelabs/cli/command/repo/status"
	"github.com/deepsourcelabs/cli/command/repo/view"
)

// Options holds the metadata.
type Options struct{}

// NewCmdVersion returns the current version of cli being used
func NewCmdRepo() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "repo",
		Short: "Operations related to the project repository",
	}
	cmd.AddCommand(status.NewCmdRepoStatus())
	cmd.AddCommand(view.NewCmdRepoView())
	return cmd
}

// Validate impletments the Validate method for the ICommand interface.
func (Options) Validate() error {
	return nil
}
