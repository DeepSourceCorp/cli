package list

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/MakeNowJust/heredoc"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource/issues"
	"github.com/deepsourcelabs/cli/internal/cli/completion"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	issuesvc "github.com/deepsourcelabs/cli/internal/services/issues"
	"github.com/deepsourcelabs/cli/internal/vcs"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

const MAX_ISSUE_LIMIT = 100

type IssuesListOptions struct {
	FileArg           []string
	RepoArg           string
	AnalyzerArg       []string
	LimitArg          int
	OutputFilenameArg string
	JSONArg           bool
	CSVArg            bool
	SARIFArg          bool
	SelectedRemote    *vcs.RemoteData
	issuesData        []issues.Issue
	ptermTable        [][]string
}

func NewCmdIssuesList() *cobra.Command {
	opts := IssuesListOptions{
		FileArg:  []string{""},
		RepoArg:  "",
		LimitArg: 30,
	}

	doc := heredoc.Docf(`
		List issues reported by DeepSource.

		To list issues for the current repository:
		%[1]s

		To list issues for a specific repository, use the %[2]s flag:
		%[3]s

		To list issues for a specific analyzer, use the %[4]s flag:
		%[5]s

		To limit the number of issues reported, use the %[6]s flag:
		%[7]s

		To export listed issues to a file, use the %[8]s flag:
		%[9]s

		To export listed issues to a JSON file, use the %[10]s flag:
		%[11]s

		To export listed issues to a CSV file, use the %[12]s flag:
		%[13]s

		To export listed issues to a SARIF file, use the %[14]s flag:
		%[15]s
		`, style.Cyan("deepsource issues list"), style.Yellow("--repo"), style.Cyan("deepsource issues list --repo repo_name"), style.Yellow("--analyzer"), style.Cyan("deepsource issues list --analyzer python"), style.Yellow("--limit"), style.Cyan("deepsource issues list --limit 100"), style.Yellow("--output-file"), style.Cyan("deepsource issues list --output-file file_name"), style.Yellow("--json"), style.Cyan("deepsource issues list --json --output-file example.json"), style.Yellow("--csv"), style.Cyan("deepsource issues list --csv --output-file example.csv"), style.Yellow("--sarif"), style.Cyan("deepsource issues list --sarif --output-file example.sarif"))

	cmd := &cobra.Command{
		Use:   "list",
		Short: "List issues reported by DeepSource",
		Long:  doc,
		RunE: func(cmd *cobra.Command, args []string) error {
			opts.FileArg = args
			return opts.Run()
		},
	}

	// --repo, -r flag
	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "List the issues of the specified repository")

	// --analyzer, -a flag
	cmd.Flags().StringArrayVarP(&opts.AnalyzerArg, "analyzer", "a", nil, "List the issues for the specified analyzer")

	// --limit, -l flag
	cmd.Flags().IntVarP(&opts.LimitArg, "limit", "l", 30, "Fetch the issues upto the specified limit")

	// --output-file, -o flag
	cmd.Flags().StringVarP(&opts.OutputFilenameArg, "output-file", "o", "", "Output file to write the reported issues to")

	// --json flag
	cmd.Flags().BoolVar(&opts.JSONArg, "json", false, "Output reported issues in JSON format")

	// --csv flag
	cmd.Flags().BoolVar(&opts.CSVArg, "csv", false, "Output reported issues in CSV format")

	// --sarif flag
	cmd.Flags().BoolVar(&opts.SARIFArg, "sarif", false, "Output reported issues in SARIF format")

	_ = cmd.RegisterFlagCompletionFunc("repo", func(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective) {
		return completion.RepoCompletionCandidates(), cobra.ShellCompDirectiveNoFileComp
	})

	return cmd
}

// Execute the command
func (opts *IssuesListOptions) Run() (err error) {
	// The current limit of querying issues at once is 100.
	// If the limit passed by user is greater than 100, exit
	// with an error message
	if opts.LimitArg > MAX_ISSUE_LIMIT {
		return fmt.Errorf("The maximum allowed limit to fetch issues is 100. Found %d", opts.LimitArg)
	}

	// Fetch the list of issues using SDK (deepsource package) based on user input
	ctx := context.Background()
	svc := issuesvc.NewService(config.DefaultManager())
	result, err := svc.List(ctx, issuesvc.ListOptions{
		RepoArg:      opts.RepoArg,
		FileArgs:     opts.FileArg,
		AnalyzerArgs: opts.AnalyzerArg,
		Limit:        opts.LimitArg,
	})
	if err != nil {
		return err
	}
	opts.SelectedRemote = result.Remote
	opts.issuesData = result.Issues

	if opts.JSONArg {
		opts.exportJSON(opts.OutputFilenameArg)
	} else if opts.CSVArg {
		opts.exportCSV(opts.OutputFilenameArg)
	} else if opts.SARIFArg {
		opts.exportSARIF(opts.OutputFilenameArg)
	} else {
		opts.showIssues()
	}

	return nil
}

// Parses the SDK response and formats the data in the form of a table
// and renders it using pterm
func (opts *IssuesListOptions) showIssues() {
	// Create table header
	header := []string{"LOCATION", "ANALYZER", "CODE", "TITLE", "CATEGORY", "SEVERITY"}
	data := [][]string{header}

	// Get terminal width for column width calculation
	terminalWidth := pterm.GetTerminalWidth()
	if terminalWidth == 0 {
		terminalWidth = 120 // Default fallback
	}

	// Calculate column widths (6 columns total)
	// Allocate space: LOCATION (20%), ANALYZER (10%), CODE (10%), TITLE (35%), CATEGORY (15%), SEVERITY (10%)
	colWidths := []int{
		int(float64(terminalWidth) * 0.20), // LOCATION
		int(float64(terminalWidth) * 0.10), // ANALYZER
		int(float64(terminalWidth) * 0.10), // CODE
		int(float64(terminalWidth) * 0.35), // TITLE
		int(float64(terminalWidth) * 0.15), // CATEGORY
		int(float64(terminalWidth) * 0.10), // SEVERITY
	}

	// Get current working directory for relative path display
	cwd, _ := os.Getwd()

	// Add data rows
	for _, issue := range opts.issuesData {
		filePath := issue.Location.Path
		if cwd != "" && strings.HasPrefix(filePath, cwd) {
			filePath = strings.TrimPrefix(filePath, cwd+"/")
		}

		// Format location with start and end line numbers
		beginLine := issue.Location.Position.BeginLine
		endLine := issue.Location.Position.EndLine
		var issueLocation string
		if beginLine == endLine {
			issueLocation = fmt.Sprintf("%s:%d", filePath, beginLine)
		} else {
			issueLocation = fmt.Sprintf("%s:%d-%d", filePath, beginLine, endLine)
		}

		analyzerShortcode := issue.Analyzer.Shortcode
		issueCategory := issue.IssueCategory
		issueSeverity := formatSeverity(issue.IssueSeverity)
		issueCode := issue.IssueCode
		issueTitle := issue.IssueText

		// Wrap text for each column
		data = append(data, []string{
			wrapText(issueLocation, colWidths[0]),
			wrapText(analyzerShortcode, colWidths[1]),
			wrapText(issueCode, colWidths[2]),
			wrapText(issueTitle, colWidths[3]),
			wrapText(issueCategory, colWidths[4]),
			wrapText(issueSeverity, colWidths[5]),
		})
	}

	// Render table with header, boxed style, and row separators
	pterm.DefaultTable.WithHasHeader().WithBoxed().WithRowSeparator("-").WithHeaderRowSeparator("-").WithData(data).Render()
}

// formatSeverity formats severity with appropriate color styling
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

// Handles exporting issues as JSON
func (opts *IssuesListOptions) exportJSON(filename string) (err error) {
	issueJSON := convertJSON(opts.issuesData)
	data, err := json.MarshalIndent(issueJSON, "", "	")
	if err != nil {
		return err
	}

	if filename == "" {
		pterm.Println(string(data))
		return nil
	}

	if err = os.WriteFile(filename, data, 0o644); err != nil {
		return err
	}

	pterm.Printf("Saved issues to %s!\n", filename)
	return nil
}

// Handles exporting issues as CSV
func (opts *IssuesListOptions) exportCSV(filename string) error {
	records := convertCSV(opts.issuesData)

	if filename == "" {
		// write to stdout
		w := csv.NewWriter(os.Stdout)
		return w.WriteAll(records)
	}

	// create file
	file, err := os.Create(filename)
	if err != nil {
		return err
	}

	// write to file
	w := csv.NewWriter(file)
	w.WriteAll(records)
	if err := w.Error(); err != nil {
		return err
	}

	pterm.Printf("Saved issues to %s!\n", filename)
	return nil
}

// Handles exporting issues as a SARIF file
func (opts *IssuesListOptions) exportSARIF(filename string) (err error) {
	report := convertSARIF(opts.issuesData)
	if filename == "" {
		err = report.PrettyWrite(os.Stdout)
		if err != nil {
			return err
		}
		return nil
	}

	// write report to file
	if err := report.WriteFile(filename); err != nil {
		return err
	}
	pterm.Printf("Saved issues to %s!\n", filename)
	return nil
}
