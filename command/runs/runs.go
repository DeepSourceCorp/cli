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
	cmd := &cobra.Command{
		Use:   "runs",
		Short: "View analysis runs for a repository",
	}
	cmd.AddCommand(list.NewCmdRunsList())
	cmd.AddCommand(issues.NewCmdRunsIssues())
	return cmd
}
