package repo

import (
	"github.com/spf13/cobra"

	"github.com/deepsourcelabs/cli/command/repo/status"
	"github.com/deepsourcelabs/cli/command/repo/view"
)

// Options holds the metadata.
type Options struct{}

// NewCmdRepo returns the command for repository operations
func NewCmdRepo() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "repo",
		Short: "Manage repository settings",
	}
	cmd.AddCommand(status.NewCmdRepoStatus())
	cmd.AddCommand(view.NewCmdRepoView())
	return cmd
}
