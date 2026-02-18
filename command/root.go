package command

import (
	"context"

	"github.com/deepsourcelabs/cli/buildinfo"
	"github.com/deepsourcelabs/cli/command/auth"
	"github.com/deepsourcelabs/cli/command/analysis"
	"github.com/deepsourcelabs/cli/command/issues"
	"github.com/deepsourcelabs/cli/command/metrics"
	"github.com/deepsourcelabs/cli/command/repository"
	"github.com/deepsourcelabs/cli/command/report"
	"github.com/deepsourcelabs/cli/command/vulnerabilities"
	"github.com/spf13/cobra"
)

func NewCmdRoot() *cobra.Command {
	cmd := &cobra.Command{
		Use:   buildinfo.AppName + " <command> [flags]",
		Short: "DeepSource CLI",
		Long:  "DeepSource CLI - Ship good code from the command line.\n\nTo get started, run: " + buildinfo.AppName + " auth login",
		SilenceErrors: true,
		SilenceUsage:  true,
	}

	// Set version using --version flag
	info := buildinfo.GetBuildInfo()
	if info != nil {
		cmd.Version = info.Version
		cmd.SetVersionTemplate(info.String() + "\n")
	}

	// Disable default completion command
	cmd.CompletionOptions.DisableDefaultCmd = true

	// Hide help subcommand (--help flag still works)
	cmd.SetHelpCommand(&cobra.Command{Hidden: true})

	// Child Commands
	cmd.AddCommand(auth.NewCmdAuth())
	cmd.AddCommand(repository.NewCmdRepository())
	cmd.AddCommand(analysis.NewCmdAnalysis())
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
