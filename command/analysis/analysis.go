package analysis

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"
	"time"

	"github.com/MakeNowJust/heredoc"
	"github.com/deepsourcelabs/cli/command/cmddeps"
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

type AnalysisOptions struct {
	RepoArg      string
	LimitArg     int
	OutputFormat string
	commitOid    string
	deps         *cmddeps.Deps
}

func (opts *AnalysisOptions) stdout() io.Writer {
	if opts.deps != nil && opts.deps.Stdout != nil {
		return opts.deps.Stdout
	}
	return os.Stdout
}

func NewCmdAnalysis() *cobra.Command {
	return NewCmdAnalysisWithDeps(nil)
}

func NewCmdAnalysisWithDeps(deps *cmddeps.Deps) *cobra.Command {
	opts := AnalysisOptions{
		LimitArg: 20,
		deps:     deps,
	}

	doc := heredoc.Docf(`
		View analysis runs for a repository.

		Lists recent analysis runs by default:
		  %[1]s

		Use %[2]s to scope to a specific repository:
		  %[3]s

		Use %[4]s to show run metadata and issues summary:
		  %[5]s
		`,
		style.Cyan("deepsource analysis"),
		style.Yellow("--repo"),
		style.Cyan("deepsource analysis --repo repo_name"),
		style.Yellow("--commit"),
		style.Cyan("deepsource analysis --commit abc123f"),
	)

	cmd := &cobra.Command{
		Use:   "analysis [flags]",
		Short: "View analysis runs",
		Long:  doc,
		RunE: func(cmd *cobra.Command, args []string) error {
			if opts.commitOid != "" {
				return opts.runDetail(cmd.Context())
			}
			return opts.runList()
		},
	}

	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "List history for the specified repository")
	cmd.Flags().IntVarP(&opts.LimitArg, "limit", "l", 20, "Number of analysis runs to fetch")
	cmd.Flags().StringVar(&opts.commitOid, "commit", "", "Show metadata and issues summary for a specific commit")
	cmd.Flags().StringVarP(&opts.OutputFormat, "output", "o", "pretty", "Output format: pretty, json")

	_ = cmd.RegisterFlagCompletionFunc("repo", func(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective) {
		return completion.RepoCompletionCandidates(), cobra.ShellCompDirectiveNoFileComp
	})
	_ = cmd.RegisterFlagCompletionFunc("output", func(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective) {
		return []string{
			"pretty\tPretty-printed output",
			"json\tJSON output",
		}, cobra.ShellCompDirectiveNoFileComp
	})

	return cmd
}

// runList fetches and displays a table of recent analysis runs.
func (opts *AnalysisOptions) runList() error {
	var cfgMgr *config.Manager
	if opts.deps != nil && opts.deps.ConfigMgr != nil {
		cfgMgr = opts.deps.ConfigMgr
	} else {
		cfgMgr = config.DefaultManager()
	}
	cfg, err := cfgMgr.Load()
	if err != nil {
		return clierrors.NewCLIError(clierrors.ErrInvalidConfig, "Error reading DeepSource CLI config", err)
	}
	if err := cfg.VerifyAuthentication(); err != nil {
		return err
	}

	remote, err := vcs.ResolveRemote(opts.RepoArg)
	if err != nil {
		return err
	}

	var client *deepsource.Client
	if opts.deps != nil && opts.deps.Client != nil {
		client = opts.deps.Client
	} else {
		client, err = deepsource.New(deepsource.ClientOpts{
			Token:            cfg.Token,
			HostName:         cfg.Host,
			OnTokenRefreshed: cfgMgr.TokenRefreshCallback(),
		})
		if err != nil {
			return err
		}
	}

	ctx := context.Background()
	analysisRuns, err := client.GetAnalysisRuns(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, opts.LimitArg)
	if err != nil {
		return err
	}

	if len(analysisRuns) == 0 {
		pterm.Info.Println("No analysis runs found for this repository.")
		return nil
	}

	if opts.OutputFormat == "json" {
		return opts.outputRunsJSON(analysisRuns)
	}

	showRunsTable(analysisRuns)
	return nil
}

// runDetail fetches and displays metadata + issues summary for a single commit.
func (opts *AnalysisOptions) runDetail(ctx context.Context) error {
	var cfgMgr *config.Manager
	if opts.deps != nil && opts.deps.ConfigMgr != nil {
		cfgMgr = opts.deps.ConfigMgr
	} else {
		cfgMgr = config.DefaultManager()
	}
	cfg, err := cfgMgr.Load()
	if err != nil {
		return clierrors.NewCLIError(clierrors.ErrInvalidConfig, "Error reading DeepSource CLI config", err)
	}
	if err := cfg.VerifyAuthentication(); err != nil {
		return err
	}

	var client *deepsource.Client
	if opts.deps != nil && opts.deps.Client != nil {
		client = opts.deps.Client
	} else {
		client, err = deepsource.New(deepsource.ClientOpts{
			Token:            cfg.Token,
			HostName:         cfg.Host,
			OnTokenRefreshed: cfgMgr.TokenRefreshCallback(),
		})
		if err != nil {
			return err
		}
	}

	commitOid := opts.commitOid
	runWithIssues, err := client.GetRunIssues(ctx, commitOid)
	if err != nil {
		return clierrors.NewCLIError(clierrors.ErrAPIError, "Failed to fetch run details", err)
	}

	if opts.OutputFormat == "json" {
		return opts.outputRunDetailJSON(runWithIssues)
	}

	commitShort := commitOid
	if len(commitShort) > 8 {
		commitShort = commitShort[:8]
	}

	pterm.DefaultBox.WithTitle("Analysis Run").WithTitleTopCenter().Println(
		fmt.Sprintf("%s %s\n%s %s\n%s %s",
			pterm.Bold.Sprint("Commit:"),
			commitShort,
			pterm.Bold.Sprint("Branch:"),
			runWithIssues.BranchName,
			pterm.Bold.Sprint("Status:"),
			formatStatus(runWithIssues.Status),
		),
	)

	showIssuesSummary(runWithIssues.Issues)

	pterm.Println()
	pterm.Info.Printfln("Run %s to view full issue details",
		style.Cyan("deepsource issues --commit %s", commitShort))

	return nil
}

// --- JSON output ---

type AnalysisRunJSON struct {
	CommitOid              string     `json:"commit_oid"`
	BranchName             string     `json:"branch_name"`
	Status                 string     `json:"status"`
	OccurrencesIntroduced  int        `json:"occurrences_introduced"`
	OccurrencesResolved    int        `json:"occurrences_resolved"`
	OccurrencesSuppressed  int        `json:"occurrences_suppressed"`
	FinishedAt             *time.Time `json:"finished_at"`
}

type RunDetailJSON struct {
	CommitOid  string         `json:"commit_oid"`
	BranchName string         `json:"branch_name"`
	Status     string         `json:"status"`
	Issues     []RunIssueJSON `json:"issues"`
}

type RunIssueJSON struct {
	Path     string `json:"path"`
	Title    string `json:"title"`
	Code     string `json:"code"`
	Category string `json:"category"`
	Severity string `json:"severity"`
}

func (opts *AnalysisOptions) outputRunsJSON(analysisRuns []runs.AnalysisRun) error {
	result := make([]AnalysisRunJSON, 0, len(analysisRuns))
	for _, run := range analysisRuns {
		result = append(result, AnalysisRunJSON{
			CommitOid:              run.CommitOid,
			BranchName:             run.BranchName,
			Status:                 run.Status,
			OccurrencesIntroduced:  run.OccurrencesIntroduced,
			OccurrencesResolved:    run.OccurrencesResolved,
			OccurrencesSuppressed:  run.OccurrencesSuppressed,
			FinishedAt:             run.FinishedAt,
		})
	}
	data, err := json.MarshalIndent(result, "", "  ")
	if err != nil {
		return clierrors.NewCLIError(clierrors.ErrAPIError, "Failed to format JSON output", err)
	}
	fmt.Fprintln(opts.stdout(), string(data))
	return nil
}

func (opts *AnalysisOptions) outputRunDetailJSON(runWithIssues *runs.RunWithIssues) error {
	issuesJSON := make([]RunIssueJSON, 0, len(runWithIssues.Issues))
	for _, issue := range runWithIssues.Issues {
		issuesJSON = append(issuesJSON, RunIssueJSON{
			Path:     issue.Path,
			Title:    issue.Title,
			Code:     issue.IssueCode,
			Category: issue.Category,
			Severity: issue.Severity,
		})
	}
	result := RunDetailJSON{
		CommitOid:  runWithIssues.CommitOid,
		BranchName: runWithIssues.BranchName,
		Status:     runWithIssues.Status,
		Issues:     issuesJSON,
	}
	data, err := json.MarshalIndent(result, "", "  ")
	if err != nil {
		return clierrors.NewCLIError(clierrors.ErrAPIError, "Failed to format JSON output", err)
	}
	fmt.Fprintln(opts.stdout(), string(data))
	return nil
}

// --- Display helpers ---

func showRunsTable(analysisRuns []runs.AnalysisRun) {
	header := []string{"Commit", "Branch", "Status", "Introduced", "Resolved", "Suppressed", "Finished"}
	data := [][]string{header}

	for _, run := range analysisRuns {
		commitShort := run.CommitOid
		if len(commitShort) > 8 {
			commitShort = commitShort[:8]
		}

		branch := run.BranchName
		if branch == "" {
			branch = "-"
		}

		status := formatStatus(run.Status)
		introduced := fmt.Sprintf("%d", run.OccurrencesIntroduced)
		resolved := fmt.Sprintf("%d", run.OccurrencesResolved)
		suppressed := fmt.Sprintf("%d", run.OccurrencesSuppressed)

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

	pterm.DefaultTable.WithHasHeader().WithData(data).Render()
}

func showIssuesSummary(issues []runs.RunIssue) {
	if len(issues) == 0 {
		pterm.Println()
		pterm.Success.Println("No issues found in this run")
		return
	}

	var critical, major, minor int
	for _, issue := range issues {
		switch strings.ToUpper(issue.Severity) {
		case "CRITICAL":
			critical++
		case "MAJOR":
			major++
		case "MINOR":
			minor++
		}
	}

	pterm.Println()
	pterm.Println(pterm.Bold.Sprintf("Issues: %d total", len(issues)))

	parts := []string{}
	if critical > 0 {
		parts = append(parts, pterm.Red(fmt.Sprintf("%d critical", critical)))
	}
	if major > 0 {
		parts = append(parts, pterm.LightRed(fmt.Sprintf("%d major", major)))
	}
	if minor > 0 {
		parts = append(parts, pterm.Yellow(fmt.Sprintf("%d minor", minor)))
	}
	if len(parts) > 0 {
		pterm.Println("  " + strings.Join(parts, ", "))
	}
}

func formatStatus(status string) string {
	switch strings.ToUpper(status) {
	case "SUCCESS":
		return pterm.Green("Success")
	case "FAILURE":
		return pterm.Red("Failure")
	case "PENDING":
		return pterm.Yellow("Pending")
	case "RUNNING":
		return pterm.Cyan("Running")
	default:
		return status
	}
}

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
