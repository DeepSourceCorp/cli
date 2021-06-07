package repo

import (
	"github.com/spf13/cobra"

	"github.com/deepsourcelabs/cli/cmdutils"
	"github.com/deepsourcelabs/cli/command/repo/status"
	"github.com/deepsourcelabs/cli/command/repo/view"
)

// Options holds the metadata.
type Options struct{}

// NewCmdVersion returns the current version of cli being used
func NewCmdRepo(cmdFactory *cmdutils.CLIFactory) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "repo",
		Short: "Operations related to the project repository",
	}
	cmd.AddCommand(status.NewCmdRepoStatus(cmdFactory))
	cmd.AddCommand(view.NewCmdRepoView(cmdFactory))
	return cmd
}

// Validate impletments the Validate method for the ICommand interface.
func (Options) Validate() error {
	return nil
}
