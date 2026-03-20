package command

import (
	"context"
	"fmt"
	"strings"

	"github.com/deepsourcelabs/cli/buildinfo"
	"github.com/deepsourcelabs/cli/command/auth"
	completionCmd "github.com/deepsourcelabs/cli/command/completion"
	updateCmd "github.com/deepsourcelabs/cli/command/update"
	"github.com/deepsourcelabs/cli/command/issues"
	"github.com/deepsourcelabs/cli/command/metrics"
	"github.com/deepsourcelabs/cli/command/report"
	"github.com/deepsourcelabs/cli/command/reportcard"
	"github.com/deepsourcelabs/cli/command/repository"
	"github.com/deepsourcelabs/cli/command/runs"
	"github.com/deepsourcelabs/cli/command/vulnerabilities"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

func NewCmdRoot() *cobra.Command {
	cmd := &cobra.Command{
		Use:           buildinfo.AppName + " <command> [flags]",
		Short:         "DeepSource CLI",
		Long:          style.BoldCyan("DeepSource CLI — Ship good code from the command line.") + "\n\nTo get started, run → " + buildinfo.AppName + " auth login",
		SilenceErrors: true,
		SilenceUsage:  true,
	}

	cmd.SetHelpFunc(rootHelpFunc)

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
		&cobra.Group{ID: "setup", Title: "Setup:"},
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

	completionC := completionCmd.NewCmdCompletion()
	completionC.GroupID = "setup"
	cmd.AddCommand(completionC)

	updateC := updateCmd.NewCmdUpdate()
	updateC.GroupID = "setup"
	cmd.AddCommand(updateC)

	cmd.PersistentFlags().Bool("skip-tls-verify", false, "Skip TLS certificate verification (for self-signed certs)")
	cmd.Flags().BoolP("verbose", "v", false, "Show detailed output including examples")

	cmd.InitDefaultHelpFlag()
	cmd.InitDefaultVersionFlag()
	cmd.Flags().Lookup("help").Usage = "Show usage and available commands"
	if f := cmd.Flags().Lookup("version"); f != nil {
		f.Usage = "Print version and build info"
	}

	return cmd
}

func buildExampleText() string {
	app := buildinfo.AppName
	examples := []struct {
		comment string
		cmd     string
	}{
		{"Check for security issues on the current branch", app + " issues --output json --category security"},
		{"Get all issues for pull request #42", app + " issues --repo gh/owner/name --pr 42 --output json"},
		{"View code metrics on the current branch", app + " metrics --output json"},
		{"Check critical and high dependency vulnerabilities on the current branch", app + " vulnerabilities --severity critical,high --output json"},
		{"View report card for a specific commit", app + " report-card --commit abc123f --output json"},
		{"Report test coverage from CI", app + " report --analyzer test-coverage --key go --value-file coverage.out"},
		{"List the 5 most recent analysis runs", app + " runs --output json --limit 5"},
	}
	var lines []string
	for _, ex := range examples {
		lines = append(lines, style.Gray("# %s", ex.comment), ex.cmd, "")
	}
	// Remove trailing blank line
	if len(lines) > 0 {
		lines = lines[:len(lines)-1]
	}
	return strings.Join(lines, "\n")
}

func rootHelpFunc(cmd *cobra.Command, _ []string) {
	if cmd.Parent() != nil {
		root := cmd.Root()
		root.SetHelpFunc(nil)
		cmd.Help()
		root.SetHelpFunc(rootHelpFunc)
		return
	}

	out := cmd.OutOrStdout()

	// Long description (already colored)
	fmt.Fprintln(out, cmd.Long)
	fmt.Fprintln(out)

	// Usage
	fmt.Fprintf(out, "%s\n", style.BoldCyan("Usage:"))
	fmt.Fprintf(out, "  %s\n\n", cmd.UseLine())

	// Command groups
	groups := cmd.Groups()
	if len(groups) > 0 {
		for _, group := range groups {
			if group.ID == "auth" {
				continue
			}
			fmt.Fprintf(out, "%s\n", style.BoldCyan("%s", group.Title))
			for _, sub := range cmd.Commands() {
				if sub.GroupID == group.ID && sub.IsAvailableCommand() {
					name := sub.Name()
					padding := 17 - len(sub.Name())
					if padding < 2 {
						padding = 2
					}
					fmt.Fprintf(out, "  %s%s%s\n", name, strings.Repeat(" ", padding), sub.Short)
				}
			}
			fmt.Fprintln(out)
		}
	}

	// Examples (shown only with --verbose / -v)
	verbose, _ := cmd.Flags().GetBool("verbose")
	if verbose {
		examples := buildExampleText()
		if examples != "" {
			fmt.Fprintf(out, "%s\n", style.BoldCyan("Examples:"))
			for _, line := range strings.Split(examples, "\n") {
				fmt.Fprintf(out, "  %s\n", line)
			}
			fmt.Fprintln(out)
		}
	} else {
		fmt.Fprintln(out, pterm.Gray("Use --help -v to see usage examples."))
		fmt.Fprintln(out)
	}

	// Flags
	flagUsages := cmd.LocalFlags().FlagUsages()
	if flagUsages != "" {
		fmt.Fprintf(out, "%s\n", style.BoldCyan("Flags:"))
		fmt.Fprint(out, flagUsages)
		fmt.Fprintln(out)
	}

	// Footer
	fmt.Fprintln(out, pterm.Gray("Run "+cmd.CommandPath()+" <command> --help to learn more about a command."))
	fmt.Fprintln(out, pterm.Gray("Full docs at docs.deepsource.com/docs/developers/cli/usage"))
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
