package render

import (
	"fmt"
	"html/template"
	"net/http"

	"github.com/labstack/echo/v4"
)

/* Declared Routes:
 * /
 * /issues
 * /issue/{issue_code}/occurences
 * /issues?category=all
 * /issues?category={issue_category}  */

// declareRoutes declares routes for various incoming requests to the Analyzer dry run local server.
func (r *ResultRenderOpts) declareRoutes(staticFS http.FileSystem) *echo.Echo {
	e := echo.New()
	e.HideBanner = true

	// Issues page containing all the reported issues.
	e.GET("/", r.IssuesHandler)
	e.GET("/issues", r.IssuesHandler)

	// Handle serving static assets.
	assetHandler := http.FileServer(staticFS)
	e.GET("/static/*", echo.WrapHandler(http.StripPrefix("/static/", assetHandler)))

	// Handle showing issues for a certain category.
	e.GET("/issue/:issue_code/occurences", r.IssuesOccurencesHandler)
	return e
}

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

func (r *ResultRenderOpts) IssuesOccurencesHandler(c echo.Context) error {
	// Fetch the issue code from URI.
	r.SelectedIssueCode = c.Param("issue_code")

	issueOccurences := r.AnalysisResultData.IssuesOccurenceMap[r.SelectedIssueCode]
	for _, occurence := range issueOccurences.Occurences {
		r.AnalysisResultData.RenderedSourceCode = append(r.AnalysisResultData.RenderedSourceCode, template.HTML(occurence.ProcessedData.SourceCode.Rendered))
	}
	err := r.Template.ExecuteTemplate(c.Response().Writer, "occurence.html", *r)
	if err != nil {
		fmt.Println(err)
		return c.String(http.StatusOK, "Occurence page served.")
	}
	return c.String(http.StatusOK, "Occurence page served.")
}
