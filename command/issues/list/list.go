package list

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"

	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/issues"
	"github.com/deepsourcelabs/cli/utils"
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
	SelectedRemote    *utils.RemoteData
	issuesData        []issues.Issue
	ptermTable        [][]string
}

func NewCmdIssuesList() *cobra.Command {
	opts := IssuesListOptions{
		FileArg:  []string{""},
		RepoArg:  "",
		LimitArg: 30,
	}

	cmd := &cobra.Command{
		Use:   "list",
		Short: "List issues reported by DeepSource",
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

	return cmd
}

// Execute the command
func (opts *IssuesListOptions) Run() (err error) {
	// Fetch config
	cfg, err := config.GetConfig()
	if err != nil {
		return fmt.Errorf("Error while reading DeepSource CLI config : %v", err)
	}
	err = cfg.VerifyAuthentication()
	if err != nil {
		return err
	}

	// The current limit of querying issues at once is 100.
	// If the limit passed by user is greater than 100, exit
	// with an error message
	if opts.LimitArg > MAX_ISSUE_LIMIT {
		return fmt.Errorf("The maximum allowed limit to fetch issues is 100. Found %d", opts.LimitArg)
	}

	// Get the remote repository URL for which issues have to be listed
	opts.SelectedRemote, err = utils.ResolveRemote(opts.RepoArg)
	if err != nil {
		return err
	}

	// Fetch the list of issues using SDK (deepsource package) based on user input
	ctx := context.Background()
	err = opts.getIssuesData(ctx)
	if err != nil {
		return err
	}

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

// Gets the data about issues using the SDK based on the user input
// i.e for a single file or for the whole project
func (opts *IssuesListOptions) getIssuesData(ctx context.Context) (err error) {
	// Get the deepsource client for using the issue fetching SDK to fetch the list of issues
	deepsource, err := deepsource.New(deepsource.ClientOpts{
		Token:    config.Cfg.Token,
		HostName: config.Cfg.Host,
	})
	if err != nil {
		return err
	}

	// Fetch list of issues for the whole project
	opts.issuesData, err = deepsource.GetIssues(ctx, opts.SelectedRemote.Owner, opts.SelectedRemote.RepoName, opts.SelectedRemote.VCSProvider, opts.LimitArg)
	if err != nil {
		return err
	}

	var filteredIssues []issues.Issue

	// Fetch issues for a certain FileArg (filepath) passed by the user
	// Example: `deepsource issues list api/hello.py`
	if len(opts.FileArg) != 0 {
		var fetchedIssues []issues.Issue
		for _, arg := range opts.FileArg {
			// Filter issues for the valid directories/files
			filteredIssues, err = filterIssuesByPath(arg, opts.issuesData)
			if err != nil {
				return err
			}
			fetchedIssues = append(fetchedIssues, filteredIssues...)
		}

		// set fetched issues as issue data
		opts.issuesData = getUniqueIssues(fetchedIssues)
	}

	if len(opts.AnalyzerArg) != 0 {
		var fetchedIssues []issues.Issue

		// Filter issues based on the analyzer shortcode
		filteredIssues, err = filterIssuesByAnalyzer(opts.AnalyzerArg, opts.issuesData)
		if err != nil {
			return err
		}
		fetchedIssues = append(fetchedIssues, filteredIssues...)

		// set fetched issues as issue data
		opts.issuesData = getUniqueIssues(fetchedIssues)
	}

	return nil
}

// Parses the SDK response and formats the data in the form of a TAB separated table
// and renders it using pterm
func (opts *IssuesListOptions) showIssues() {
	// A 2d array to contain list of issues details arrays
	opts.ptermTable = make([][]string, len(opts.issuesData))

	// Curating the data and appending to the 2d array
	for index, issue := range opts.issuesData {
		filePath := issue.Location.Path
		beginLine := issue.Location.Position.BeginLine
		issueLocation := fmt.Sprintf("%s:%d", filePath, beginLine)
		analyzerShortcode := issue.Analyzer.Shortcode
		issueCode := issue.IssueCode
		issueTitle := issue.IssueText

		opts.ptermTable[index] = []string{issueLocation, analyzerShortcode, issueCode, issueTitle}
	}
	// Using pterm to render the list of list
	pterm.DefaultTable.WithSeparator("\t").WithData(opts.ptermTable).Render()
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

	if err = ioutil.WriteFile(filename, data, 0644); err != nil {
		return err
	}

	pterm.Info.Printf("Saved issues to %s!\n", filename)
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

	pterm.Info.Printf("Saved issues to %s!\n", filename)
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
	pterm.Info.Printf("Saved issues to %s!\n", filename)
	return nil
}
