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
	"github.com/pterm/pterm"
)

//go:embed views
var tmplFS embed.FS

// renderResultsOnBrowser renders the results on the browser through a local server,
// go template and an awesome frontend.
func (r *ResultRenderOpts) RenderResultsOnBrowser(server IRenderServer) (err error) {
	// Collect all other data to be rendered.
	r.collectResultToBeRendered()

	// In order to serve the static css files, this creates a handler to serve any static assets stored under
	// `views/` at `/static/assets/*`.
	fsys, err := fs.Sub(tmplFS, "views")
	if err != nil {
		return err
	}

	// Parse the HTML templates.
	r.Template = template.Must(template.ParseFS(tmplFS, "views/*.html"))

	// Define the routes using echo and start the server.
	r.EchoServer = server.GetEchoContext()
	server.DeclareRoutes(http.FS((fsys)))
	serverPort := getServerPort()

	// Spawn the server in a goroutine.
	go func() {
		if err := r.EchoServer.Start(fmt.Sprintf(":%s", serverPort)); err != nil && err != http.ErrServerClosed {
			r.EchoServer.Logger.Fatal("Shutting down the server")
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
	return r.EchoServer.Shutdown(ctx)
}

// collectResultToBeRendered formats all the result received after post-processing and then adds the
// extra data required for rendering on the browser
func (r *ResultRenderOpts) collectResultToBeRendered() {
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
}
