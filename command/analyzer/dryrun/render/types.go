package render

import (
	"html/template"
	"time"

	"github.com/deepsourcelabs/cli/types"
	"github.com/labstack/echo/v4"
)

type RunSummary struct {
	RunDuration       string // Time taken to complete analysis.
	TimeSinceRun      string // Time elapsed since the completion of the analysis run.
	AnalysisStartTime time.Time
	AnalysisEndTime   time.Time
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

type ResultRenderOpts struct {
	EchoServer           *echo.Echo         // The Echo server instance to run the renderer server.
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
