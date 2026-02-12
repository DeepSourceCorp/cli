package issues

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"github.com/MakeNowJust/heredoc"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/runs"
	"github.com/deepsourcelabs/cli/internal/cli/args"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	clierrors "github.com/deepsourcelabs/cli/internal/errors"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
	"gopkg.in/yaml.v3"
)

type IssuesOptions struct {
	commitOid       string
	outputFormat    string
	outputFile      string
	analyzerFilters []string
	categoryFilters []string
	severityFilters []string
	codeFilters     []string
	pathFilters     []string
	sourceFilters   []string
	runWithIssues   *runs.RunWithIssues
}

// AddRunIssueFlags registers flags for filtering and output options.
func AddRunIssueFlags(cmd *cobra.Command, opts *IssuesOptions) {
	// --output flag (replaces --json)
	cmd.Flags().StringVar(&opts.outputFormat, "output", "table", "Output format: table, json, yaml")

	// --output-file flag
	cmd.Flags().StringVar(&opts.outputFile, "output-file", "", "Output file to write the issues to")

	// filter flags
	cmd.Flags().StringArrayVar(&opts.analyzerFilters, "analyzer", nil, "Filter issues by analyzer shortcode (repeatable)")
	cmd.Flags().StringArrayVar(&opts.categoryFilters, "category", nil, "Filter issues by category (repeatable)")
	cmd.Flags().StringArrayVar(&opts.severityFilters, "severity", nil, "Filter issues by severity (repeatable)")
	cmd.Flags().StringArrayVar(&opts.codeFilters, "code", nil, "Filter issues by issue code (repeatable)")
	cmd.Flags().StringArrayVar(&opts.pathFilters, "path", nil, "Filter issues by path substring (repeatable)")
	cmd.Flags().StringArrayVar(&opts.sourceFilters, "source", nil, "Filter issues by source: static, ai (repeatable)")

	_ = cmd.RegisterFlagCompletionFunc("output", func(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective) {
		return []string{
			"table\tHuman-readable table",
			"json\tJSON output",
			"yaml\tYAML output",
		}, cobra.ShellCompDirectiveNoFileComp
	})
}

// NewCmdRunsIssues shows the issues in a specific analysis run.
func NewCmdRunsIssues() *cobra.Command {
	doc := heredoc.Docf(`
		View issues in a specific analysis run.

		Use %[1]s to view the issues found in a specific run.
		Filter issues by analyzer, category, severity, issue code, or path when needed.
	`, style.Cyan("deepsource runs <commit-oid>"))

	opts := IssuesOptions{}

	cmd := &cobra.Command{
		Use:   "issues <commit-oid>",
		Short: "View issues in a specific analysis run",
		Long:  doc,
		Args:  args.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			opts.commitOid = args[0]
			return opts.Run(cmd.Context())
		},
	}

	AddRunIssueFlags(cmd, &opts)

	return cmd
}

// RunWithCommit runs the command for the provided commit OID.
func (opts *IssuesOptions) RunWithCommit(ctx context.Context, commitOid string) error {
	opts.commitOid = commitOid
	return opts.Run(ctx)
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

	// Expand commit OID to full SHA if it's a short one
	commitOid, err := expandCommitOID(opts.commitOid)
	if err != nil {
		return clierrors.NewCLIError(clierrors.ErrGitOperationFailed, "Failed to expand commit OID", err)
	}

	// Initialize DeepSource client
	dsClient, err := deepsource.New(deepsource.ClientOpts{
		Token:            cfg.Token,
		HostName:         cfg.Host,
		OnTokenRefreshed: cfgMgr.TokenRefreshCallback(),
	})
	if err != nil {
		return err
	}

	// Fetch run with issues
	runWithIssues, err := dsClient.GetRunIssues(ctx, commitOid)
	if err != nil {
		return clierrors.NewCLIError(clierrors.ErrAPIError, "Failed to fetch run issues", err)
	}

	// Apply filters, if any
	runWithIssues.Issues = opts.filterIssues(runWithIssues.Issues)

	opts.runWithIssues = runWithIssues

	// If non-table output is requested, export and return
	if opts.outputFormat == "json" || opts.outputFormat == "yaml" {
		return opts.exportOutput(opts.outputFile)
	}

	// Display run info
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

	if len(runWithIssues.Issues) == 0 {
		pterm.Println("")
		if opts.hasFilters() {
			pterm.Success.Println("No issues matched the provided filters")
		} else {
			pterm.Success.Println("No issues found in this run")
		}
		return nil
	}

	// Display issues table
	pterm.Println("")
	pterm.Println(pterm.Bold.Sprintf("Found %d issue(s)", len(runWithIssues.Issues)))
	opts.showIssues(runWithIssues.Issues)

	return nil
}

func (opts *IssuesOptions) hasFilters() bool {
	return len(opts.analyzerFilters) > 0 ||
		len(opts.categoryFilters) > 0 ||
		len(opts.severityFilters) > 0 ||
		len(opts.codeFilters) > 0 ||
		len(opts.pathFilters) > 0 ||
		len(opts.sourceFilters) > 0
}

func (opts *IssuesOptions) filterIssues(issues []runs.RunIssue) []runs.RunIssue {
	if !opts.hasFilters() {
		return issues
	}

	analyzerSet := makeStringSet(opts.analyzerFilters)
	categorySet := makeStringSet(opts.categoryFilters)
	severitySet := makeStringSet(opts.severityFilters)
	codeSet := makeStringSet(opts.codeFilters)
	sourceSet := makeStringSet(opts.sourceFilters)
	pathFilters := makeLowerStrings(opts.pathFilters)

	filtered := make([]runs.RunIssue, 0, len(issues))
	for _, issue := range issues {
		if len(analyzerSet) > 0 && !setContainsFold(analyzerSet, issue.AnalyzerShortcode) {
			continue
		}
		if len(categorySet) > 0 && !setContainsFold(categorySet, issue.Category) {
			continue
		}
		if len(severitySet) > 0 && !setContainsFold(severitySet, issue.Severity) {
			continue
		}
		if len(codeSet) > 0 && !setContainsFold(codeSet, issue.IssueCode) {
			continue
		}
		if len(sourceSet) > 0 && !setContainsFold(sourceSet, issue.Source) {
			continue
		}
		if len(pathFilters) > 0 && !matchesPathFilters(issue.Path, pathFilters) {
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
	_, ok := set[strings.ToLower(strings.TrimSpace(value))]
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

func (opts *IssuesOptions) showIssues(issues []runs.RunIssue) {
	header := []string{"LOCATION", "SOURCE", "ANALYZER", "CODE", "TITLE", "CATEGORY", "SEVERITY"}
	data := [][]string{header}

	// Get terminal width for column width calculation
	terminalWidth := pterm.GetTerminalWidth()
	if terminalWidth == 0 {
		terminalWidth = 120 // Default fallback
	}

	// Calculate column widths (7 columns total)
	colWidths := []int{
		int(float64(terminalWidth) * 0.18), // LOCATION
		int(float64(terminalWidth) * 0.08), // SOURCE
		int(float64(terminalWidth) * 0.10), // ANALYZER
		int(float64(terminalWidth) * 0.10), // CODE
		int(float64(terminalWidth) * 0.30), // TITLE
		int(float64(terminalWidth) * 0.14), // CATEGORY
		int(float64(terminalWidth) * 0.10), // SEVERITY
	}

	// Get current working directory for relative path display
	cwd, _ := os.Getwd()

	for _, issue := range issues {
		// Format location with start and end line numbers
		filePath := issue.Path
		if cwd != "" && strings.HasPrefix(filePath, cwd) {
			filePath = strings.TrimPrefix(filePath, cwd+"/")
		}
		// Show both begin and end line numbers
		var issueLocation string
		if issue.BeginLine == issue.EndLine {
			issueLocation = fmt.Sprintf("%s:%d", filePath, issue.BeginLine)
		} else {
			issueLocation = fmt.Sprintf("%s:%d-%d", filePath, issue.BeginLine, issue.EndLine)
		}

		// Format severity with color
		severity := formatSeverity(issue.Severity)

		// Wrap text for each column
		data = append(data, []string{
			wrapText(issueLocation, colWidths[0]),
			wrapText(issue.Source, colWidths[1]),
			wrapText(issue.AnalyzerShortcode, colWidths[2]),
			wrapText(issue.IssueCode, colWidths[3]),
			wrapText(issue.Title, colWidths[4]),
			wrapText(issue.Category, colWidths[5]),
			wrapText(severity, colWidths[6]),
		})
	}

	pterm.DefaultTable.WithHasHeader().WithBoxed().WithRowSeparator("-").WithHeaderRowSeparator("-").WithData(data).Render()
}

func formatStatus(status string) string {
	switch strings.ToUpper(status) {
	case "SUCCESS":
		return pterm.Green(status)
	case "FAILURE":
		return pterm.Red(status)
	case "PENDING":
		return pterm.Yellow(status)
	case "RUNNING":
		return pterm.Blue(status)
	default:
		return status
	}
}

func formatSeverity(severity string) string {
	switch strings.ToUpper(severity) {
	case "CRITICAL":
		return pterm.Red(severity)
	case "MAJOR":
		return pterm.LightRed(severity)
	case "MINOR":
		return pterm.Yellow(severity)
	default:
		return severity
	}
}

// wrapText wraps text to fit within the specified width, inserting newlines for multiline cells
func wrapText(text string, maxWidth int) string {
	if maxWidth <= 0 {
		return text
	}

	// If text fits, return as-is
	if len(text) <= maxWidth {
		return text
	}

	// Split text into words for better wrapping
	words := strings.Fields(text)
	if len(words) == 0 {
		return text
	}

	var lines []string
	var currentLine strings.Builder

	for _, word := range words {
		// If adding this word would exceed the width, start a new line
		if currentLine.Len() > 0 && currentLine.Len()+len(word)+1 > maxWidth {
			lines = append(lines, currentLine.String())
			currentLine.Reset()
		}

		// If a single word is longer than maxWidth, we have to break it
		if len(word) > maxWidth {
			// If we have content in current line, save it first
			if currentLine.Len() > 0 {
				lines = append(lines, currentLine.String())
				currentLine.Reset()
			}
			// Break the long word
			for len(word) > maxWidth {
				lines = append(lines, word[:maxWidth])
				word = word[maxWidth:]
			}
			if len(word) > 0 {
				currentLine.WriteString(word)
			}
		} else {
			// Add word to current line
			if currentLine.Len() > 0 {
				currentLine.WriteString(" ")
			}
			currentLine.WriteString(word)
		}
	}

	// Add the last line if it has content
	if currentLine.Len() > 0 {
		lines = append(lines, currentLine.String())
	}

	return strings.Join(lines, "\n")
}

// expandCommitOID expands a short commit SHA to a full 40-character SHA using git rev-parse
func expandCommitOID(commitOid string) (string, error) {
	// If it's already a full SHA (40 chars for SHA-1, 64 for SHA-256), return as-is
	if len(commitOid) == 40 || len(commitOid) == 64 {
		return commitOid, nil
	}

	// Try to expand using git rev-parse
	cmd := exec.Command("git", "rev-parse", commitOid)
	output, err := cmd.Output()
	if err != nil {
		// If git rev-parse fails, return the original (might be valid in some contexts)
		return commitOid, nil
	}

	// Trim whitespace and return
	expanded := strings.TrimSpace(string(output))
	if expanded != "" {
		return expanded, nil
	}

	return commitOid, nil
}

// RunIssuesJSON represents the JSON structure for run issues output
type RunIssuesJSON struct {
	RunUid     string       `json:"run_uid"`
	CommitOid  string       `json:"commit_oid"`
	BranchName string       `json:"branch_name"`
	Status     string       `json:"status"`
	Issues     []IssueJSON  `json:"issues"`
}

// IssueJSON represents an issue in JSON format
type IssueJSON struct {
	Path              string    `json:"path"`
	BeginLine         int       `json:"begin_line"`
	BeginColumn       int       `json:"begin_column"`
	EndLine           int       `json:"end_line"`
	EndColumn         int       `json:"end_column"`
	IssueText         string    `json:"issue_text"`
	IssueCode         string    `json:"issue_code"`
	Title             string    `json:"title"`
	Category          string    `json:"category"`
	Severity          string    `json:"severity"`
	Source            string    `json:"source"`
	AnalyzerName      string    `json:"analyzer_name"`
	AnalyzerShortcode string    `json:"analyzer_shortcode"`
}

// exportOutput exports the run issues to JSON or YAML format
func (opts *IssuesOptions) exportOutput(filename string) error {
	if opts.runWithIssues == nil {
		return clierrors.NewCLIError(clierrors.ErrAPIError, "No run data available to export", nil)
	}

	// Convert to JSON structure
	jsonData := RunIssuesJSON{
		RunUid:     opts.runWithIssues.RunUid,
		CommitOid:  opts.runWithIssues.CommitOid,
		BranchName: opts.runWithIssues.BranchName,
		Status:     opts.runWithIssues.Status,
		Issues:     make([]IssueJSON, 0, len(opts.runWithIssues.Issues)),
	}

	for _, issue := range opts.runWithIssues.Issues {
		jsonData.Issues = append(jsonData.Issues, IssueJSON{
			Path:              issue.Path,
			BeginLine:         issue.BeginLine,
			BeginColumn:       issue.BeginColumn,
			EndLine:           issue.EndLine,
			EndColumn:         issue.EndColumn,
			IssueText:         issue.IssueText,
			IssueCode:         issue.IssueCode,
			Title:             issue.Title,
			Category:          issue.Category,
			Severity:          issue.Severity,
			Source:            issue.Source,
			AnalyzerName:      issue.AnalyzerName,
			AnalyzerShortcode: issue.AnalyzerShortcode,
		})
	}

	// Marshal based on format
	var data []byte
	var err error
	switch opts.outputFormat {
	case "yaml":
		data, err = yaml.Marshal(jsonData)
		if err != nil {
			return clierrors.NewCLIError(clierrors.ErrAPIError, "Failed to format YAML output", err)
		}
	default: // json
		data, err = json.MarshalIndent(jsonData, "", "  ")
		if err != nil {
			return clierrors.NewCLIError(clierrors.ErrAPIError, "Failed to format JSON output", err)
		}
	}

	// Write to file or stdout
	if filename == "" {
		if opts.outputFormat == "yaml" {
			fmt.Print(string(data))
		} else {
			fmt.Println(string(data))
		}
		return nil
	}

	if err := os.WriteFile(filename, data, 0644); err != nil {
		return clierrors.NewCLIError(clierrors.ErrAPIError, "Failed to write output file", err)
	}

	pterm.Printf("Saved issues to %s!\n", filename)
	return nil
}
