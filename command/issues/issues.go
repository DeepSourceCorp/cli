package issues

import (
	"github.com/spf13/cobra"

	"github.com/deepsourcelabs/cli/command/issues/list"
	"github.com/deepsourcelabs/cli/command/issues/validate"
)

// Options holds the metadata.
type Options struct{}

// NewCmdVersion returns the current version of cli being used
func NewCmdIssues() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "issues",
		Short: "Show the list of issues in a file in a repository",
	}
	cmd.AddCommand(list.NewCmdIssuesList())
	cmd.AddCommand(validate.NewCmdValidateSecrets())
	return cmd
}
