package issues

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"slices"
	"strings"

	"github.com/MakeNowJust/heredoc"
	"github.com/deepsourcelabs/cli/command/cmddeps"
	"github.com/deepsourcelabs/cli/command/cmdutil"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/issues"
	issuesQuery "github.com/deepsourcelabs/cli/deepsource/issues/queries"
	"github.com/deepsourcelabs/cli/deepsource/pagination"
	"github.com/deepsourcelabs/cli/internal/cli/completion"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	clierrors "github.com/deepsourcelabs/cli/internal/errors"
	"github.com/deepsourcelabs/cli/internal/vcs"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
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
	cmd.Flags().IntVarP(&opts.LimitArg, "limit", "l", 0, "Maximum number of issues to display (0 = all)")

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

	// Apply limit cap if set
	if opts.LimitArg > 0 && len(issuesList) > opts.LimitArg {
		issuesList = issuesList[:opts.LimitArg]
	}

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
		issuesList, err = client.GetRunIssuesFlat(ctx, opts.CommitOid, serverFilters)
	case opts.PRNumber > 0:
		issuesList, err = client.GetPRIssues(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, opts.PRNumber)
	case opts.DefaultBranch:
		issuesList, err = client.GetIssues(ctx, remote.Owner, remote.RepoName, remote.VCSProvider)
	default:
		var branchNameFunc func() (string, error)
		if opts.deps != nil {
			branchNameFunc = opts.deps.BranchNameFunc
		}
		ab, abErr := cmdutil.ResolveAutoBranch(ctx, opts.stdout(), client, branchNameFunc, remote)
		if abErr != nil {
			return nil, abErr
		}
		if ab.Empty {
			return nil, nil
		}
		opts.autoDetectedBranch = ab.BranchName
		switch {
		case ab.PRNumber > 0:
			opts.PRNumber = ab.PRNumber
			opts.CommitOid = ab.CommitOid
			issuesList, err = client.GetPRIssues(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, ab.PRNumber)
		case ab.UseRepo:
			issuesList, err = client.GetIssues(ctx, remote.Owner, remote.RepoName, remote.VCSProvider)
		default:
			opts.CommitOid = ab.CommitOid
			issuesList, err = client.GetRunIssuesFlat(ctx, ab.CommitOid, serverFilters)
		}
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
		style.Infof(opts.stdout(), "You have unpushed commits and uncommitted changes on branch %s. Displayed issues may not reflect your latest local changes.", opts.autoDetectedBranch)
	case unpushed:
		style.Infof(opts.stdout(), "You have unpushed commits on branch %s. Displayed issues may not reflect your latest local changes.", opts.autoDetectedBranch)
	case uncommitted:
		style.Infof(opts.stdout(), "You have uncommitted changes on branch %s. Displayed issues may not reflect your latest local changes.", opts.autoDetectedBranch)
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
			return "branch " + opts.autoDetectedBranch
		}
		short := opts.CommitOid
		if len(short) > 8 {
			short = short[:8]
		}
		return "branch " + opts.autoDetectedBranch + " (" + short + ")"
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
			catParts = append(catParts, fmt.Sprintf("%d %s", c, strings.ToLower(pluralizeCategory(cat, c))))
		}
	}
	return sevParts, catParts
}

func pluralizeCategory(cat string, count int) string {
	name := humanizeCategory(cat)
	if count == 1 {
		return name
	}
	switch strings.ToUpper(cat) {
	case "BUG_RISK", "ANTI_PATTERN":
		return name + "s"
	default:
		return name
	}
}

func groupIssuesByCategory(issuesList []issues.Issue) map[string][]issues.Issue {
	grouped := map[string][]issues.Issue{}
	for _, issue := range issuesList {
		cat := strings.ToUpper(issue.IssueCategory)
		grouped[cat] = append(grouped[cat], issue)
	}
	return grouped
}

func (opts *IssuesOptions) outputHuman(_ context.Context) error {
	if len(opts.issues) == 0 {
		if opts.hasFilters() {
			style.Infof(opts.stdout(), "No issues matched the provided filters in %s on %s.", opts.repoSlug, opts.scopeLabel())
		} else {
			style.Infof(opts.stdout(), "No issues found in %s on %s.", opts.repoSlug, opts.scopeLabel())
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

		grouped := groupIdenticalIssues(group)
		for i, g := range grouped {
			severity := humanizeSeverity(g.Key.IssueSeverity)
			sevTag := style.IssueSeverityColor(g.Key.IssueSeverity, "["+severity+"]")

			if len(g.Issues) == 1 {
				// Single occurrence: render exactly as before
				fmt.Fprintf(w, "  %s %s\n", sevTag, g.Key.IssueText)
				if opts.Verbose && g.Description != "" {
					fmt.Fprintf(w, "  %s\n", pterm.Gray(g.Description))
				}
				fmt.Fprintf(w, "  %s\n", pterm.Gray(formatLocation(g.Issues[0], cwd)))
			} else {
				// Multi-occurrence: show count + compact locations
				fmt.Fprintf(w, "  %s %s (%d occurrences)\n", sevTag, g.Key.IssueText, len(g.Issues))
				if opts.Verbose && g.Description != "" {
					fmt.Fprintf(w, "  %s\n", pterm.Gray(g.Description))
				}
				for _, loc := range formatGroupLocations(g.Issues, cwd) {
					fmt.Fprintf(w, "  %s\n", pterm.Gray(loc))
				}
			}

			if i < len(grouped)-1 {
				fmt.Fprintln(w)
			}
		}
	}

	fmt.Fprintf(w, "\nShowing %d %s in %s from %s\n", len(opts.issues), style.Pluralize(len(opts.issues), "issue", "issues"), opts.repoSlug, scopeLabel)

	if len(opts.issues) >= pagination.MaxResults {
		style.Warnf(w, "Results capped at %d. Use --limit, filters, or scoping flags to narrow results.", pagination.MaxResults)
	}

	return nil
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

// --- Issue grouping ---

// issueGroupKey is the composite key used to group identical issues.
type issueGroupKey struct {
	IssueText     string
	IssueSeverity string
	IssueCode     string
}

// issueGroup holds a set of issues that share the same title, severity, and code.
type issueGroup struct {
	Key         issueGroupKey
	Description string
	Issues      []issues.Issue
}

// groupIdenticalIssues clusters issues by (IssueText, IssueSeverity, IssueCode),
// preserving the order in which each group is first encountered.
func groupIdenticalIssues(issuesList []issues.Issue) []issueGroup {
	seen := map[issueGroupKey]int{} // key -> index into groups
	var groups []issueGroup

	for _, issue := range issuesList {
		key := issueGroupKey{
			IssueText:     issue.IssueText,
			IssueSeverity: issue.IssueSeverity,
			IssueCode:     issue.IssueCode,
		}
		if idx, ok := seen[key]; ok {
			groups[idx].Issues = append(groups[idx].Issues, issue)
		} else {
			seen[key] = len(groups)
			groups = append(groups, issueGroup{
				Key:         key,
				Description: issue.Description,
				Issues:      []issues.Issue{issue},
			})
		}
	}
	return groups
}

// formatLineRange returns "42" for single-line or "42-96" for multi-line positions.
func formatLineRange(pos issues.Position) string {
	if pos.BeginLine == pos.EndLine {
		return fmt.Sprintf("%d", pos.BeginLine)
	}
	return fmt.Sprintf("%d-%d", pos.BeginLine, pos.EndLine)
}

// formatGroupLocations returns one string per file, with line ranges joined by ", ".
// e.g. "command/root.go:23-39, 42-96, 155"
func formatGroupLocations(groupIssues []issues.Issue, cwd string) []string {
	type fileEntry struct {
		displayPath string
		ranges      []string
	}

	seen := map[string]int{} // raw path -> index into files
	var files []fileEntry

	for _, issue := range groupIssues {
		rawPath := issue.Location.Path
		displayPath := rawPath
		if cwd != "" && strings.HasPrefix(displayPath, cwd) {
			displayPath = strings.TrimPrefix(displayPath, cwd+"/")
		}

		lineRange := formatLineRange(issue.Location.Position)

		if idx, ok := seen[rawPath]; ok {
			files[idx].ranges = append(files[idx].ranges, lineRange)
		} else {
			seen[rawPath] = len(files)
			files = append(files, fileEntry{
				displayPath: displayPath,
				ranges:      []string{lineRange},
			})
		}
	}

	// Sort by directory depth then alphabetically for stable output
	slices.SortStableFunc(files, func(a, b fileEntry) int {
		aDepth := strings.Count(a.displayPath, string(filepath.Separator))
		bDepth := strings.Count(b.displayPath, string(filepath.Separator))
		if aDepth != bDepth {
			return aDepth - bDepth
		}
		return strings.Compare(a.displayPath, b.displayPath)
	})

	result := make([]string, len(files))
	for i, f := range files {
		result[i] = f.displayPath + ":" + strings.Join(f.ranges, ", ")
	}
	return result
}

