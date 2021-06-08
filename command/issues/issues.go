package issues

import (
	"github.com/spf13/cobra"

	"github.com/deepsourcelabs/cli/cmdutils"
	"github.com/deepsourcelabs/cli/command/issues/list"
)

// Options holds the metadata.
type Options struct{}

// NewCmdVersion returns the current version of cli being used
func NewCmdIssues(cmdFactory *cmdutils.CLIFactory) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "issues",
		Short: "Show the list of issues in a file in a repository",
	}
	cmd.AddCommand(list.NewCmdIssuesList(cmdFactory))
	return cmd
}

// Validate impletments the Validate method for the ICommand interface.
func (Options) Validate() error {
	return nil
}
