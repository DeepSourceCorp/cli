package list

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/MakeNowJust/heredoc"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/runs"
	"github.com/deepsourcelabs/cli/internal/cli/completion"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	clierrors "github.com/deepsourcelabs/cli/internal/errors"
	"github.com/deepsourcelabs/cli/internal/vcs"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

type RunsListOptions struct {
	RepoArg    string
	LimitArg   int
	ptermTable [][]string
}

func NewCmdRunsList() *cobra.Command {
	opts := RunsListOptions{
		LimitArg: 20,
	}

	doc := heredoc.Docf(`
		List analysis runs for a repository.

		To list analysis runs for the current repository:
		%[1]s

		To list analysis runs for a specific repository, use the %[2]s flag:
		%[3]s

		To limit the number of runs shown, use the %[4]s flag:
		%[5]s
		`, style.Cyan("deepsource runs list"), style.Yellow("--repo"), style.Cyan("deepsource runs list --repo repo_name"), style.Yellow("--limit"), style.Cyan("deepsource runs list --limit 50"))

	cmd := &cobra.Command{
		Use:   "list",
		Short: "List analysis runs",
		Long:  doc,
		RunE: func(cmd *cobra.Command, args []string) error {
			return opts.Run()
		},
	}

	// --repo, -r flag
	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "List history for the specified repository")

	// --limit, -l flag
	cmd.Flags().IntVarP(&opts.LimitArg, "limit", "l", 20, "Number of analysis runs to fetch")

	_ = cmd.RegisterFlagCompletionFunc("repo", func(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective) {
		return completion.RepoCompletionCandidates(), cobra.ShellCompDirectiveNoFileComp
	})

	return cmd
}

// Execute the command
func (opts *RunsListOptions) Run() error {
	// Load configuration
	cfgMgr := config.DefaultManager()
	cfg, err := cfgMgr.Load()
	if err != nil {
		return clierrors.NewCLIError(clierrors.ErrInvalidConfig, "Error reading DeepSource CLI config", err)
	}
	if err := cfg.VerifyAuthentication(); err != nil {
		return err
	}

	// Resolve remote repository
	remote, err := vcs.ResolveRemote(opts.RepoArg)
	if err != nil {
		return err
	}

	// Create DeepSource client
	client, err := deepsource.New(deepsource.ClientOpts{
		Token:            cfg.Token,
		HostName:         cfg.Host,
		OnTokenRefreshed: cfgMgr.TokenRefreshCallback(),
	})
	if err != nil {
		return err
	}

	// Fetch analysis runs
	ctx := context.Background()
	runs, err := client.GetAnalysisRuns(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, opts.LimitArg)
	if err != nil {
		return err
	}

	if len(runs) == 0 {
		pterm.Info.Println("No analysis runs found for this repository.")
		return nil
	}

	opts.showHistory(runs)
	return nil
}

// Format and display the runs using pterm
func (opts *RunsListOptions) showHistory(analysisRuns []runs.AnalysisRun) {
	// Create table header
	header := []string{"COMMIT", "BRANCH", "STATUS", "INTRODUCED", "RESOLVED", "SUPPRESSED", "FINISHED"}
	data := [][]string{header}

	// Add data rows
	for _, run := range analysisRuns {
		// Truncate commit OID for display
		commitShort := run.CommitOid
		if len(commitShort) > 8 {
			commitShort = commitShort[:8]
		}

		// Format branch name
		branch := run.BranchName
		if branch == "" {
			branch = "-"
		}

		// Format status with color
		status := formatStatus(run.Status)

		// Format counts
		introduced := fmt.Sprintf("%d", run.OccurrencesIntroduced)
		resolved := fmt.Sprintf("%d", run.OccurrencesResolved)
		suppressed := fmt.Sprintf("%d", run.OccurrencesSuppressed)

		// Format finished time
		finished := "-"
		if run.FinishedAt != nil {
			finished = formatTime(*run.FinishedAt)
		}

		data = append(data, []string{
			commitShort,
			branch,
			status,
			introduced,
			resolved,
			suppressed,
			finished,
		})
	}

	// Render table
	pterm.DefaultTable.WithHasHeader().WithData(data).Render()
}

// Format status with appropriate styling
func formatStatus(status string) string {
	switch strings.ToUpper(status) {
	case "SUCCESS":
		return pterm.Green(status)
	case "FAILURE":
		return pterm.Red(status)
	case "PENDING":
		return pterm.Yellow(status)
	case "RUNNING":
		return pterm.Cyan(status)
	default:
		return status
	}
}

// Format time to relative time (e.g., "2 hours ago")
func formatTime(t time.Time) string {
	now := time.Now()
	diff := now.Sub(t)

	switch {
	case diff < time.Minute:
		return "just now"
	case diff < time.Hour:
		mins := int(diff.Minutes())
		if mins == 1 {
			return "1 min ago"
		}
		return fmt.Sprintf("%d mins ago", mins)
	case diff < 24*time.Hour:
		hours := int(diff.Hours())
		if hours == 1 {
			return "1 hour ago"
		}
		return fmt.Sprintf("%d hours ago", hours)
	case diff < 7*24*time.Hour:
		days := int(diff.Hours() / 24)
		if days == 1 {
			return "1 day ago"
		}
		return fmt.Sprintf("%d days ago", days)
	default:
		return t.Format("Jan 2, 2006")
	}
}
