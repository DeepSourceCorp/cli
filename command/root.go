package command

import (
	"context"
	"os"

	"github.com/deepsourcelabs/cli/command/auth"
	"github.com/deepsourcelabs/cli/command/config"
	"github.com/deepsourcelabs/cli/command/issues"
	"github.com/deepsourcelabs/cli/command/repo"
	"github.com/deepsourcelabs/cli/command/report"
	"github.com/deepsourcelabs/cli/command/runs"
	"github.com/deepsourcelabs/cli/command/version"
	"github.com/spf13/cobra"
)

func NewCmdRoot() *cobra.Command {
	var verbose bool
	var quiet bool

	cmd := &cobra.Command{
		Use:   "deepsource <command> <subcommand> [flags]",
		Short: "DeepSource CLI",
		Long: `Welcome to DeepSource CLI
Now ship good code directly from the command line.

Login into DeepSource using the command : deepsource auth login`,
		SilenceErrors: true,
		SilenceUsage:  true,
		PersistentPreRun: func(cmd *cobra.Command, args []string) {
		if quiet {
			_ = os.Setenv("DEEPSOURCE_CLI_QUIET", "1")
		}
		if verbose && !quiet {
			_ = os.Setenv("DEEPSOURCE_CLI_DEBUG", "1")
		}
	},
}

	cmd.PersistentFlags().BoolVar(&verbose, "verbose", false, "Enable verbose diagnostics")
	cmd.PersistentFlags().BoolVar(&quiet, "quiet", false, "Suppress non-error output")

	// Child Commands
	cmd.AddCommand(version.NewCmdVersion())
	cmd.AddCommand(config.NewCmdConfig())
	cmd.AddCommand(auth.NewCmdAuth())
	cmd.AddCommand(repo.NewCmdRepo())
	cmd.AddCommand(issues.NewCmdIssues())
	cmd.AddCommand(runs.NewCmdRuns())
	cmd.AddCommand(report.NewCmdReport())

	return cmd
}

func Execute() error {
	return ExecuteContext(context.Background())
}

// ExecuteContext runs the root command with a parent context.
func ExecuteContext(ctx context.Context) error {
	cmd := NewCmdRoot()
	cmd.SetContext(ctx)
	return cmd.Execute()
}
