package issues

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/MakeNowJust/heredoc"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/issues"
	"github.com/deepsourcelabs/cli/internal/cli/completion"
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
	Verbose         bool
	CategoryFilters []string
	SeverityFilters []string
	CodeFilters     []string
	PathFilters     []string
	SourceFilters   []string
	CommitOid          string
	PRNumber        int
	repoSlug        string
	issues          []issues.Issue
}

// NewCmdIssues returns the issues command
func NewCmdIssues() *cobra.Command {
	opts := IssuesOptions{
		LimitArg:     30,
		OutputFormat: "human",
	}

	doc := heredoc.Doc(`
		List issues in a repository.

		By default, lists issues from the default branch. Use --run or --pr
		to scope to a specific run or pull request.

		Examples:
		  deepsource issues
		  deepsource issues --repo owner/repo
		  deepsource issues --run abc123f
		  deepsource issues --pr 123
		  deepsource issues --severity critical --category security,bug-risk
	`)

	cmd := &cobra.Command{
		Use:   "issues",
		Short: "List issues from the default branch",
		Long:  doc,
		RunE: func(cmd *cobra.Command, args []string) error {
			return opts.Run(cmd.Context())
		},
	}

	// --repo, -r flag
	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "Repository to list issues for (owner/name)")

	// --limit, -l flag
	cmd.Flags().IntVarP(&opts.LimitArg, "limit", "l", 30, "Maximum number of issues to fetch")

	// --output flag
	cmd.Flags().StringVarP(&opts.OutputFormat, "output", "o", "human", "Output format: human, json, yaml")

	// --verbose, -v flag
	cmd.Flags().BoolVarP(&opts.Verbose, "verbose", "v", false, "Show issue code, analyzer, and description")

	// Scoping flags
	cmd.Flags().StringVar(&opts.CommitOid, "run", "", "Scope to a specific run by commit OID")
	cmd.Flags().IntVar(&opts.PRNumber, "pr", 0, "Scope to a specific pull request by number")

	// Filter flags
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
			"human\tHuman-readable grouped output",
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
	cmd.MarkFlagsMutuallyExclusive("run", "pr")

	return cmd
}

func (opts *IssuesOptions) Run(ctx context.Context) error {
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
	opts.repoSlug = remote.Owner + "/" + remote.RepoName

	// Create DeepSource client
	client, err := deepsource.New(deepsource.ClientOpts{
		Token:            cfg.Token,
		HostName:         cfg.Host,
		OnTokenRefreshed: cfgMgr.TokenRefreshCallback(),
	})
	if err != nil {
		return err
	}

	// Fetch issues based on scope
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

	// Apply filters
	issuesList = opts.filterIssues(issuesList)
	opts.issues = issuesList

	// Output based on format
	switch opts.OutputFormat {
	case "json":
		return opts.outputJSON()
	case "yaml":
		return opts.outputYAML()
	default:
		return opts.outputHuman()
	}
}

func (opts *IssuesOptions) hasFilters() bool {
	return len(opts.CategoryFilters) > 0 ||
		len(opts.SeverityFilters) > 0 ||
		len(opts.CodeFilters) > 0 ||
		len(opts.PathFilters) > 0 ||
		len(opts.SourceFilters) > 0
}

func (opts *IssuesOptions) filterIssues(issuesList []issues.Issue) []issues.Issue {
	if !opts.hasFilters() {
		return issuesList
	}

	categorySet := makeStringSet(opts.CategoryFilters)
	severitySet := makeStringSet(opts.SeverityFilters)
	codeSet := makeStringSet(opts.CodeFilters)
	sourceSet := makeStringSet(opts.SourceFilters)
	pathFilters := makeLowerStrings(opts.PathFilters)

	filtered := make([]issues.Issue, 0, len(issuesList))
	for _, issue := range issuesList {
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
		// Handle both underscore and hyphen formats
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

func (opts *IssuesOptions) outputHuman() error {
	if len(opts.issues) == 0 {
		if opts.hasFilters() {
			pterm.Info.Println("No issues matched the provided filters.")
		} else {
			pterm.Info.Println("No issues found.")
		}
		return nil
	}

	// Get current working directory for relative path display
	cwd, _ := os.Getwd()

	// Group issues by severity
	order := []string{"CRITICAL", "MAJOR", "MINOR"}
	groups := make(map[string][]issues.Issue)
	for _, issue := range opts.issues {
		sev := strings.ToUpper(issue.IssueSeverity)
		groups[sev] = append(groups[sev], issue)
	}

	for _, sev := range order {
		group, ok := groups[sev]
		if !ok || len(group) == 0 {
			continue
		}

		// Colored severity header with count
		header := fmt.Sprintf("%s (%d)", humanizeSeverity(sev), len(group))
		fmt.Println(colorSeverity(sev, header))
		fmt.Println()

		for _, issue := range group {
			location := formatLocation(issue, cwd)
			category := humanizeCategory(issue.IssueCategory)
			fmt.Printf("  %s: %s (%s)\n", category, issue.IssueText, location)

			if opts.Verbose {
				analyzer := analyzerDisplayName(issue.Analyzer)
				fmt.Printf("    %s · %s\n", issue.IssueCode, analyzer)
				if issue.Description != "" {
					fmt.Printf("    %s\n", issue.Description)
				}
				fmt.Println()
			}
		}

		if !opts.Verbose {
			fmt.Println()
		}
	}

	// Footer
	fmt.Printf("Showing %d issue(s) in %s", len(opts.issues), opts.repoSlug)
	switch {
	case opts.CommitOid != "":
		fmt.Printf(" from run %s\n", opts.CommitOid)
	case opts.PRNumber > 0:
		fmt.Printf(" from PR #%d\n", opts.PRNumber)
	default:
		fmt.Println(" from default branch")
	}
	return nil
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

func formatLocation(issue issues.Issue, cwd string) string {
	filePath := issue.Location.Path
	if cwd != "" && strings.HasPrefix(filePath, cwd) {
		filePath = strings.TrimPrefix(filePath, cwd+"/")
	}
	if issue.Location.Position.BeginLine == issue.Location.Position.EndLine {
		return fmt.Sprintf("%s:%d", filePath, issue.Location.Position.BeginLine)
	}
	return fmt.Sprintf("%s:%d-%d", filePath, issue.Location.Position.BeginLine, issue.Location.Position.EndLine)
}

// IssueJSON represents an issue in JSON/YAML output
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
	fmt.Println(string(data))
	return nil
}

func (opts *IssuesOptions) outputYAML() error {
	data, err := yaml.Marshal(opts.toJSONIssues())
	if err != nil {
		return clierrors.NewCLIError(clierrors.ErrAPIError, "Failed to format YAML output", err)
	}
	fmt.Print(string(data))
	return nil
}
