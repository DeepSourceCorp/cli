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
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/issues"
	"github.com/deepsourcelabs/cli/internal/cli/completion"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	clierrors "github.com/deepsourcelabs/cli/internal/errors"
	"github.com/deepsourcelabs/cli/internal/vcs"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
	"gopkg.in/yaml.v3"
)

type IssuesOptions struct {
	RepoArg         string
	LimitArg        int
	OutputFormat    string
	OutputFile      string
	Verbose         bool
	AnalyzerFilters []string
	CategoryFilters []string
	SeverityFilters []string
	CodeFilters     []string
	PathFilters     []string
	SourceFilters   []string
	CommitOid       string
	PRNumber        int
	repoSlug        string
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

		Lists issues from the default branch by default:
		  %[1]s

		Scope to a specific commit or pull request:
		  %[2]s
		  %[3]s

		Output as a table or structured format:
		  %[4]s
		  %[5]s
		`,
		style.Cyan("deepsource issues"),
		style.Cyan("deepsource issues --commit abc123f"),
		style.Cyan("deepsource issues --pr 123"),
		style.Cyan("deepsource issues --output table"),
		style.Cyan("deepsource issues --output json"),
	)

	cmd := &cobra.Command{
		Use:   "issues [flags]",
		Short: "View issues in a repository",
		Long:  doc,
		RunE: func(cmd *cobra.Command, args []string) error {
			return opts.Run(cmd.Context())
		},
	}

	// --repo, -r flag
	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "Repository to list issues for (owner/name)")

	// --limit, -l flag
	cmd.Flags().IntVarP(&opts.LimitArg, "limit", "l", 30, "Maximum number of issues to fetch")

	// --output, -o flag
	cmd.Flags().StringVarP(&opts.OutputFormat, "output", "o", "pretty", "Output format: pretty, table, json, yaml")

	// --output-file flag
	cmd.Flags().StringVar(&opts.OutputFile, "output-file", "", "Write output to a file instead of stdout")

	// --verbose, -v flag
	cmd.Flags().BoolVarP(&opts.Verbose, "verbose", "v", false, "Show issue description")

	// Scoping flags
	cmd.Flags().StringVar(&opts.CommitOid, "commit", "", "Scope to a specific analysis run by commit OID")
	cmd.Flags().IntVar(&opts.PRNumber, "pr", 0, "Scope to a specific pull request by number")

	// Filter flags
	cmd.Flags().StringSliceVar(&opts.AnalyzerFilters, "analyzer", nil, "Filter by analyzer shortcode (e.g. python,go)")
	cmd.Flags().StringSliceVar(&opts.CategoryFilters, "category", nil, "Filter by category (e.g. security,bug-risk)")
	cmd.Flags().StringSliceVar(&opts.SeverityFilters, "severity", nil, "Filter by severity (e.g. critical,major)")
	cmd.Flags().StringSliceVar(&opts.CodeFilters, "code", nil, "Filter by issue code (e.g. GO-R1005)")
	cmd.Flags().StringSliceVar(&opts.PathFilters, "path", nil, "Filter by path substring (e.g. cmd/,internal/)")
	cmd.Flags().StringSliceVar(&opts.SourceFilters, "source", nil, "Filter by source (static, ai)")

	// Completions
	_ = cmd.RegisterFlagCompletionFunc("repo", func(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective) {
		return completion.RepoCompletionCandidates(), cobra.ShellCompDirectiveNoFileComp
	})
	_ = cmd.RegisterFlagCompletionFunc("output", func(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective) {
		return []string{
			"pretty\tPretty-printed grouped output",
			"table\tTable output",
			"json\tJSON output",
			"yaml\tYAML output",
		}, cobra.ShellCompDirectiveNoFileComp
	})
	_ = cmd.RegisterFlagCompletionFunc("category", func(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective) {
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
	_ = cmd.RegisterFlagCompletionFunc("severity", func(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective) {
		return []string{"critical", "major", "minor"}, cobra.ShellCompDirectiveNoFileComp
	})

	// Mutual exclusivity
	cmd.MarkFlagsMutuallyExclusive("commit", "pr")

	return cmd
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

	var issuesList []issues.Issue
	switch {
	case opts.CommitOid != "":
		issuesList, err = client.GetRunIssuesFlat(ctx, opts.CommitOid, opts.LimitArg)
	case opts.PRNumber > 0:
		issuesList, err = client.GetPRIssues(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, opts.PRNumber, opts.LimitArg)
	default:
		issuesList, err = client.GetIssues(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, opts.LimitArg)
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
	case "table":
		return opts.outputTable()
	default:
		return opts.outputHuman()
	}
}

// --- Filters ---

func (opts *IssuesOptions) hasFilters() bool {
	return len(opts.AnalyzerFilters) > 0 ||
		len(opts.CategoryFilters) > 0 ||
		len(opts.SeverityFilters) > 0 ||
		len(opts.CodeFilters) > 0 ||
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
	codeSet := makeStringSet(opts.CodeFilters)
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
		if len(codeSet) > 0 && !setContainsFold(codeSet, issue.IssueCode) {
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

type codeGroup struct {
	issue     issues.Issue
	locations []issues.Location
}

type categoryGroup struct {
	category string
	codes    []codeGroup
	total    int
}

// groupByCategoryAndCode groups issues first by category (preserving first-seen order),
// then by issue code within each category.
func groupByCategoryAndCode(list []issues.Issue) []categoryGroup {
	catOrder := []string{}
	catMap := map[string]*categoryGroup{}

	for _, issue := range list {
		cat := issue.IssueCategory
		cg, catExists := catMap[cat]
		if !catExists {
			catOrder = append(catOrder, cat)
			cg = &categoryGroup{category: cat}
			catMap[cat] = cg
		}

		found := false
		for i := range cg.codes {
			if cg.codes[i].issue.IssueCode == issue.IssueCode {
				cg.codes[i].locations = append(cg.codes[i].locations, issue.Location)
				found = true
				break
			}
		}
		if !found {
			cg.codes = append(cg.codes, codeGroup{
				issue:     issue,
				locations: []issues.Location{issue.Location},
			})
		}
		cg.total++
	}

	result := make([]categoryGroup, 0, len(catOrder))
	for _, cat := range catOrder {
		result = append(result, *catMap[cat])
	}
	return result
}

const ruledLineWidth = 55

func severityRuledHeader(sev string, count int) string {
	label := fmt.Sprintf("── %s (%d) ", humanizeSeverity(sev), count)
	pad := ruledLineWidth - len(label)
	if pad < 3 {
		pad = 3
	}
	line := label + strings.Repeat("─", pad)
	return colorSeverity(sev, line)
}

func (opts *IssuesOptions) outputHuman() error {
	if len(opts.issues) == 0 {
		if opts.hasFilters() {
			pterm.Info.Println("No issues matched the provided filters.")
		} else {
			pterm.Info.Println("No issues found.")
		}
		return nil
	}

	cwd, _ := os.Getwd()

	order := []string{"CRITICAL", "MAJOR", "MINOR"}
	groups := make(map[string][]issues.Issue)
	for _, issue := range opts.issues {
		sev := strings.ToUpper(issue.IssueSeverity)
		groups[sev] = append(groups[sev], issue)
	}

	for _, sev := range order {
		sevGroup, ok := groups[sev]
		if !ok || len(sevGroup) == 0 {
			continue
		}

		fmt.Println(severityRuledHeader(sev, len(sevGroup)))
		fmt.Println()

		catGroups := groupByCategoryAndCode(sevGroup)
		for _, cg := range catGroups {
			fmt.Printf("  %s (%d)\n\n", humanizeCategory(cg.category), cg.total)

			for _, ig := range cg.codes {
				fmt.Printf("    %s %s\n", pterm.Bold.Sprint("✗"), pterm.Bold.Sprint(ig.issue.IssueText))

				analyzer := analyzerDisplayName(ig.issue.Analyzer)
				meta := fmt.Sprintf("%s · %s", ig.issue.IssueCode, analyzer)
				if len(ig.locations) > 1 {
					meta += fmt.Sprintf(" (%d occurrences)", len(ig.locations))
				}
				fmt.Printf("      %s\n", pterm.Gray(meta))

				for _, loc := range ig.locations {
					fmt.Printf("      %s\n", pterm.Gray(formatLocationFromParts(loc, cwd)))
				}

				if opts.Verbose && ig.issue.Description != "" {
					desc := ig.issue.Description
					if idx := strings.IndexByte(desc, '\n'); idx != -1 {
						desc = desc[:idx]
					}
					fmt.Printf("      %s\n", pterm.Gray(desc))
				}

				fmt.Println()
			}
		}
	}

	fmt.Println(strings.Repeat("─", ruledLineWidth))

	scope := "default branch"
	switch {
	case opts.CommitOid != "":
		scope = "commit " + opts.CommitOid
	case opts.PRNumber > 0:
		scope = fmt.Sprintf("PR #%d", opts.PRNumber)
	}
	fmt.Printf("%d issues · %s · %s\n", len(opts.issues), opts.repoSlug, scope)

	return nil
}

// --- Table output ---

func (opts *IssuesOptions) outputTable() error {
	if len(opts.issues) == 0 {
		if opts.hasFilters() {
			pterm.Info.Println("No issues matched the provided filters.")
		} else {
			pterm.Info.Println("No issues found.")
		}
		return nil
	}

	showSource := opts.CommitOid != "" || opts.PRNumber > 0

	var header []string
	if showSource {
		header = []string{"Location", "Source", "Analyzer", "Code", "Title", "Category", "Severity"}
	} else {
		header = []string{"Location", "Analyzer", "Code", "Title", "Category", "Severity"}
	}
	data := [][]string{header}

	cwd, _ := os.Getwd()

	for _, issue := range opts.issues {
		location := formatLocation(issue, cwd)
		severity := formatSeverity(issue.IssueSeverity)
		category := humanizeCategory(issue.IssueCategory)
		analyzer := analyzerDisplayName(issue.Analyzer)

		if showSource {
			data = append(data, []string{
				location,
				issue.IssueSource,
				analyzer,
				issue.IssueCode,
				issue.IssueText,
				category,
				severity,
			})
		} else {
			data = append(data, []string{
				location,
				analyzer,
				issue.IssueCode,
				issue.IssueText,
				category,
				severity,
			})
		}
	}

	pterm.DefaultTable.WithHasHeader().WithData(data).Render()
	pterm.Printf("\nShowing %d issue(s)\n", len(opts.issues))

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
	if opts.OutputFile == "" {
		w := opts.stdout()
		if trailingNewline {
			fmt.Fprintln(w, string(data))
		} else {
			fmt.Fprint(w, string(data))
		}
		return nil
	}

	if err := os.WriteFile(opts.OutputFile, data, 0644); err != nil {
		return clierrors.NewCLIError(clierrors.ErrAPIError, "Failed to write output file", err)
	}
	pterm.Printf("Saved issues to %s!\n", opts.OutputFile)
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

func formatSeverity(severity string) string {
	humanized := humanizeSeverity(severity)
	switch strings.ToUpper(severity) {
	case "CRITICAL":
		return pterm.Red(humanized)
	case "MAJOR":
		return pterm.LightRed(humanized)
	case "MINOR":
		return pterm.Yellow(humanized)
	default:
		return humanized
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

