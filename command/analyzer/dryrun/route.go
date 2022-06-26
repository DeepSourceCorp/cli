package dryrun

import (
	"fmt"
	"html/template"
	"net/http"

	"github.com/gorilla/mux"
)

/* Declared Routes:
 * /
 * /issues
 * /issue/{issue_code}/occurences
 * /issues?category=all
 * /issues?category={issue_category}  */

// declareRoutes declares routes for various incoming requests to the Analyzer dry run local server.
func (d *DataRenderOpts) declareRoutes(staticFilesHandler http.Handler) *mux.Router {
	r := mux.NewRouter()
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", staticFilesHandler))
	r.HandleFunc("/", d.IssuesHandler)
	r.HandleFunc("/issues", d.IssuesHandler)
	r.HandleFunc("/issues", d.IssuesHandler).Queries()
	r.HandleFunc("/issue/{issue_code}/occurences", d.IssuesOccurencesHandler)
	return r
}

func (d *DataRenderOpts) IssuesHandler(w http.ResponseWriter, r *http.Request) {
	// Check URL query parameters
	qParams := r.URL.Query()

	if qParams.Has("category") {
		d.SelectedCategory = qParams.Get("category")
	} else {
		d.SelectedCategory = "all"
	}

	err := d.Template.ExecuteTemplate(w, "index.html", *d)
	if err != nil {
		fmt.Println(err)
	}
}

func (d *DataRenderOpts) IssuesOccurencesHandler(w http.ResponseWriter, r *http.Request) {
	// Fetch the issue code from URI.
	issueVar := mux.Vars(r)
	d.SelectedIssueCode = issueVar["issue_code"]

	issueOccurences := d.AnalysisResultData.IssuesOccurenceMap[d.SelectedIssueCode]
	for _, occurence := range issueOccurences.Occurences {
		d.AnalysisResultData.RenderedSourceCode = append(d.AnalysisResultData.RenderedSourceCode, template.HTML(occurence.ProcessedData.SourceCode.Rendered))
	}
	err := d.Template.ExecuteTemplate(w, "occurence.html", *d)
	if err != nil {
		fmt.Println(err)
	}
}
