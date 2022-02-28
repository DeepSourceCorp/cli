package list

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/deepsourcelabs/cli/deepsource/issues"
	"github.com/owenrumney/go-sarif/v2/sarif"
)

type ExportData struct {
	Occurences []IssueJSON `json:"occurences"`
	Summary    Summary     `json:"summary"`
}

type Summary struct {
	TotalOccurences int `json:"total_occurences"`
	UniqueIssues    int `json:"unique_issues"`
}

///////////////////////
// Filtering utilities
///////////////////////

// Filters issues based on a path, works for both directories and files
func filterIssuesByPath(path string, issuesData []issues.Issue) ([]issues.Issue, error) {
	var filteredIssues []issues.Issue
	for _, issue := range issuesData {
		up := ".." + string(os.PathSeparator)

		// get relative path
		rel, err := filepath.Rel(path, issue.Location.Path)
		if err != nil {
			return nil, err
		}

		// handle files
		if rel == "." {
			filteredIssues = append(filteredIssues, issue)
		}

		// check if the relative path has a parent directory
		if !strings.HasPrefix(rel, up) && rel != ".." {
			filteredIssues = append(filteredIssues, issue)
		}
	}

	return getUniqueIssues(filteredIssues), nil
}

// Filters issues based on the analyzer shortcode.
func filterIssuesByAnalyzer(analyzer []string, issuesData []issues.Issue) ([]issues.Issue, error) {
	var filteredIssues []issues.Issue

	// maintain a map of analyzer shortcodes
	analyzerMap := make(map[string]bool)
	for _, shortcode := range analyzer {
		analyzerMap[shortcode] = true
	}

	for _, issue := range issuesData {
		if analyzerMap[issue.Analyzer.Shortcode] {
			filteredIssues = append(filteredIssues, issue)
		}
	}

	return getUniqueIssues(filteredIssues), nil
}

// Returns de-duplicated issues.
func getUniqueIssues(fetchedIssues []issues.Issue) []issues.Issue {
	var uniqueIssues []issues.Issue

	// inUnique is a map which is used for checking whether an issue exists already or not
	inUnique := make(map[issues.Issue]bool)

	for _, issue := range fetchedIssues {
		// if the issue isn't present in inUnique, append the issue to uniqueIssues and update inUnique
		if _, ok := inUnique[issue]; !ok {
			inUnique[issue] = true
			uniqueIssues = append(uniqueIssues, issue)
		}
	}

	return uniqueIssues
}

///////////////////////
// Conversion utilities
///////////////////////

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

// Converts issueData to a CSV records
func convertCSV(issueData []issues.Issue) [][]string {
	records := [][]string{{"analyzer", "issue_code", "issue_title", "occurence_title", "issue_category", "path", "begin_line", "begin_column", "end_line", "end_column"}}

	for _, issue := range issueData {
		issueNew := []string{issue.Analyzer.Shortcode, issue.IssueCode, issue.IssueText, issue.IssueText, "", issue.Location.Path, fmt.Sprint(issue.Location.Position.BeginLine), "0", fmt.Sprint(issue.Location.Position.EndLine), "0"}

		records = append(records, issueNew)
	}

	return records
}

// Converts issueData to a SARIF report
func convertSARIF(issueData []issues.Issue) *sarif.Report {
	report, err := sarif.New(sarif.Version210)
	if err != nil {
		return nil
	}

	// use a map of shortcodes to append rules and results
	type boolIndex struct {
		exists bool
		index  int
	}
	shortcodes := make(map[string]boolIndex)
	var runs []*sarif.Run
	count := 0

	// Adding the tools data to the SARIF report corresponding to the number of analyzers activated
	for _, issue := range issueData {
		if !shortcodes[issue.Analyzer.Shortcode].exists {
			driverName := "DeepSource " + strings.Title(issue.Analyzer.Shortcode) + " Analyzer"
			informationURI := "https://deepsource.io/directory/analyzers/" + string(issue.Analyzer.Shortcode)

			tool := sarif.Tool{
				Driver: &sarif.ToolComponent{
					Name:           driverName,
					InformationURI: &informationURI,
				},
			}

			run := sarif.NewRun(tool)
			runs = append(runs, run)

			// update boolIndex
			shortcodes[issue.Analyzer.Shortcode] = boolIndex{exists: true, index: count}
			count += 1
		}
	}

	// use an index map for updating rule index value
	idxMap := make(map[int]int)

	// Adding the results data for each analyzer in the report
	for _, issue := range issueData {
		// TODO: Fetch issue description from the API and populate here
		textDescription := ""
		fullDescription := sarif.MultiformatMessageString{
			Text: &textDescription,
		}

		// check if the shortcode exists in the map
		if shortcodes[issue.Analyzer.Shortcode].exists {
			// fetch shortcode index
			idx := shortcodes[issue.Analyzer.Shortcode].index

			// TODO: fetch category and recommended fields
			pb := sarif.NewPropertyBag()
			pb.Add("category", "")
			pb.Add("recommended", "")

			helpURI := "https://deepsource.io/directory/analyzers/" + string(issue.Analyzer.Shortcode) + "/issues/" + string(issue.IssueCode)

			// add rule
			runs[idx].AddRule(issue.IssueCode).WithName(issue.IssueText).WithFullDescription(&fullDescription).WithHelpURI(helpURI).WithProperties(pb.Properties)

			// add result
			runs[idx].CreateResultForRule(issue.IssueCode).WithLevel("error").WithKind("fail").WithMessage(sarif.NewTextMessage(
				issue.IssueText,
			)).WithRuleIndex(idxMap[idx]).AddLocation(
				sarif.NewLocationWithPhysicalLocation(
					sarif.NewPhysicalLocation().WithArtifactLocation(
						sarif.NewSimpleArtifactLocation(issue.Location.Path),
					).WithRegion(
						sarif.NewSimpleRegion(issue.Location.Position.BeginLine, issue.Location.Position.EndLine),
					),
				),
			)

			idxMap[idx] += 1
		}
	}

	// add all runs to report
	for _, run := range runs {
		report.AddRun(run)
	}

	return report
}
