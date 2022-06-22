package dryrun

import (
	"net/http"

	"github.com/gorilla/mux"
)

// declareRoutes declares routes for various incoming requests to the Analyzer dry run local server.
func (a *AnalyzerDryRun) declareRoutes() {
	r := mux.NewRouter()
	r.HandleFunc("/", HomeHandler)
	r.HandleFunc("/issues", IssuesHandler)
	r.HandleFunc("/issues?category={category}", IssuesCategoryHandler)
	r.HandleFunc("/issue/{issue_code}/occurences", OccurencesHandler)
}

// HomeHandler handles the "/" route
func HomeHandler(w http.ResponseWriter, r *http.Request) {
}

func IssuesHandler(w http.ResponseWriter, r *http.Request) {
}

func IssuesCategoryHandler(w http.ResponseWriter, r *http.Request) {
}

func OccurencesHandler(w http.ResponseWriter, r *http.Request) {
}
