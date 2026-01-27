package runs

import (
	"github.com/spf13/cobra"

	"github.com/deepsourcelabs/cli/command/runs/issues"
	"github.com/deepsourcelabs/cli/command/runs/list"
)

// Options holds the metadata.
type Options struct{}

// NewCmdRuns returns the runs command
func NewCmdRuns() *cobra.Command {
	opts := issues.IssuesOptions{}
	cmd := &cobra.Command{
		Use:   "runs [commit-oid]",
		Short: "View analysis runs for a repository",
		Args:  cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			if len(args) == 0 {
				return cmd.Help()
			}
			return opts.RunWithCommit(cmd.Context(), args[0])
		},
	}
	issues.AddRunIssueFlags(cmd, &opts)
	cmd.AddCommand(list.NewCmdRunsList())
	return cmd
}
