package render

import (
	"fmt"
	"html/template"
	"net/http"

	"github.com/labstack/echo/v4"
)

type IRenderServer interface {
	GetEchoContext() *echo.Echo
	DeclareRoutes(http.FileSystem)
}

/* Declared Routes:
 * /
 * /issues
 * /issue/{issue_code}/occurences
 * /issues?category=all
 * /issues?category={issue_category}  */

// getEchoContext returns a new Echo server instance.
func (r *ResultRenderOpts) GetEchoContext() *echo.Echo {
	e := echo.New()
	e.HideBanner = true
	return e
}

// declareRoutes declares routes for various incoming requests to the Analyzer dry run local server.
func (r *ResultRenderOpts) DeclareRoutes(staticFS http.FileSystem) {
	// Issues page containing all the reported issues.
	r.EchoServer.GET("/", r.IssuesHandler)
	r.EchoServer.GET("/issues", r.IssuesHandler)

	// Handle serving static assets.
	assetHandler := http.FileServer(staticFS)
	r.EchoServer.GET("/static/*", echo.WrapHandler(http.StripPrefix("/static/", assetHandler)))

	// Handle showing issues for a certain category.
	r.EchoServer.GET("/issue/:issue_code/occurences", r.IssueOccurencesHandler)
}

// IssuesHandler handles serving the list of issues reported
func (r *ResultRenderOpts) IssuesHandler(c echo.Context) error {
	// Check URL query parameters
	qParams := c.QueryParams()

	if qParams.Has("category") {
		r.SelectedCategory = qParams.Get("category")
	} else {
		r.SelectedCategory = "all"
	}

	err := r.Template.ExecuteTemplate(c.Response().Writer, "index.html", *r)
	if err != nil {
		fmt.Println(err)
		return c.String(http.StatusOK, "Occurence page served.")
	}
	return c.String(http.StatusOK, "Issues page served.")
}

// IssuesOccurencesHandler handles serving the issue occurences.
func (r *ResultRenderOpts) IssueOccurencesHandler(c echo.Context) error {
	// Fetch the issue code from URI.
	r.SelectedIssueCode = c.Param("issue_code")

	issueOccurences := r.AnalysisResultData.IssuesOccurenceMap[r.SelectedIssueCode]
	for _, occurence := range issueOccurences.Occurences {
		r.AnalysisResultData.RenderedSourceCode = append(r.AnalysisResultData.RenderedSourceCode, template.HTML(occurence.ProcessedData.SourceCode.Rendered)) //skipcq: GSC-G203
	}
	err := r.Template.ExecuteTemplate(c.Response().Writer, "occurence.html", *r)
	if err != nil {
		fmt.Println(err)
		return c.String(http.StatusOK, "Occurence page served.")
	}
	return c.String(http.StatusOK, "Occurence page served.")
}
