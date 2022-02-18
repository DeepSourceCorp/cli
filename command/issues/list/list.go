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
	"github.com/owenrumney/go-sarif/v2/sarif"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

const MAX_ISSUE_LIMIT = 100

type IssuesListOptions struct {
	FileArg           string
	RepoArg           string
	LimitArg          int
	OutputFilenameArg string
	JSONArg           bool
	CSVArg            bool
	SARIFArg          bool
	SelectedRemote    *utils.RemoteData
	issuesData        []issues.Issue
	ptermTable        [][]string
}

type ExportData struct {
	Occurences []IssueJSON `json:"occurences"`
	Summary    Summary     `json:"summary"`
}

type Summary struct {
	TotalOccurences int `json:"total_occurences"`
	UniqueIssues    int `json:"unique_issues"`
}

func NewCmdIssuesList() *cobra.Command {

	opts := IssuesListOptions{
		FileArg:  "",
		RepoArg:  "",
		LimitArg: 30,
	}

	cmd := &cobra.Command{
		Use:   "list",
		Short: "List issues reported by DeepSource",
		Args:  utils.MaxNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			if len(args) == 1 {
				opts.FileArg = args[0]
			}
			return opts.Run()
		},
	}

	// --repo, -r flag
	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "List the issues of the specified repository")

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

	// Get the remote repository URL for which issues have to
	// be listed
	opts.SelectedRemote, err = utils.ResolveRemote(opts.RepoArg)
	if err != nil {
		return err
	}

	// Fetch the list of issues using SDK based on user input
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

	// Fetch issues for a certain FileArg (filepath) passed by the user
	// Example: `deepsource issues list api/hello.py`
	if opts.FileArg != "" {
		opts.issuesData, err = deepsource.GetIssuesForFile(ctx, opts.SelectedRemote.Owner, opts.SelectedRemote.RepoName, opts.SelectedRemote.VCSProvider, opts.FileArg, opts.LimitArg)
		if err != nil {
			return err
		}
		return nil
	}

	// Fetch list of issues for the whole project
	opts.issuesData, err = deepsource.GetIssues(ctx, opts.SelectedRemote.Owner, opts.SelectedRemote.RepoName, opts.SelectedRemote.VCSProvider, opts.LimitArg)
	if err != nil {
		return err
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

// Converts issueData to a JSON-compatible struct
func convertJSON(issueData []issues.Issue) ExportData {
	var occurences []IssueJSON
	var issueExport ExportData

	set := make(map[string]string)
	total_occurences := 0

	for _, issue := range issueData {
		issueNew := IssueJSON{
			Analyzer:       issue.Analyzer.Shortcode,
			IssueCode:      issue.IssueCode,
			IssueTitle:     issue.IssueText,
			OccurenceTitle: issue.IssueText,
			IssueCategory:  "",
			Location: LocationJSON{
				Path: issue.Location.Path,
				Position: PositionJSON{
					Begin: LineColumn{
						Line:   issue.Location.Position.BeginLine,
						Column: 0,
					},
					End: LineColumn{
						Line:   issue.Location.Position.EndLine,
						Column: 0,
					},
				},
			},
		}

		total_occurences += 1
		set[issue.IssueCode] = ""

		occurences = append(occurences, issueNew)
	}

	issueExport.Occurences = occurences
	issueExport.Summary.TotalOccurences = total_occurences
	issueExport.Summary.UniqueIssues = len(set)

	return issueExport
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

// Converts issueData to a CSV records
func convertCSV(issueData []issues.Issue) [][]string {
	records := [][]string{{"analyzer", "issue_code", "issue_title", "occurence_title", "issue_category", "path", "begin_line", "begin_column", "end_line", "end_column"}}

	for _, issue := range issueData {
		issueNew := []string{issue.Analyzer.Shortcode, issue.IssueCode, issue.IssueText, issue.IssueText, "", issue.Location.Path, fmt.Sprint(issue.Location.Position.BeginLine), "0", fmt.Sprint(issue.Location.Position.EndLine), "0"}

		records = append(records, issueNew)
	}

	return records
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

// Converts issueData to a SARIF report
func convertSARIF(issueData []issues.Issue) *sarif.Report {
	report, err := sarif.New(sarif.Version210)
	if err != nil {
		return nil
	}

	run := sarif.NewRunWithInformationURI("deepsource", "https://deepsource.io")
	for i, issue := range issueData {
		pb := sarif.NewPropertyBag()
		pb.Add("category", "")
		pb.Add("recommended", "")

		// add rule
		run.AddRule(issue.IssueCode).WithName(issue.IssueText).WithDescription("").WithHelpURI("").WithProperties(pb.Properties)

		// add result
		run.CreateResultForRule(issue.IssueCode).WithLevel("error").WithKind("fail").WithMessage(sarif.NewTextMessage(
			issue.IssueText,
		)).WithRuleIndex(i).AddLocation(
			sarif.NewLocationWithPhysicalLocation(
				sarif.NewPhysicalLocation().WithArtifactLocation(
					sarif.NewSimpleArtifactLocation(issue.Location.Path),
				).WithRegion(
					sarif.NewSimpleRegion(issue.Location.Position.BeginLine, issue.Location.Position.EndLine),
				),
			),
		)
	}

	report.AddRun(run)

	return report
}
