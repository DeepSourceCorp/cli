package command

import (
	"context"
	"fmt"
	"os"

	"github.com/deepsourcelabs/cli/buildinfo"
	"github.com/deepsourcelabs/cli/command/auth"
	"github.com/deepsourcelabs/cli/command/issues"
	"github.com/deepsourcelabs/cli/command/metrics"
	"github.com/deepsourcelabs/cli/command/repo"
	"github.com/deepsourcelabs/cli/command/report"
	"github.com/deepsourcelabs/cli/command/runs"
	"github.com/deepsourcelabs/cli/command/vulnerabilities"
	"github.com/spf13/cobra"
)

func NewCmdRoot() *cobra.Command {
	var verbose bool

	cmd := &cobra.Command{
		Use:   "deepsource <command> <subcommand> [flags]",
		Short: "DeepSource CLI",
		Long: `DeepSource CLI - Ship good code from the command line.

To get started, run: deepsource auth login`,
		SilenceErrors: true,
		SilenceUsage:  true,
		PersistentPreRun: func(cmd *cobra.Command, args []string) {
			if verbose {
				_ = os.Setenv("DEEPSOURCE_CLI_DEBUG", "1")
			}
		},
	}

	// Set version using --version flag
	info := buildinfo.GetBuildInfo()
	if info != nil {
		cmd.Version = info.Version
		cmd.SetVersionTemplate(fmt.Sprintf("DeepSource CLI %s (%s)\n", info.Version, info.GitCommit))
	}

	// Disable default completion command
	cmd.CompletionOptions.DisableDefaultCmd = true

	// Hide help subcommand (--help flag still works)
	cmd.SetHelpCommand(&cobra.Command{Hidden: true})

	cmd.PersistentFlags().BoolVar(&verbose, "verbose", false, "Enable verbose diagnostics")

	// Child Commands
	cmd.AddCommand(auth.NewCmdAuth())
	cmd.AddCommand(repo.NewCmdRepo())
	cmd.AddCommand(runs.NewCmdRuns())
	cmd.AddCommand(report.NewCmdReport())
	cmd.AddCommand(issues.NewCmdIssues())
	cmd.AddCommand(metrics.NewCmdMetrics())
	cmd.AddCommand(vulnerabilities.NewCmdVulnerabilities())

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
