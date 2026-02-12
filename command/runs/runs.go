package runs

import (
	"github.com/MakeNowJust/heredoc"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	"github.com/spf13/cobra"

	"github.com/deepsourcelabs/cli/command/runs/issues"
	"github.com/deepsourcelabs/cli/command/runs/list"
)

// NewCmdRuns returns the runs command
func NewCmdRuns() *cobra.Command {
	opts := issues.IssuesOptions{}

	doc := heredoc.Docf(`
		View analysis runs for a repository.

		When called with a commit OID, shows the issues in that run:
		  %[1]s

		Use %[2]s to list recent runs:
		  %[3]s

		Use %[4]s to view issues in a specific run:
		  %[5]s
		`,
		style.Cyan("deepsource runs abc123f"),
		style.Yellow("list"),
		style.Cyan("deepsource runs list"),
		style.Yellow("issues"),
		style.Cyan("deepsource runs issues abc123f"),
	)

	cmd := &cobra.Command{
		Use:   "runs [commit-oid]",
		Short: "View analysis runs",
		Long:  doc,
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
	cmd.AddCommand(issues.NewCmdRunsIssues())
	return cmd
}
