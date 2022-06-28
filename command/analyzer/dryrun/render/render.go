package render

import (
	"context"
	"embed"
	"fmt"
	"html/template"
	"io/fs"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/cli/browser"
	"github.com/deepsourcelabs/cli/types"
	"github.com/pterm/pterm"
)

//go:embed views/*.html views/**/*.css
var tmplFS embed.FS

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
func (r *ResultRenderOpts) RenderResultsOnBrowser() (err error) {
	// Collect all other data to be rendered.
	if err = r.collectResultToBeRendered(); err != nil {
		return err
	}

	// In order to serve the static css files, this creates a handler to serve any static assets stored under
	// `views/` at `/static/assets/*`.
	fsys, err := fs.Sub(tmplFS, "views")

	// Parse the HTML templates.
	r.Template = template.Must(template.ParseFS(tmplFS, "views/*.html"))
	if err != nil {
		return err
	}

	// Define the routes using echo and start the server.
	echoInstance := r.declareRoutes(http.FS((fsys)))
	serverPort := getServerPort()

	// Spawn the server in a goroutine.
	go func() {
		if err := echoInstance.Start(fmt.Sprintf(":%s", serverPort)); err != nil && err != http.ErrServerClosed {
			echoInstance.Logger.Fatal("Shutting down the server")
		}
	}()
	pterm.Success.Printf("Analysis results live at http://localhost:%s..\n", serverPort)

	// Having received the user code, open the browser at the localhost.
	browser.OpenURL(fmt.Sprintf("http://localhost:%s", serverPort))

	// Wait for interrupt signal to gracefully shutdown the server with a timeout of 10 seconds.
	// Use a buffered channel to avoid missing signals as recommended for signal.Notify
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	return echoInstance.Shutdown(ctx)
}

// collectResultToBeRendered formats all the result received after post-processing and then adds the
// extra data required for rendering on the browser
func (r *ResultRenderOpts) collectResultToBeRendered() (err error) {
	cwd, _ := os.Getwd()

	// Fetch the run summary data.
	r.Summary.RunDuration, r.Summary.TimeSinceRun = fetchRunSummary(r.Summary.AnalysisStartTime, r.Summary.AnalysisEndTime)

	// Inject the Analyzer VCS information.
	r.VCSInfo.Branch, r.VCSInfo.CommitSHA = fetchVCSDetails(cwd)

	// Fetch the data as to status of Analyzer w.r.t the latest version/tag.
	r.VCSInfo.VersionDiff = fetchAnalyzerVCSData(cwd)

	// Get occurence data.
	r.fetchIssueOccurencesData(cwd)

	// Get the category data.
	r.fetchIssueCategoryData()

	// Fetch metrics data.
	r.fetchIssueMetricsData()

	return nil
}
