package dryrun

import (
	"embed"
	"fmt"
	"html/template"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/cli/browser"
	"github.com/deepsourcelabs/cli/types"
	"github.com/pelletier/go-toml/v2"
)

//go:embed views/*.html views/**/*.css
var tmplFS embed.FS

type RunSummary struct {
	RunDuration  string // Time taken to complete analysis.
	TimeSinceRun string // Time elapsed since the completion of the analysis run.
}

type VCSInfo struct {
	Branch      string // VCS branch of the Analyzer.
	CommitSHA   string // The latest commit SHA of the Analyzer.
	VersionDiff string // The string specifying the status of Analyzer w.r.t previous version.
}

type OccurenceData struct {
	IssueMeta  types.AnalyzerIssue // Contains the data stored in issue TOMLs for the respective issue.
	Files      []string            // Files where this issue has been reported.
	FilesInfo  string              // The string containing the data of which files the issue has been reported in.
	Occurences []types.Issue       // The slice of occurences for a certain issue code.
}

type ResultData struct {
	UniqueIssuesCount     int                      // The unique issues count.
	TotalOccurences       int                      // Total issues reported by the Analyzer.
	SourcePath            string                   // The path where the source code to be analyzer is stored.
	IssuesOccurenceMap    map[string]OccurenceData // The map of issue code to its occurences data.
	IssueCategoryCountMap map[string]int           // The map of issue category to the count of the issues of that category.
	AnalysisResult        types.AnalysisResult     // The analysis result post running processors.
	MetricsMap            map[string]float64       // The map of metric names to their values.
	RenderedSourceCode    []template.HTML          // The slice containing the source code snippets for each occurence.
}

type DataRenderOpts struct {
	Template             *template.Template // The go template field so that it can be accessible in `route.go` as well.
	PageTitle            string             // The title of the HTML page.
	AnalyzerShortcode    string             // The shortcode of the Analyzer.
	VCSInfo              VCSInfo            // The VCS information of the Analyzer.
	Summary              RunSummary         // The run summary.
	AnalysisResultData   ResultData         // The analysis result data.
	SelectedIssueCode    string             // The field used to recognize which issue code the user has clicked on to check its occurences.
	SelectedCategory     string             // The field used to recognize which category the user has clicked to filter the issues based on it.
	IssueCategoryNameMap map[string]string  // The map used to route category names to their codes. Eg: `Documentation`->`doc`.
	MetricNameMap        map[string]string  // The map of metrics shortcodes with their names.
}

// renderResultsOnBrowser renders the results on the browser through a local server,
// go template and an awesome frontend.
func (a *AnalyzerDryRun) renderResultsOnBrowser() (err error) {
	// Initialize `DataRenderOpts` with some of the data needed to be rendered.
	d := DataRenderOpts{
		PageTitle:         fmt.Sprintf("Issues | %s", a.Client.AnalysisOpts.AnalyzerShortcode),
		AnalyzerShortcode: a.Client.AnalysisOpts.AnalyzerShortcode,
		AnalysisResultData: ResultData{
			AnalysisResult: a.AnalysisResult,
			SourcePath:     a.SourcePath,
		},
		SelectedCategory:     "all",
		IssueCategoryNameMap: types.IssueCategoryMap,
		MetricNameMap:        types.MetricMap,
	}

	// Collect all other data to be rendered.
	if err = d.collectResultToBeRendered(); err != nil {
		return err
	}

	// In order to serve the static css files, this creates a handler to serve any static assets stored under
	// `views/` at `/static/assets/*`.
	fsys, err := fs.Sub(tmplFS, "views")

	// Parse the HTML templates.
	d.Template = template.Must(template.ParseFS(tmplFS, "views/*.html"))
	if err != nil {
		return err
	}

	// Define the routes using echo and start the server.
	echoInstance := d.declareRoutes(http.FS((fsys)))

	// Having received the user code, open the browser at the localhost:8080 endpoint.
	err = browser.OpenURL("http://localhost:8080")
	if err != nil {
		return err
	}
	return echoInstance.Start(":8080")
}

// collectResultToBeRendered formats all the result received after post-processing and then adds the
// extra data required for rendering on the browser
func (d *DataRenderOpts) collectResultToBeRendered() (err error) {
	cwd, _ := os.Getwd()

	// Fetch the run summary data.
	d.Summary.RunDuration, d.Summary.TimeSinceRun = fetchRunSummary()

	// Inject the Analyzer VCS information.
	d.VCSInfo.Branch, d.VCSInfo.CommitSHA = fetchVCSDetails(cwd)

	// Fetch the data as to status of Analyzer w.r.t the latest version/tag.
	d.VCSInfo.VersionDiff = fetchAnalyzerVCSData(cwd)

	// Get occurence data.
	d.fetchIssueOccurencesData(cwd)

	// Get the category data.
	d.fetchIssueCategoryData()

	// Fetch metrics data.
	d.fetchIssueMetricsData()

	return nil
}

// fetchIssueOccurencesData collects all the occurence related data.
func (d *DataRenderOpts) fetchIssueOccurencesData(cwd string) {
	// Create a map of occurences of the issues.
	issueOccurenceMap := make(map[string]OccurenceData)

	// Iterate over the analysis result issues.
	for _, issue := range d.AnalysisResultData.AnalysisResult.Issues {
		currentOccurence := OccurenceData{}

		// Fix path of the issues(remove cwd prefix from them).
		issue.Location.Path = strings.TrimPrefix(issue.Location.Path, filepath.Join(d.AnalysisResultData.SourcePath, string(filepath.Separator)))

		if _, ok := issueOccurenceMap[issue.IssueCode]; !ok {
			// Fetch issue meta for the issue code raised.
			issueMeta, err := getIssueMeta(cwd, issue.IssueCode)
			if err != nil {
				fmt.Println("Couldn't resolve issue meta for the issue:", issue.IssueCode)
				continue
			}
			currentOccurence = OccurenceData{
				IssueMeta: issueMeta,
			}
			currentOccurence.Occurences = append(currentOccurence.Occurences, issue)
			currentOccurence.Files = append(currentOccurence.Files, issue.Location.Path)
			issueOccurenceMap[issue.IssueCode] = currentOccurence
			continue
		}

		// Get past occurences and append to it since maps don't allow direct append to a slice value.
		pastOccurences := issueOccurenceMap[issue.IssueCode]
		currentOccurence.IssueMeta = pastOccurences.IssueMeta
		currentOccurence.Occurences = append(pastOccurences.Occurences, issue)
		currentOccurence.Files = append(pastOccurences.Files, issue.Location.Path)
		issueOccurenceMap[issue.IssueCode] = currentOccurence
	}

	// Remove duplicates from the files array.
	for issueCode, occurenceData := range issueOccurenceMap {
		filesMap := make(map[string]int, 0)
		uniqueFiles := make([]string, 0)

		// Setting the map value to 1 for the files in order to identify unique files.
		for _, file := range occurenceData.Files {
			filesMap[file] = 1
		}

		// Appending the unique files.
		for file := range filesMap {
			uniqueFiles = append(uniqueFiles, file)
		}
		occurence := issueOccurenceMap[issueCode]
		occurence.Files = append(occurence.Files, uniqueFiles...)
		issueOccurenceMap[issueCode] = occurence
	}

	// Create the files information string.
	for issueCode, occurenceData := range issueOccurenceMap {
		occurenceData.FilesInfo = fmt.Sprintf("Found in %s and %d other file(s)", occurenceData.Files[0], len(occurenceData.Files)-1)
		issueOccurenceMap[issueCode] = occurenceData
	}
	d.AnalysisResultData.IssuesOccurenceMap = issueOccurenceMap

	// Find out total number of occurences of all the issues.
	for _, v := range issueOccurenceMap {
		d.AnalysisResultData.TotalOccurences = d.AnalysisResultData.TotalOccurences + len(v.Occurences)
	}

	// Finds the unique issues count(the length of the occurences map since its mapped by issue codes which are unique).
	d.AnalysisResultData.UniqueIssuesCount = len(d.AnalysisResultData.IssuesOccurenceMap)
}

// fetchIssueCategoryData creates a map of issue category to issue occurences count of that category.
func (d *DataRenderOpts) fetchIssueCategoryData() {
	// Iterate over the map and then keep adding the issue counts.
	issueCategoryMap := make(map[string]int)

	// Creating a map of issue categories present to their count.
	for _, occurenceData := range d.AnalysisResultData.IssuesOccurenceMap {
		if _, ok := issueCategoryMap[occurenceData.IssueMeta.Category]; !ok {
			issueCategoryMap[occurenceData.IssueMeta.Category] = len(occurenceData.Occurences)
			continue
		}
		issueCategoryMap[occurenceData.IssueMeta.Category] = issueCategoryMap[occurenceData.IssueMeta.Category] + len(occurenceData.Occurences)
	}

	// Add remaining categories to the map other than what are reported in the issues by the Analyzer since
	// need to render all the categories.
	for categoryShortcode := range d.IssueCategoryNameMap {
		if _, ok := issueCategoryMap[categoryShortcode]; !ok {
			issueCategoryMap[categoryShortcode] = 0
			continue
		}
	}
	d.AnalysisResultData.IssueCategoryCountMap = issueCategoryMap
}

// fetchIssueMetricsData fetches the metrics data to be rendered.
func (d *DataRenderOpts) fetchIssueMetricsData() {
	metricsMap := make(map[string]float64)
	for _, metric := range d.AnalysisResultData.AnalysisResult.Metrics {
		if _, ok := d.MetricNameMap[metric.MetricCode]; !ok {
			continue
		}
		metricName := d.MetricNameMap[metric.MetricCode]
		metricsMap[metricName] = metric.Namespaces[0].Value
	}
	d.AnalysisResultData.MetricsMap = metricsMap
}

// getIssueMeta receives the issuecode that is raised and it reads the TOML of that issue and returns
// its details configured in the TOML like title, description and category.
func getIssueMeta(cwd, issueCode string) (types.AnalyzerIssue, error) {
	analyzerIssue := types.AnalyzerIssue{}
	// Read the toml file of the issue in .deepsource/analyzer/issues directory
	issueFilePath := filepath.Join(cwd, ".deepsource/analyzer/issues", fmt.Sprintf("%s.toml", issueCode))

	// Read the issue and populate the data of issue category and description
	issueData, err := os.ReadFile(issueFilePath)
	if err != nil {
		return analyzerIssue, err
	}

	// Unmarshal the data from the issue TOMLs into the struct
	err = toml.Unmarshal(issueData, &analyzerIssue)
	if err != nil {
		return analyzerIssue, err
	}
	return analyzerIssue, nil
}
