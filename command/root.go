package command

import (
	"context"

	"github.com/deepsourcelabs/cli/buildinfo"
	"github.com/deepsourcelabs/cli/command/auth"
	"github.com/deepsourcelabs/cli/command/runs"
	"github.com/deepsourcelabs/cli/command/issues"
	"github.com/deepsourcelabs/cli/command/metrics"
	"github.com/deepsourcelabs/cli/command/reportcard"
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
	cmd.SetHelpCommand(&cobra.Command{Hidden: true, GroupID: "auth"})

	// Command groups
	cmd.AddGroup(
		&cobra.Group{ID: "auth", Title: "Authentication:"},
		&cobra.Group{ID: "repository", Title: "Repository:"},
		&cobra.Group{ID: "analysis", Title: "Analysis:"},
	)

	// Child Commands
	authCmd := auth.NewCmdAuth()
	authCmd.GroupID = "auth"
	cmd.AddCommand(authCmd)

	repositoryCmd := repository.NewCmdRepository()
	repositoryCmd.GroupID = "repository"
	cmd.AddCommand(repositoryCmd)

	runsCmd := runs.NewCmdRuns()
	runsCmd.GroupID = "repository"
	cmd.AddCommand(runsCmd)

	reportCmd := report.NewCmdReport()
	reportCmd.GroupID = "repository"
	cmd.AddCommand(reportCmd)

	issuesCmd := issues.NewCmdIssues()
	issuesCmd.GroupID = "analysis"
	cmd.AddCommand(issuesCmd)

	metricsCmd := metrics.NewCmdMetrics()
	metricsCmd.GroupID = "analysis"
	cmd.AddCommand(metricsCmd)

	reportCardCmd := reportcard.NewCmdReportCard()
	reportCardCmd.GroupID = "analysis"
	cmd.AddCommand(reportCardCmd)

	vulnsCmd := vulnerabilities.NewCmdVulnerabilities()
	vulnsCmd.GroupID = "analysis"
	cmd.AddCommand(vulnsCmd)

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
