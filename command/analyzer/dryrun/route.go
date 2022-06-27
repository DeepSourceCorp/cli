package dryrun

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
func (d *DataRenderOpts) declareRoutes(staticFS http.FileSystem) *echo.Echo {
	e := echo.New()
	e.HideBanner = true

	// Issues page containing all the reported issues.
	e.GET("/", d.IssuesHandler)
	e.GET("/issues", d.IssuesHandler)

	// Handle serving static assets.
	assetHandler := http.FileServer(staticFS)
	e.GET("/static/*", echo.WrapHandler(http.StripPrefix("/static/", assetHandler)))

	// Handle showing issues for a certain category.
	e.GET("/issue/:issue_code/occurences", d.IssuesOccurencesHandler)
	return e
}

func (d *DataRenderOpts) IssuesHandler(c echo.Context) error {
	// Check URL query parameters
	qParams := c.QueryParams()

	if qParams.Has("category") {
		d.SelectedCategory = qParams.Get("category")
	} else {
		d.SelectedCategory = "all"
	}

	err := d.Template.ExecuteTemplate(c.Response().Writer, "index.html", *d)
	if err != nil {
		fmt.Println(err)
	}
	return c.String(http.StatusOK, "Issues page served.")
}

func (d *DataRenderOpts) IssuesOccurencesHandler(c echo.Context) error {
	// Fetch the issue code from URI.
	d.SelectedIssueCode = c.Param("issue_code")

	issueOccurences := d.AnalysisResultData.IssuesOccurenceMap[d.SelectedIssueCode]
	for _, occurence := range issueOccurences.Occurences {
		d.AnalysisResultData.RenderedSourceCode = append(d.AnalysisResultData.RenderedSourceCode, template.HTML(occurence.ProcessedData.SourceCode.Rendered))
	}
	err := d.Template.ExecuteTemplate(c.Response().Writer, "occurence.html", *d)
	if err != nil {
		fmt.Println(err)
	}
	return c.String(http.StatusOK, "Occurence page served.")
}
