package runs

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"sort"
	"strings"
	"time"

	"github.com/MakeNowJust/heredoc"
	"github.com/deepsourcelabs/cli/command/cmddeps"
	"github.com/deepsourcelabs/cli/command/cmdutil"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	runstypes "github.com/deepsourcelabs/cli/deepsource/runs"
	"github.com/deepsourcelabs/cli/internal/cli/completion"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	clierrors "github.com/deepsourcelabs/cli/internal/errors"
	"github.com/deepsourcelabs/cli/internal/vcs"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
)

type RunsOptions struct {
	RepoArg      string
	LimitArg     int
	OutputFormat string
	commitOid    string
	deps         *cmddeps.Deps
}

func (opts *RunsOptions) stdout() io.Writer {
	if opts.deps != nil && opts.deps.Stdout != nil {
		return opts.deps.Stdout
	}
	return os.Stdout
}

func NewCmdRuns() *cobra.Command {
	return NewCmdRunsWithDeps(nil)
}

func NewCmdRunsWithDeps(deps *cmddeps.Deps) *cobra.Command {
	opts := RunsOptions{
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
		style.Cyan("deepsource runs"),
		style.Yellow("--repo"),
		style.Cyan("deepsource runs --repo gh/owner/name"),
		style.Yellow("--commit"),
		style.Cyan("deepsource runs --commit abc123f"),
	)

	cmd := &cobra.Command{
		Use:   "runs [flags]",
		Short: "View analysis runs",
		Long:  doc,
		RunE: func(cmd *cobra.Command, _ []string) error {
			if opts.commitOid != "" {
				opts.commitOid = cmdutil.ResolveCommitOid(opts.commitOid)
				return opts.runDetail(cmd.Context())
			}
			return opts.runList()
		},
	}

	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "Repository in provider/owner/name format (e.g. gh/owner/name). Supported providers: gh, gl, bb, ads")
	cmd.Flags().IntVarP(&opts.LimitArg, "limit", "l", 20, "Number of analysis runs to fetch")
	cmd.Flags().StringVarP(&opts.OutputFormat, "output", "o", "pretty", "Output format: pretty, json")
	cmd.Flags().StringVar(&opts.commitOid, "commit", "", "Show metadata and issues summary for a specific commit")

	_ = cmd.RegisterFlagCompletionFunc("repo", func(_ *cobra.Command, _ []string, _ string) ([]string, cobra.ShellCompDirective) {
		return completion.RepoCompletionCandidates(), cobra.ShellCompDirectiveNoFileComp
	})
	_ = cmd.RegisterFlagCompletionFunc("output", func(_ *cobra.Command, _ []string, _ string) ([]string, cobra.ShellCompDirective) {
		return []string{
			"pretty\tPretty-printed output",
			"json\tJSON output",
		}, cobra.ShellCompDirectiveNoFileComp
	})

	setRunsUsageFunc(cmd)

	return cmd
}

// runList fetches and displays a table of recent analysis runs.
func (opts *RunsOptions) runList() error {
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

	analysisRuns, err := opts.fetchRuns(client)
	if err != nil {
		return err
	}

	if len(analysisRuns) == 0 {
		style.Infof(opts.stdout(), "No analysis runs found.")
		return nil
	}

	if opts.OutputFormat == "json" {
		return opts.outputRunsJSON(analysisRuns)
	}

	showRunsTable(opts.stdout(), analysisRuns)
	return nil
}

func (opts *RunsOptions) fetchRuns(client *deepsource.Client) ([]runstypes.AnalysisRun, error) {
	ctx := context.Background()

	if opts.RepoArg != "" {
		remote, resolveErr := vcs.ResolveRemote(opts.RepoArg)
		if resolveErr != nil {
			return nil, resolveErr
		}
		runs, _, err := client.GetAnalysisRuns(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, opts.LimitArg, nil, nil)
		if err != nil {
			return nil, clierrors.WrapAPIError("Failed to fetch analysis runs", err)
		}
		return runs, nil
	}

	var branchName string
	var err error
	if opts.deps != nil && opts.deps.BranchNameFunc != nil {
		branchName, err = opts.deps.BranchNameFunc()
	} else {
		branchName, err = cmdutil.ResolveBranchName(nil)
	}
	if err != nil {
		return nil, err
	}

	var remote *vcs.RemoteData
	if opts.deps != nil && opts.deps.RemoteFunc != nil {
		remote, err = opts.deps.RemoteFunc()
	} else {
		remote, err = vcs.ResolveRemote("")
	}
	if err != nil {
		return nil, err
	}

	runs, _, err := client.GetAnalysisRuns(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, opts.LimitArg, nil, &branchName)
	if err != nil {
		return nil, clierrors.WrapAPIError("Failed to fetch analysis runs", err)
	}
	return runs, nil
}

// runDetail fetches and displays metadata + issues summary for a single commit.
func (opts *RunsOptions) runDetail(ctx context.Context) error {
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
		return clierrors.WrapAPIError("Failed to fetch run details", err)
	}

	if opts.OutputFormat == "json" {
		return opts.outputRunDetailJSON(runWithIssues)
	}

	commitShort := commitOid
	if len(commitShort) > 8 {
		commitShort = commitShort[:8]
	}

	pterm.DefaultBox.WithTitle("Run Details").WithTitleTopCenter().Println(
		fmt.Sprintf("%s %s\n%s %s\n%s %s",
			pterm.Bold.Sprint("Commit:"),
			commitShort,
			pterm.Bold.Sprint("Branch:"),
			runWithIssues.BranchName,
			pterm.Bold.Sprint("Status:"),
			style.RunStatusColor(runWithIssues.Status),
		),
	)

	cmdutil.ShowReportCard(opts.stdout(), runWithIssues.ReportCard)
	showIssuesSummary(opts.stdout(), runWithIssues.Issues)

	fmt.Fprintln(opts.stdout())
	style.Infof(opts.stdout(), "Run %s to view full issue details",
		style.Cyan("deepsource issues --commit %s", commitShort))

	return nil
}

// --- JSON output ---

type RunJSON struct {
	CommitOid              string     `json:"commit_oid"`
	BranchName             string     `json:"branch_name"`
	Status                 string     `json:"status"`
	Grade                  string     `json:"grade"`
	OccurrencesIntroduced  int        `json:"occurrences_introduced"`
	OccurrencesResolved    int        `json:"occurrences_resolved"`
	OccurrencesSuppressed  int        `json:"occurrences_suppressed"`
	FinishedAt             *time.Time `json:"finished_at"`
}

type RunDetailJSON struct {
	CommitOid  string                  `json:"commit_oid"`
	BranchName string                  `json:"branch_name"`
	Status     string                  `json:"status"`
	ReportCard *cmdutil.ReportCardJSON `json:"report_card,omitempty"`
	Issues     []RunIssueJSON          `json:"issues"`
}

type RunIssueJSON struct {
	Path     string `json:"path"`
	Title    string `json:"title"`
	Code     string `json:"code"`
	Category string `json:"category"`
	Severity string `json:"severity"`
	Analyzer string `json:"analyzer"`
}

func (opts *RunsOptions) outputRunsJSON(analysisRuns []runstypes.AnalysisRun) error {
	result := make([]RunJSON, 0, len(analysisRuns))
	for _, run := range analysisRuns {
		grade := "-"
		if run.ReportCard != nil && run.ReportCard.Aggregate != nil {
			grade = run.ReportCard.Aggregate.Grade
		}
		result = append(result, RunJSON{
			CommitOid:              run.CommitOid,
			BranchName:             run.BranchName,
			Status:                 run.Status,
			Grade:                  grade,
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

func (opts *RunsOptions) outputRunDetailJSON(runWithIssues *runstypes.RunWithIssues) error {
	issuesJSON := make([]RunIssueJSON, 0, len(runWithIssues.Issues))
	for _, issue := range runWithIssues.Issues {
		issuesJSON = append(issuesJSON, RunIssueJSON{
			Path:     issue.Path,
			Title:    issue.Title,
			Code:     issue.IssueCode,
			Category: issue.Category,
			Severity: issue.Severity,
			Analyzer: issue.AnalyzerName,
		})
	}
	result := RunDetailJSON{
		CommitOid:  runWithIssues.CommitOid,
		BranchName: runWithIssues.BranchName,
		Status:     runWithIssues.Status,
		ReportCard: cmdutil.ToReportCardJSON(runWithIssues.ReportCard),
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

func showRunsTable(w io.Writer, analysisRuns []runstypes.AnalysisRun) {
	header := []string{"Commit", "Branch", "Status", "Grade", "Introduced", "Resolved", "Suppressed", "Finished"}
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

		status := style.RunStatusColor(run.Status)

		grade := "-"
		if run.ReportCard != nil && run.ReportCard.Aggregate != nil {
			grade = run.ReportCard.Aggregate.Grade
		}

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
			grade,
			introduced,
			resolved,
			suppressed,
			finished,
		})
	}

	pterm.DefaultTable.WithHasHeader().WithData(data).WithWriter(w).Render()
}

type issueSeverityCounts struct {
	critical int
	major    int
	minor    int
}

func countIssuesBySeverity(issues []runstypes.RunIssue) issueSeverityCounts {
	var counts issueSeverityCounts
	for _, issue := range issues {
		switch strings.ToUpper(issue.Severity) {
		case "CRITICAL":
			counts.critical++
		case "MAJOR":
			counts.major++
		case "MINOR":
			counts.minor++
		}
	}
	return counts
}

func renderSeverityBreakdown(counts issueSeverityCounts) []string {
	var parts []string
	if counts.critical > 0 {
		parts = append(parts, style.IssueSeverityColor("CRITICAL", fmt.Sprintf("%d critical", counts.critical)))
	}
	if counts.major > 0 {
		parts = append(parts, style.IssueSeverityColor("MAJOR", fmt.Sprintf("%d major", counts.major)))
	}
	if counts.minor > 0 {
		parts = append(parts, style.IssueSeverityColor("MINOR", fmt.Sprintf("%d minor", counts.minor)))
	}
	return parts
}

func showIssuesSummary(w io.Writer, issues []runstypes.RunIssue) {
	if len(issues) == 0 {
		style.Successf(w, "%s", "No issues found in this run")
		return
	}

	categoryCount := map[string]int{}
	analyzerCount := map[string]int{}
	for _, issue := range issues {
		if issue.Category != "" {
			categoryCount[issue.Category]++
		}
		if issue.AnalyzerName != "" {
			analyzerCount[issue.AnalyzerName]++
		}
	}

	fmt.Fprintln(w, pterm.Bold.Sprintf("Issues: %d total", len(issues)))

	counts := countIssuesBySeverity(issues)
	if parts := renderSeverityBreakdown(counts); len(parts) > 0 {
		fmt.Fprintln(w, "  "+strings.Join(parts, ", "))
	}

	if len(categoryCount) > 0 {
		fmt.Fprintln(w)
		fmt.Fprintln(w, pterm.Bold.Sprint("By Category:"))
		for _, key := range sortedKeys(categoryCount) {
			fmt.Fprintf(w, "  %s: %d\n", cmdutil.FormatCategory(key), categoryCount[key])
		}
	}

	if len(analyzerCount) > 0 {
		fmt.Fprintln(w)
		fmt.Fprintln(w, pterm.Bold.Sprint("By Analyzer:"))
		for _, key := range sortedKeys(analyzerCount) {
			fmt.Fprintf(w, "  %s: %d\n", key, analyzerCount[key])
		}
	}
}

func sortedKeys(m map[string]int) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	return keys
}

func setRunsUsageFunc(cmd *cobra.Command) {
	cmd.SetUsageFunc(func(c *cobra.Command) error {
		groups := []struct {
			title string
			flags []string
		}{
			{"Scope", []string{"commit"}},
			{"Output", []string{"output", "limit"}},
			{"General", []string{"repo", "help"}},
		}

		w := c.OutOrStderr()
		fmt.Fprintf(w, "Usage:\n  %s\n", c.UseLine())
		for _, g := range groups {
			fmt.Fprintf(w, "\n%s:\n", g.title)
			for _, name := range g.flags {
				f := c.Flags().Lookup(name)
				if f == nil {
					continue
				}
				fmt.Fprintf(w, "  %s\n", runsFlagUsageLine(f))
			}
		}
		fmt.Fprintln(w)
		return nil
	})
}

func runsFlagUsageLine(f *pflag.Flag) string {
	var line string
	if f.Shorthand != "" {
		line = fmt.Sprintf("-%s, --%s", f.Shorthand, f.Name)
	} else {
		line = fmt.Sprintf("    --%s", f.Name)
	}

	vartype := f.Value.Type()
	switch vartype {
	case "bool":
		// no type suffix for booleans
	default:
		line += " " + vartype
	}

	const pad = 28
	if len(line) < pad {
		line += strings.Repeat(" ", pad-len(line))
	} else {
		line += "  "
	}
	line += f.Usage

	if f.DefValue != "" && f.DefValue != "false" && f.DefValue != "[]" && f.DefValue != "0" {
		line += fmt.Sprintf(" (default %s)", f.DefValue)
	}
	return line
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
