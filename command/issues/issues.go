package issues

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"

	"github.com/MakeNowJust/heredoc"
	"github.com/deepsourcelabs/cli/command/cmddeps"
	"github.com/deepsourcelabs/cli/command/cmdutil"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/issues"
	issuesQuery "github.com/deepsourcelabs/cli/deepsource/issues/queries"
	"github.com/deepsourcelabs/cli/internal/cli/completion"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	clierrors "github.com/deepsourcelabs/cli/internal/errors"
	"github.com/deepsourcelabs/cli/internal/vcs"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
	"gopkg.in/yaml.v3"
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
	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "Repository to list issues for (owner/name)")

	// --limit, -l flag
	cmd.Flags().IntVarP(&opts.LimitArg, "limit", "l", 30, "Maximum number of issues to fetch")

	// --output, -o flag
	cmd.Flags().StringVarP(&opts.OutputFormat, "output", "o", "pretty", "Output format: pretty, json, yaml")

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
			"yaml\tYAML output",
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

	serverFilters := opts.buildServerFilters()

	var issuesList []issues.Issue
	switch {
	case opts.CommitOid != "":
		issuesList, err = client.GetRunIssuesFlat(ctx, opts.CommitOid, opts.LimitArg, serverFilters)
	case opts.PRNumber > 0:
		issuesList, err = client.GetPRIssues(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, opts.PRNumber, opts.LimitArg)
	case opts.DefaultBranch:
		issuesList, err = client.GetIssues(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, opts.LimitArg)
	default:
		var branchNameFunc func() (string, error)
		var commitLogFunc func(string) ([]string, error)
		if opts.deps != nil {
			branchNameFunc = opts.deps.BranchNameFunc
			commitLogFunc = opts.deps.CommitLogFunc
		}
		commitOid, branchName, runStatus, resolveErr := cmdutil.ResolveLatestRun(ctx, client, branchNameFunc, commitLogFunc)
		if resolveErr != nil {
			if branchName != "" && branchName == cmdutil.GetDefaultBranch() {
				issuesList, err = client.GetIssues(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, opts.LimitArg)
				break
			}
			return resolveErr
		}
		if cmdutil.IsRunInProgress(runStatus) {
			pterm.Info.Printfln("Analysis is still in progress for branch %q.", branchName)
			return nil
		}
		if cmdutil.IsRunTimedOut(runStatus) {
			pterm.Warning.Printfln("Analysis timed out for branch %q.", branchName)
			return nil
		}
		opts.CommitOid = commitOid
		opts.autoDetectedBranch = branchName
		issuesList, err = client.GetRunIssuesFlat(ctx, commitOid, opts.LimitArg, serverFilters)
	}
	if err != nil {
		return err
	}

	issuesList = opts.filterIssues(issuesList)
	opts.issues = issuesList

	switch opts.OutputFormat {
	case "json":
		return opts.outputJSON()
	case "yaml":
		return opts.outputYAML()
	default:
		return opts.outputHuman()
	}
}

// buildServerFilters returns RunIssuesFlatParams with server-side filters set
// for any filter that has exactly one value. Multi-value filters are left to
// client-side filtering.
func (opts *IssuesOptions) buildServerFilters() issuesQuery.RunIssuesFlatParams {
	var params issuesQuery.RunIssuesFlatParams
	if len(opts.SourceFilters) == 1 {
		v := strings.ToUpper(strings.TrimSpace(opts.SourceFilters[0]))
		params.Source = &v
	}
	if len(opts.CategoryFilters) == 1 {
		v := strings.ToUpper(strings.TrimSpace(opts.CategoryFilters[0]))
		params.Category = &v
	}
	if len(opts.SeverityFilters) == 1 {
		v := strings.ToUpper(strings.TrimSpace(opts.SeverityFilters[0]))
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

func (opts *IssuesOptions) outputHuman() error {
	if len(opts.issues) == 0 {
		if opts.hasFilters() {
			pterm.Info.Printfln("No issues matched the provided filters in %s on %s.", opts.repoSlug, opts.scopeLabel())
		} else {
			pterm.Info.Printfln("No issues found in %s on %s.", opts.repoSlug, opts.scopeLabel())
		}
		return nil
	}

	// Build severity counts for the summary box.
	sevCounts := map[string]int{}
	for _, issue := range opts.issues {
		sev := strings.ToUpper(issue.IssueSeverity)
		sevCounts[sev]++
	}

	// Build severity breakdown string (only non-zero severities, colored).
	var sevParts []string
	for _, sev := range []string{"CRITICAL", "MAJOR", "MINOR"} {
		if c := sevCounts[sev]; c > 0 {
			sevParts = append(sevParts, colorSeverity(sev, fmt.Sprintf("%d %s", c, strings.ToLower(humanizeSeverity(sev)))))
		}
	}

	scopeLabel := opts.scopeLabel()
	fmt.Println(pterm.Bold.Sprintf("── Issues · %s ────", scopeLabel))

	summaryLine := fmt.Sprintf("   %d total", len(opts.issues))
	if len(sevParts) > 0 {
		summaryLine += " · " + strings.Join(sevParts, " · ")
	}
	fmt.Println(summaryLine)

	catCounts := map[string]int{}
	for _, issue := range opts.issues {
		cat := strings.ToUpper(issue.IssueCategory)
		catCounts[cat]++
	}
	var catParts []string
	for _, cat := range []string{"BUG_RISK", "SECURITY", "ANTI_PATTERN", "PERFORMANCE", "STYLE", "DOCUMENTATION", "COVERAGE", "TYPECHECK"} {
		if c := catCounts[cat]; c > 0 {
			catParts = append(catParts, fmt.Sprintf("%d %s", c, strings.ToLower(humanizeCategory(cat))))
		}
	}
	if len(catParts) > 0 {
		fmt.Println("   " + strings.Join(catParts, " · "))
	}
	fmt.Println()

	cwd, _ := os.Getwd()

	// Group issues by category.
	grouped := map[string][]issues.Issue{}
	for _, issue := range opts.issues {
		cat := strings.ToUpper(issue.IssueCategory)
		grouped[cat] = append(grouped[cat], issue)
	}

	categoryOrder := []string{"BUG_RISK", "SECURITY", "ANTI_PATTERN", "PERFORMANCE", "STYLE", "DOCUMENTATION", "COVERAGE", "TYPECHECK"}
	first := true
	for _, cat := range categoryOrder {
		group, ok := grouped[cat]
		if !ok {
			continue
		}

		if !first {
			fmt.Println()
		}
		first = false

		fmt.Println(pterm.Bold.Sprintf("  ── %s ──", humanizeCategory(cat)))

		for i, issue := range group {
			location := formatLocation(issue, cwd)
			severity := humanizeSeverity(issue.IssueSeverity)
			analyzer := analyzerDisplayName(issue.Analyzer)

			sevTag := colorSeverity(issue.IssueSeverity, "["+severity+"]")
			fmt.Printf("  %s  [%s] %s\n", issue.IssueText, analyzer, sevTag)
			if opts.Verbose && issue.Description != "" {
				fmt.Printf("  %s\n", pterm.Gray(issue.Description))
			}
			fmt.Printf("  %s\n", pterm.Gray(location))
			if i < len(group)-1 {
				fmt.Println()
			}
		}
	}

	fmt.Printf("\nShowing %d issue(s) in %s from %s\n", len(opts.issues), opts.repoSlug, scopeLabel)

	return nil
}

// --- JSON/YAML output ---

type IssueJSON struct {
	Path      string `json:"path" yaml:"path"`
	BeginLine int    `json:"begin_line" yaml:"begin_line"`
	EndLine   int    `json:"end_line" yaml:"end_line"`
	IssueCode string `json:"issue_code" yaml:"issue_code"`
	Title     string `json:"title" yaml:"title"`
	Category  string `json:"category" yaml:"category"`
	Severity  string `json:"severity" yaml:"severity"`
	Source    string `json:"source" yaml:"source"`
	Analyzer  string `json:"analyzer" yaml:"analyzer"`
}

func (opts *IssuesOptions) toJSONIssues() []IssueJSON {
	result := make([]IssueJSON, 0, len(opts.issues))
	for _, issue := range opts.issues {
		result = append(result, IssueJSON{
			Path:      issue.Location.Path,
			BeginLine: issue.Location.Position.BeginLine,
			EndLine:   issue.Location.Position.EndLine,
			IssueCode: issue.IssueCode,
			Title:     issue.IssueText,
			Category:  issue.IssueCategory,
			Severity:  issue.IssueSeverity,
			Source:    issue.IssueSource,
			Analyzer:  issue.Analyzer.Shortcode,
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

func (opts *IssuesOptions) outputYAML() error {
	data, err := yaml.Marshal(opts.toJSONIssues())
	if err != nil {
		return clierrors.NewCLIError(clierrors.ErrAPIError, "Failed to format YAML output", err)
	}
	return opts.writeOutput(data, false)
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

func analyzerDisplayName(meta issues.AnalyzerMeta) string {
	if meta.Name != "" {
		return meta.Name
	}
	return meta.Shortcode
}

func colorSeverity(sev string, text string) string {
	switch strings.ToUpper(sev) {
	case "CRITICAL":
		return pterm.Red(text)
	case "MAJOR":
		return pterm.LightRed(text)
	case "MINOR":
		return pterm.Yellow(text)
	default:
		return text
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

