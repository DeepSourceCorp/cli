package command

import (
	"context"

	"github.com/MakeNowJust/heredoc"
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
		Long: heredoc.Docf(`
			DeepSource CLI — query code-quality data from the command line.

			Authentication (required before all other commands):
			  %[1]s auth login

			Repository targeting:
			  --repo <provider/owner/name>   provider: gh, gl, bb, or ads
			  If omitted, auto-detected from the current git remote.

			Output format:
			  --output json    machine-readable JSON (supported by issues, metrics, runs,
			                   report-card, vulnerabilities)

			Scope (where applicable):
			  --commit <sha>          specific commit
			  --pr <number>           pull request
			  --default-branch        repository default branch

			Commands:
			  issues           List code-quality issues (--category, --analyzer, --limit, --pr)
			  metrics          Show code metrics (--metric)
			  runs             List analysis runs (--limit)
			  report-card      View report card (--commit)
			  vulnerabilities  List dependency vulnerabilities (--severity)
			  report           Upload analysis artifacts from CI (--analyzer, --key, --value-file)
			  auth             Login, logout, check status
			  repo             Repository info (status, dashboard, analyzers)
		`, buildinfo.AppName),
		Example: heredoc.Docf(`
			# Check for security issues on the current branch
			%[1]s issues --output json --category security

			# Get all issues for pull request #42
			%[1]s issues --repo gh/owner/name --pr 42 --output json

			# View code metrics on the current branch
			%[1]s metrics --output json

			# Check critical and high dependency vulnerabilities on the current branch
			%[1]s vulnerabilities --severity critical,high --output json

			# View report card for a specific commit
			%[1]s report-card --commit abc123f --output json

			# Report test coverage from CI
			%[1]s report --analyzer test-coverage --key go --value-file coverage.out

			# List the 5 most recent analysis runs
			%[1]s runs --output json --limit 5
		`, buildinfo.AppName),
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
