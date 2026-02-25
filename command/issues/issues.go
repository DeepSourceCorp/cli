package issues

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/MakeNowJust/heredoc"
	"github.com/deepsourcelabs/cli/command/cmddeps"
	"github.com/deepsourcelabs/cli/command/cmdutil"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/issues"
	issuesQuery "github.com/deepsourcelabs/cli/deepsource/issues/queries"
	"github.com/deepsourcelabs/cli/internal/cli/completion"
	"github.com/deepsourcelabs/cli/internal/cli/prompt"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	clierrors "github.com/deepsourcelabs/cli/internal/errors"
	"github.com/deepsourcelabs/cli/internal/vcs"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
	"golang.org/x/term"
)

type IssuesOptions struct {
	RepoArg         string
	LimitArg        int
	OutputFormat    string
	Verbose         bool
	AnalyzerFilters []string
	CategoryFilters []string
	SeverityFilters []string
	PathFilters     []string
	SourceFilters   []string
	CommitOid       string
	PRNumber        int
	DefaultBranch   bool
	repoSlug        string
	autoDetectedBranch string
	issues          []issues.Issue
	deps            *cmddeps.Deps
	explicitScope   bool
	client          *deepsource.Client
	remote          *vcs.RemoteData
}

func (opts *IssuesOptions) stdout() io.Writer {
	if opts.deps != nil && opts.deps.Stdout != nil {
		return opts.deps.Stdout
	}
	return os.Stdout
}

func NewCmdIssues() *cobra.Command {
	return NewCmdIssuesWithDeps(nil)
}

func NewCmdIssuesWithDeps(deps *cmddeps.Deps) *cobra.Command {
	opts := IssuesOptions{
		LimitArg:     30,
		OutputFormat: "pretty",
		deps:         deps,
	}

	doc := heredoc.Docf(`
		View issues in a repository.

		By default, shows issues from the latest analyzed commit on the current branch:
		  %[1]s

		Scope to a specific commit, pull request, or the default branch:
		  %[2]s
		  %[3]s
		  %[4]s

		Output as a structured format:
		  %[5]s
		`,
		style.Cyan("deepsource issues"),
		style.Cyan("deepsource issues --commit abc123f"),
		style.Cyan("deepsource issues --pr 123"),
		style.Cyan("deepsource issues --default-branch"),
		style.Cyan("deepsource issues --output json"),
	)

	cmd := &cobra.Command{
		Use:   "issues [flags]",
		Short: "View issues in a repository",
		Long:  doc,
		RunE: func(cmd *cobra.Command, _ []string) error {
			return opts.Run(cmd.Context())
		},
	}

	// --repo, -r flag
	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "Repository in provider/owner/name format (e.g. gh/owner/name). Supported providers: gh, gl, bb, ads")

	// --limit, -l flag
	cmd.Flags().IntVarP(&opts.LimitArg, "limit", "l", 30, "Maximum number of issues to fetch")

	// --output, -o flag
	cmd.Flags().StringVarP(&opts.OutputFormat, "output", "o", "pretty", "Output format: pretty, json")

	// --verbose, -v flag
	cmd.Flags().BoolVarP(&opts.Verbose, "verbose", "v", false, "Show issue description")

	// Scoping flags
	cmd.Flags().StringVar(&opts.CommitOid, "commit", "", "Scope to a specific analysis run by commit SHA")
	cmd.Flags().IntVar(&opts.PRNumber, "pr", 0, "Scope to a specific pull request by number")
	cmd.Flags().BoolVar(&opts.DefaultBranch, "default-branch", false, "Show issues from the default branch instead of current branch")

	// Filter flags
	cmd.Flags().StringSliceVar(&opts.AnalyzerFilters, "analyzer", nil, "Filter by analyzer shortcode (e.g. python,go)")
	cmd.Flags().StringSliceVar(&opts.CategoryFilters, "category", nil, "Filter by category (e.g. security,bug-risk)")
	cmd.Flags().StringSliceVar(&opts.SeverityFilters, "severity", nil, "Filter by severity (e.g. critical,major)")
	cmd.Flags().StringSliceVar(&opts.PathFilters, "path", nil, "Filter by path substring (e.g. cmd/,internal/)")
	cmd.Flags().StringSliceVar(&opts.SourceFilters, "source", nil, "Filter by source (static, ai)")

	// Completions
	_ = cmd.RegisterFlagCompletionFunc("repo", func(_ *cobra.Command, _ []string, _ string) ([]string, cobra.ShellCompDirective) {
		return completion.RepoCompletionCandidates(), cobra.ShellCompDirectiveNoFileComp
	})
	_ = cmd.RegisterFlagCompletionFunc("output", func(_ *cobra.Command, _ []string, _ string) ([]string, cobra.ShellCompDirective) {
		return []string{
			"pretty\tPretty-printed output",
			"json\tJSON output",
		}, cobra.ShellCompDirectiveNoFileComp
	})
	_ = cmd.RegisterFlagCompletionFunc("category", func(_ *cobra.Command, _ []string, _ string) ([]string, cobra.ShellCompDirective) {
		return []string{
			"anti-pattern",
			"bug-risk",
			"performance",
			"security",
			"coverage",
			"typecheck",
			"style",
			"documentation",
		}, cobra.ShellCompDirectiveNoFileComp
	})
	_ = cmd.RegisterFlagCompletionFunc("severity", func(_ *cobra.Command, _ []string, _ string) ([]string, cobra.ShellCompDirective) {
		return []string{"critical", "major", "minor"}, cobra.ShellCompDirectiveNoFileComp
	})

	// Mutual exclusivity
	cmd.MarkFlagsMutuallyExclusive("commit", "pr", "default-branch")

	setIssuesUsageFunc(cmd)

	return cmd
}

func setIssuesUsageFunc(cmd *cobra.Command) {
	cmd.SetUsageFunc(func(c *cobra.Command) error {
		groups := []struct {
			title string
			flags []string
		}{
			{"Scope", []string{"commit", "pr", "default-branch"}},
			{"Filters", []string{"analyzer", "category", "severity", "path", "source"}},
			{"Output", []string{"output", "limit", "verbose"}},
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
				fmt.Fprintf(w, "  %s\n", flagUsageLine(f))
			}
		}
		fmt.Fprintln(w)
		return nil
	})
}

func flagUsageLine(f *pflag.Flag) string {
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
	case "stringSlice":
		line += " strings"
	default:
		line += " " + vartype
	}

	// Pad to 28 chars for alignment, then add usage.
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

func (opts *IssuesOptions) Run(ctx context.Context) error {
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
	opts.repoSlug = remote.Owner + "/" + remote.RepoName

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

	opts.explicitScope = opts.CommitOid != "" || opts.PRNumber > 0 || opts.DefaultBranch

	if opts.CommitOid != "" {
		opts.CommitOid = cmdutil.ResolveCommitOid(opts.CommitOid)
	}

	opts.client = client
	opts.remote = remote

	issuesList, err := opts.resolveIssues(ctx, client, remote)
	if err != nil {
		return err
	}

	issuesList = opts.filterIssues(issuesList)
	opts.issues = issuesList

	switch opts.OutputFormat {
	case "json":
		if err := opts.outputJSON(); err != nil {
			return err
		}
	default:
		if err := opts.outputHuman(ctx); err != nil {
			return err
		}
	}

	opts.warnIfLocalChanges()
	return nil
}

func (opts *IssuesOptions) resolveIssues(ctx context.Context, client *deepsource.Client, remote *vcs.RemoteData) ([]issues.Issue, error) {
	serverFilters := opts.buildServerFilters()

	var issuesList []issues.Issue
	var err error
	switch {
	case opts.CommitOid != "":
		issuesList, err = client.GetRunIssuesFlat(ctx, opts.CommitOid, opts.LimitArg, serverFilters)
	case opts.PRNumber > 0:
		issuesList, err = client.GetPRIssues(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, opts.PRNumber, opts.LimitArg)
	case opts.DefaultBranch:
		issuesList, err = client.GetIssues(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, opts.LimitArg)
	default:
		var branchNameFunc func() (string, error)
		if opts.deps != nil {
			branchNameFunc = opts.deps.BranchNameFunc
		}
		branchName, branchErr := cmdutil.ResolveBranchName(branchNameFunc)
		if branchErr != nil {
			return nil, branchErr
		}

		if prNumber, found := cmdutil.ResolvePRForBranch(ctx, client, branchName, remote); found {
			opts.PRNumber = prNumber
			opts.autoDetectedBranch = branchName

			// Check if latest run is still in progress before fetching PR issues.
			run, runErr := cmdutil.ResolveLatestRunForBranch(ctx, client, branchName, remote)
			if runErr == nil && cmdutil.IsRunInProgress(run.Status) {
				finalStatus, waitErr := cmdutil.WaitOrFallback(
					ctx, opts.stdout(), run.Status, run.CommitOid[:8], branchName, 5*time.Second,
					func(ctx context.Context) (string, error) {
						r, err := cmdutil.ResolveLatestRunForBranch(ctx, client, branchName, remote)
						if err != nil {
							return "", err
						}
						return r.Status, nil
					})
				if waitErr != nil {
					return nil, waitErr
				}
				if cmdutil.IsRunTimedOut(finalStatus) {
					style.Warnf(opts.stdout(), "Analysis timed out for branch %q.", branchName)
					return nil, nil
				}
			}

			issuesList, err = client.GetPRIssues(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, prNumber, opts.LimitArg)
			break
		}

		commitOid, _, runStatus, resolveErr := cmdutil.ResolveLatestRun(ctx, client, branchNameFunc, remote)
		if resolveErr != nil {
			if branchName != "" && branchName == cmdutil.GetDefaultBranch() {
				issuesList, err = client.GetIssues(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, opts.LimitArg)
				break
			}
			return nil, resolveErr
		}
		finalStatus, waitErr := cmdutil.WaitOrFallback(ctx, opts.stdout(), runStatus, commitOid[:8], branchName, 5*time.Second,
			func(ctx context.Context) (string, error) {
				_, _, s, err := cmdutil.ResolveLatestRun(ctx, client, branchNameFunc, remote)
				return s, err
			})
		if waitErr != nil {
			return nil, waitErr
		}
		if finalStatus == "FALLBACK" {
			run, fallbackErr := cmdutil.ResolveLatestCompletedRun(ctx, client, branchName, remote)
			if fallbackErr != nil {
				return nil, fallbackErr
			}
			if run == nil {
				style.Infof(opts.stdout(), "No completed analysis runs found for branch %q.", branchName)
				return nil, nil
			}
			style.Infof(opts.stdout(), "Analysis is running on commit %s. Showing results from the last analyzed commit (%s).", commitOid[:8], run.CommitOid[:8])
			commitOid = run.CommitOid
		}
		if cmdutil.IsRunTimedOut(finalStatus) {
			style.Warnf(opts.stdout(), "Analysis timed out for branch %q.", branchName)
			return nil, nil
		}
		opts.CommitOid = commitOid
		opts.autoDetectedBranch = branchName
		issuesList, err = client.GetRunIssuesFlat(ctx, commitOid, opts.LimitArg, serverFilters)
	}
	return issuesList, err
}

// warnIfLocalChanges prints a warning if the branch was auto-detected and
// has unpushed commits or uncommitted changes.
func (opts *IssuesOptions) warnIfLocalChanges() {
	if opts.autoDetectedBranch == "" || len(opts.issues) == 0 {
		return
	}

	hasUnpushed := cmdutil.HasUnpushedCommits
	if opts.deps != nil && opts.deps.HasUnpushedCommitsFunc != nil {
		hasUnpushed = opts.deps.HasUnpushedCommitsFunc
	}

	hasUncommitted := cmdutil.HasUncommittedChanges
	if opts.deps != nil && opts.deps.HasUncommittedChangesFunc != nil {
		hasUncommitted = opts.deps.HasUncommittedChangesFunc
	}

	unpushed := hasUnpushed()
	uncommitted := hasUncommitted()

	switch {
	case unpushed && uncommitted:
		style.Infof(opts.stdout(), "You have unpushed commits and uncommitted changes on %q. Displayed issues may not reflect your latest local changes.", opts.autoDetectedBranch)
	case unpushed:
		style.Infof(opts.stdout(), "You have unpushed commits on %q. Displayed issues may not reflect your latest local changes.", opts.autoDetectedBranch)
	case uncommitted:
		style.Infof(opts.stdout(), "You have uncommitted changes on %q. Displayed issues may not reflect your latest local changes.", opts.autoDetectedBranch)
	}
}

// normalizeEnumValue converts a user-supplied filter value to the GraphQL enum
// form: trimmed, uppercased, hyphens replaced with underscores.
// e.g. "bug-risk" -> "BUG_RISK", "anti-pattern" -> "ANTI_PATTERN".
func normalizeEnumValue(s string) string {
	return strings.ReplaceAll(strings.ToUpper(strings.TrimSpace(s)), "-", "_")
}

// buildServerFilters returns RunIssuesFlatParams with server-side filters set
// for any filter that has exactly one value. Multi-value filters are left to
// client-side filtering.
func (opts *IssuesOptions) buildServerFilters() issuesQuery.RunIssuesFlatParams {
	var params issuesQuery.RunIssuesFlatParams
	if len(opts.SourceFilters) == 1 {
		v := normalizeEnumValue(opts.SourceFilters[0])
		params.Source = &v
	}
	if len(opts.CategoryFilters) == 1 {
		v := normalizeEnumValue(opts.CategoryFilters[0])
		params.Category = &v
	}
	if len(opts.SeverityFilters) == 1 {
		v := normalizeEnumValue(opts.SeverityFilters[0])
		params.Severity = &v
	}
	return params
}

// --- Filters ---

func (opts *IssuesOptions) hasFilters() bool {
	return len(opts.AnalyzerFilters) > 0 ||
		len(opts.CategoryFilters) > 0 ||
		len(opts.SeverityFilters) > 0 ||
		len(opts.PathFilters) > 0 ||
		len(opts.SourceFilters) > 0
}

func (opts *IssuesOptions) filterIssues(issuesList []issues.Issue) []issues.Issue {
	if !opts.hasFilters() {
		return issuesList
	}

	analyzerSet := makeStringSet(opts.AnalyzerFilters)
	categorySet := makeStringSet(opts.CategoryFilters)
	severitySet := makeStringSet(opts.SeverityFilters)
	sourceSet := makeStringSet(opts.SourceFilters)
	pathFilters := makeLowerStrings(opts.PathFilters)

	filtered := make([]issues.Issue, 0, len(issuesList))
	for _, issue := range issuesList {
		if len(analyzerSet) > 0 && !setContainsFold(analyzerSet, issue.Analyzer.Shortcode) {
			continue
		}
		if len(categorySet) > 0 && !setContainsFold(categorySet, issue.IssueCategory) {
			continue
		}
		if len(severitySet) > 0 && !setContainsFold(severitySet, issue.IssueSeverity) {
			continue
		}
		if len(sourceSet) > 0 && !setContainsFold(sourceSet, issue.IssueSource) {
			continue
		}
		if len(pathFilters) > 0 && !matchesPathFilters(issue.Location.Path, pathFilters) {
			continue
		}
		filtered = append(filtered, issue)
	}

	return filtered
}

func makeStringSet(values []string) map[string]struct{} {
	set := make(map[string]struct{})
	for _, value := range values {
		normalized := strings.ToLower(strings.TrimSpace(value))
		if normalized == "" {
			continue
		}
		normalized = strings.ReplaceAll(normalized, "-", "_")
		set[normalized] = struct{}{}
	}
	return set
}

func makeLowerStrings(values []string) []string {
	normalized := make([]string, 0, len(values))
	for _, value := range values {
		trimmed := strings.TrimSpace(value)
		if trimmed == "" {
			continue
		}
		normalized = append(normalized, strings.ToLower(trimmed))
	}
	return normalized
}

func setContainsFold(set map[string]struct{}, value string) bool {
	normalized := strings.ToLower(strings.TrimSpace(value))
	normalized = strings.ReplaceAll(normalized, "-", "_")
	_, ok := set[normalized]
	return ok
}

func matchesPathFilters(path string, filters []string) bool {
	if path == "" {
		return false
	}
	lowerPath := strings.ToLower(path)
	for _, filter := range filters {
		if filter == "" {
			continue
		}
		if strings.Contains(lowerPath, filter) {
			return true
		}
	}
	return false
}

// --- Human output ---

func (opts *IssuesOptions) scopeLabel() string {
	switch {
	case opts.autoDetectedBranch != "":
		if opts.CommitOid == "" {
			return opts.autoDetectedBranch
		}
		short := opts.CommitOid
		if len(short) > 8 {
			short = short[:8]
		}
		return opts.autoDetectedBranch + " (" + short + ")"
	case opts.CommitOid != "":
		short := opts.CommitOid
		if len(short) > 8 {
			short = short[:8]
		}
		return "commit " + short
	case opts.PRNumber > 0:
		return fmt.Sprintf("PR #%d", opts.PRNumber)
	default:
		return "default branch"
	}
}

func buildIssueSummary(issuesList []issues.Issue) (sevParts []string, catParts []string) {
	sevCounts := map[string]int{}
	catCounts := map[string]int{}
	for _, issue := range issuesList {
		sevCounts[strings.ToUpper(issue.IssueSeverity)]++
		catCounts[strings.ToUpper(issue.IssueCategory)]++
	}

	for _, sev := range []string{"CRITICAL", "MAJOR", "MINOR"} {
		if c := sevCounts[sev]; c > 0 {
			sevParts = append(sevParts, style.IssueSeverityColor(sev, fmt.Sprintf("%d %s", c, strings.ToLower(humanizeSeverity(sev)))))
		}
	}
	for _, cat := range []string{"BUG_RISK", "SECURITY", "ANTI_PATTERN", "PERFORMANCE", "STYLE", "DOCUMENTATION", "COVERAGE", "TYPECHECK"} {
		if c := catCounts[cat]; c > 0 {
			catParts = append(catParts, fmt.Sprintf("%d %s", c, strings.ToLower(humanizeCategory(cat))))
		}
	}
	return sevParts, catParts
}

func groupIssuesByCategory(issuesList []issues.Issue) map[string][]issues.Issue {
	grouped := map[string][]issues.Issue{}
	for _, issue := range issuesList {
		cat := strings.ToUpper(issue.IssueCategory)
		grouped[cat] = append(grouped[cat], issue)
	}
	return grouped
}

func (opts *IssuesOptions) outputHuman(ctx context.Context) error {
	if len(opts.issues) == 0 {
		// Safety net: check for in-progress run before scope menu.
		// This catches cases where resolveIssues bypassed WaitOrFallback
		// (e.g. PR path ignoring FALLBACK status).
		if opts.autoDetectedBranch != "" && !opts.explicitScope {
			handled, err := opts.checkInProgressAndRetry(ctx)
			if err != nil {
				return err
			}
			if handled {
				return nil
			}
		}

		if opts.hasFilters() {
			style.Infof(opts.stdout(), "No issues matched the provided filters in %s on %s.", opts.repoSlug, opts.scopeLabel())
		} else {
			style.Infof(opts.stdout(), "No issues found in %s on %s.", opts.repoSlug, opts.scopeLabel())
		}

		if opts.shouldPromptAlternativeScope() {
			newIssues, err := opts.promptAlternativeScope(ctx)
			if err != nil {
				return err
			}
			if newIssues != nil {
				opts.issues = newIssues
				if len(opts.issues) == 0 {
					style.Infof(opts.stdout(), "No issues found in %s on %s.", opts.repoSlug, opts.scopeLabel())
					return nil
				}
				return opts.renderHumanIssues()
			}
		}
		return nil
	}

	return opts.renderHumanIssues()
}

func (opts *IssuesOptions) renderHumanIssues() error {
	w := opts.stdout()

	sevParts, catParts := buildIssueSummary(opts.issues)

	scopeLabel := opts.scopeLabel()
	fmt.Fprintln(w, pterm.Bold.Sprintf("── Issues · %s ────", scopeLabel))

	summaryLine := fmt.Sprintf("%d total", len(opts.issues))
	if len(sevParts) > 0 {
		summaryLine += " · " + strings.Join(sevParts, " · ")
	}
	fmt.Fprintln(w, summaryLine)

	if len(catParts) > 0 {
		fmt.Fprintln(w, strings.Join(catParts, " · "))
	}
	fmt.Fprintln(w)

	cwd, _ := os.Getwd()

	grouped := groupIssuesByCategory(opts.issues)
	categoryOrder := []string{"BUG_RISK", "SECURITY", "ANTI_PATTERN", "PERFORMANCE", "STYLE", "DOCUMENTATION", "COVERAGE", "TYPECHECK"}
	first := true
	for _, cat := range categoryOrder {
		group, ok := grouped[cat]
		if !ok {
			continue
		}

		slices.SortStableFunc(group, func(a, b issues.Issue) int {
			return severityRank(a.IssueSeverity) - severityRank(b.IssueSeverity)
		})

		if !first {
			fmt.Fprintln(w)
		}
		first = false

		fmt.Fprintln(w, pterm.Bold.Sprintf("  ── %s ──", humanizeCategory(cat)))

		for i, issue := range group {
			location := formatLocation(issue, cwd)
			severity := humanizeSeverity(issue.IssueSeverity)
			sevTag := style.IssueSeverityColor(issue.IssueSeverity, "["+severity+"]")
			fmt.Fprintf(w, "  %s %s\n", sevTag, issue.IssueText)
			if opts.Verbose && issue.Description != "" {
				fmt.Fprintf(w, "  %s\n", pterm.Gray(issue.Description))
			}
			fmt.Fprintf(w, "  %s\n", pterm.Gray(location))
			if i < len(group)-1 {
				fmt.Fprintln(w)
			}
		}
	}

	fmt.Fprintf(w, "\nShowing %d issue(s) in %s from %s\n", len(opts.issues), opts.repoSlug, scopeLabel)

	return nil
}

// --- Safety-net: in-progress check before scope menu ---

// checkInProgressAndRetry makes an extra API call to see if the latest run is
// in-progress when we got 0 issues on an auto-detected branch. This catches
// cases where resolveIssues bypassed or ignored the WaitOrFallback result
// (e.g. the PR path). Returns (true, nil) if it handled the situation and
// the scope menu should be skipped.
func (opts *IssuesOptions) checkInProgressAndRetry(ctx context.Context) (bool, error) {
	run, err := cmdutil.ResolveLatestRunForBranch(ctx, opts.client, opts.autoDetectedBranch, opts.remote)
	if err != nil || !cmdutil.IsRunInProgress(run.Status) {
		return false, nil
	}

	commitShort := run.CommitOid
	if len(commitShort) > 8 {
		commitShort = commitShort[:8]
	}

	if !opts.isInteractive() {
		return opts.refetchAfterFallback(ctx, commitShort)
	}

	// Interactive: let the user choose to wait or see last completed results.
	fmt.Fprintf(opts.stdout(), "\nAnalysis is still running on branch %q (latest commit %s).\n\n", opts.autoDetectedBranch, commitShort)

	choice, err := opts.selectFromOptions(
		"What would you like to do?",
		"",
		[]string{
			"Wait for the current analysis to finish",
			"Show results from the last completed analysis",
		},
	)
	if err != nil {
		return false, err
	}

	if choice == "Show results from the last completed analysis" {
		return opts.refetchAfterFallback(ctx, commitShort)
	}

	// Wait: poll for completion.
	pollCtx, cancel := context.WithTimeout(ctx, 10*time.Minute)
	defer cancel()

	style.Infof(opts.stdout(), "Waiting for analysis to complete...")

	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-pollCtx.Done():
			return false, pollCtx.Err()
		case <-ticker.C:
			r, checkErr := cmdutil.ResolveLatestRunForBranch(pollCtx, opts.client, opts.autoDetectedBranch, opts.remote)
			if checkErr != nil {
				return false, checkErr
			}
			if !cmdutil.IsRunInProgress(r.Status) {
				if cmdutil.IsRunTimedOut(r.Status) {
					style.Warnf(opts.stdout(), "Analysis timed out for branch %q.", opts.autoDetectedBranch)
					return true, nil
				}
				// Run completed — re-fetch issues.
				opts.CommitOid = r.CommitOid
				return opts.refetchIssuesAndRender(ctx)
			}
		}
	}
}

// refetchAfterFallback finds the last completed run on the branch and
// re-fetches issues from it. If no completed run exists, prints a message
// and returns (true, nil) so the scope menu is skipped.
func (opts *IssuesOptions) refetchAfterFallback(ctx context.Context, inProgressCommitShort string) (bool, error) {
	run, err := cmdutil.ResolveLatestCompletedRun(ctx, opts.client, opts.autoDetectedBranch, opts.remote)
	if err != nil {
		return false, err
	}
	if run == nil {
		style.Infof(opts.stdout(), "No completed analysis runs found for branch %q.", opts.autoDetectedBranch)
		return true, nil
	}

	completedShort := run.CommitOid
	if len(completedShort) > 8 {
		completedShort = completedShort[:8]
	}
	style.Infof(opts.stdout(), "Analysis is running on commit %s. Showing results from the last analyzed commit (%s).", inProgressCommitShort, completedShort)
	opts.CommitOid = run.CommitOid
	return opts.refetchIssuesAndRender(ctx)
}

// refetchIssuesAndRender re-fetches issues based on the current scope
// (PR or commit), filters them, and renders the result.
func (opts *IssuesOptions) refetchIssuesAndRender(ctx context.Context) (bool, error) {
	serverFilters := opts.buildServerFilters()

	var issuesList []issues.Issue
	var err error
	if opts.PRNumber > 0 {
		issuesList, err = opts.client.GetPRIssues(ctx, opts.remote.Owner, opts.remote.RepoName, opts.remote.VCSProvider, opts.PRNumber, opts.LimitArg)
	} else if opts.CommitOid != "" {
		issuesList, err = opts.client.GetRunIssuesFlat(ctx, opts.CommitOid, opts.LimitArg, serverFilters)
	}
	if err != nil {
		return false, err
	}

	issuesList = opts.filterIssues(issuesList)
	opts.issues = issuesList

	if len(opts.issues) == 0 {
		style.Infof(opts.stdout(), "No issues found in %s on %s.", opts.repoSlug, opts.scopeLabel())
		return true, nil
	}
	return true, opts.renderHumanIssues()
}

// --- Interactive scope menu ---

func (opts *IssuesOptions) selectFromOptions(msg, help string, options []string) (string, error) {
	if opts.deps != nil && opts.deps.SelectFromOptionsFunc != nil {
		return opts.deps.SelectFromOptionsFunc(msg, help, options)
	}
	return prompt.SelectFromOptions(msg, help, options)
}

func (opts *IssuesOptions) getSingleLineInput(msg, help string) (string, error) {
	if opts.deps != nil && opts.deps.GetSingleLineInputFunc != nil {
		return opts.deps.GetSingleLineInputFunc(msg, help)
	}
	return prompt.GetSingleLineInput(msg, help)
}

func (opts *IssuesOptions) isInteractive() bool {
	if opts.deps != nil && opts.deps.IsInteractiveFunc != nil {
		return opts.deps.IsInteractiveFunc()
	}
	return term.IsTerminal(int(os.Stdout.Fd()))
}

func (opts *IssuesOptions) shouldPromptAlternativeScope() bool {
	return !opts.explicitScope &&
		!opts.hasFilters() &&
		opts.OutputFormat == "pretty" &&
		opts.isInteractive()
}

const (
	scopeOptionDefaultBranch = "View issues on default branch"
	scopeOptionPR            = "View issues for a pull request"
	scopeOptionCommit        = "View issues for a specific commit"
	scopeOptionExit          = "Exit"
)

func (opts *IssuesOptions) promptAlternativeScope(ctx context.Context) ([]issues.Issue, error) {
	fmt.Fprintln(opts.stdout())
	choice, err := opts.selectFromOptions(
		"Try a different scope?",
		"",
		[]string{scopeOptionDefaultBranch, scopeOptionPR, scopeOptionCommit, scopeOptionExit},
	)
	if err != nil {
		return nil, err
	}

	// Reset scope fields
	opts.CommitOid = ""
	opts.PRNumber = 0
	opts.DefaultBranch = false
	opts.autoDetectedBranch = ""

	switch choice {
	case scopeOptionDefaultBranch:
		opts.DefaultBranch = true
	case scopeOptionPR:
		prStr, inputErr := opts.getSingleLineInput("Pull request number:", "")
		if inputErr != nil {
			return nil, inputErr
		}
		prNum, parseErr := strconv.Atoi(strings.TrimSpace(prStr))
		if parseErr != nil {
			return nil, fmt.Errorf("invalid PR number: %s", prStr)
		}
		opts.PRNumber = prNum
	case scopeOptionCommit:
		sha, inputErr := opts.getSingleLineInput("Commit SHA:", "")
		if inputErr != nil {
			return nil, inputErr
		}
		opts.CommitOid = cmdutil.ResolveCommitOid(strings.TrimSpace(sha))
	case scopeOptionExit:
		return nil, nil
	}

	issuesList, err := opts.resolveIssues(ctx, opts.client, opts.remote)
	if err != nil {
		return nil, err
	}
	return opts.filterIssues(issuesList), nil
}

// --- JSON output ---

type IssueJSON struct {
	Path        string `json:"path"`
	BeginLine   int    `json:"begin_line"`
	EndLine     int    `json:"end_line"`
	IssueCode   string `json:"issue_code"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Category    string `json:"category"`
	Severity    string `json:"severity"`
	Source      string `json:"source"`
	Analyzer    string `json:"analyzer"`
}

func (opts *IssuesOptions) toJSONIssues() []IssueJSON {
	result := make([]IssueJSON, 0, len(opts.issues))
	for _, issue := range opts.issues {
		result = append(result, IssueJSON{
			Path:        issue.Location.Path,
			BeginLine:   issue.Location.Position.BeginLine,
			EndLine:     issue.Location.Position.EndLine,
			IssueCode:   issue.IssueCode,
			Title:       issue.IssueText,
			Description: issue.Description,
			Category:    issue.IssueCategory,
			Severity:    issue.IssueSeverity,
			Source:      issue.IssueSource,
			Analyzer:    issue.Analyzer.Shortcode,
		})
	}
	return result
}

func (opts *IssuesOptions) outputJSON() error {
	data, err := json.MarshalIndent(opts.toJSONIssues(), "", "  ")
	if err != nil {
		return clierrors.NewCLIError(clierrors.ErrAPIError, "Failed to format JSON output", err)
	}
	return opts.writeOutput(data, true)
}

func (opts *IssuesOptions) writeOutput(data []byte, trailingNewline bool) error {
	w := opts.stdout()
	if trailingNewline {
		fmt.Fprintln(w, string(data))
	} else {
		fmt.Fprint(w, string(data))
	}
	return nil
}

// --- Formatting helpers ---

func severityRank(s string) int {
	switch strings.ToUpper(s) {
	case "CRITICAL":
		return 0
	case "MAJOR":
		return 1
	case "MINOR":
		return 2
	default:
		return 3
	}
}

func humanizeSeverity(s string) string {
	switch strings.ToUpper(s) {
	case "CRITICAL":
		return "Critical"
	case "MAJOR":
		return "Major"
	case "MINOR":
		return "Minor"
	default:
		return s
	}
}

func humanizeCategory(c string) string {
	switch strings.ToUpper(c) {
	case "BUG_RISK":
		return "Bug Risk"
	case "ANTI_PATTERN":
		return "Anti-pattern"
	case "SECURITY":
		return "Security"
	case "PERFORMANCE":
		return "Performance"
	case "COVERAGE":
		return "Coverage"
	case "TYPECHECK":
		return "Typecheck"
	case "STYLE":
		return "Style"
	case "DOCUMENTATION":
		return "Documentation"
	default:
		return c
	}
}


func formatLocationFromParts(loc issues.Location, cwd string) string {
	filePath := loc.Path
	if cwd != "" && strings.HasPrefix(filePath, cwd) {
		filePath = strings.TrimPrefix(filePath, cwd+"/")
	}
	if loc.Position.BeginLine == loc.Position.EndLine {
		return fmt.Sprintf("%s:%d", filePath, loc.Position.BeginLine)
	}
	return fmt.Sprintf("%s:%d-%d", filePath, loc.Position.BeginLine, loc.Position.EndLine)
}


func formatLocation(issue issues.Issue, cwd string) string {
	return formatLocationFromParts(issue.Location, cwd)
}

