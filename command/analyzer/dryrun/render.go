package dryrun

import (
	"embed"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"path"
	"strings"

	"github.com/cli/browser"
	"github.com/deepsourcelabs/cli/types"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/pelletier/go-toml/v2"
)

//go:embed views/*.html
var tmplFS embed.FS

type VCSInfo struct {
	Branch    string
	CommitSHA string
}

type OccurenceData struct {
	IssueMeta  types.AnalyzerIssue
	Occurences []types.Issue
}

type ResultData struct {
	UniqueIssuesCount     int
	TotalOccurences       int
	SourcePath            string
	IssuesOccurenceMap    map[string]OccurenceData
	IssueCategoryCountMap map[string]int
	AnalysisResult        types.AnalysisResult
	RenderedSourceCode    []template.HTML
}

type DataRenderOpts struct {
	Template             *template.Template
	PageTitle            string
	AnalyzerShortcode    string
	VCSInfo              VCSInfo
	AnalysisResultData   ResultData
	AnalyzerTOMLData     types.AnalyzerTOML
	SelectedIssueCode    string
	SelectedCategory     string
	IssueCategoryNameMap map[string]string
}

// renderResultsOnBrowser renders the results on the browser through a local server.
func (a *AnalyzerDryRun) renderResultsOnBrowser() (err error) {
	// Collect the data that needs to be rendered.
	d := DataRenderOpts{
		PageTitle: "Analyzer Dry Run",
		// TODO: Use shortcode here.
		AnalyzerShortcode: a.Client.AnalysisOpts.AnalyzerName,
		AnalysisResultData: ResultData{
			AnalysisResult: a.AnalysisResult,
		},
		SelectedCategory:     "all",
		IssueCategoryNameMap: types.CategoryMaps,
	}
	if err = d.collectResultToBeRendered(); err != nil {
		return err
	}

	// Parse the HTML templates.
	d.Template = template.Must(template.ParseFS(tmplFS, "views/*.html"))
	if err != nil {
		return err
	}

	// Define the routes and start the server.
	http.Handle("/", d.declareRoutes())

	// Having received the user code, open the browser at the localhost:8080 endpoint.
	err = browser.OpenURL("http://localhost:8080")
	if err != nil {
		return err
	}
	return http.ListenAndServe(":8080", nil)
}

// collectResultToBeRendered formats all the result received after post-processing and then adds the
// extra data required for rendering on the browser
func (d *DataRenderOpts) collectResultToBeRendered() (err error) {
	cwd, _ := os.Getwd()

	// Inject the VCS information.
	if d.VCSInfo.Branch, d.VCSInfo.CommitSHA, err = fetchVCSDetails(cwd); err != nil {
		log.Print(err)
		return err
	}

	// Create a map of occurences of the issues.
	issueOccurenceMap := make(map[string]OccurenceData)
	for _, issue := range d.AnalysisResultData.AnalysisResult.Issues {
		currentOccurence := OccurenceData{}

		if _, ok := issueOccurenceMap[issue.IssueCode]; !ok {
			// Fetch issue meta for the issue code raised.
			issueMeta, err := getIssueMeta(cwd, issue.IssueCode)
			if err != nil {
				return err
			}
			currentOccurence = OccurenceData{
				IssueMeta: issueMeta,
			}
			currentOccurence.Occurences = append(currentOccurence.Occurences, issue)
			issueOccurenceMap[issue.IssueCode] = currentOccurence
			continue
		}

		// Get past occurences and append to it since maps don't allow direct append to a slice value.
		pastOccurences := issueOccurenceMap[issue.IssueCode]
		currentOccurence.IssueMeta = pastOccurences.IssueMeta
		currentOccurence.Occurences = append(pastOccurences.Occurences, issue)
		issueOccurenceMap[issue.IssueCode] = currentOccurence
	}
	d.AnalysisResultData.IssuesOccurenceMap = issueOccurenceMap

	// Create a map of issue category to issue count.
	// Iterate over the map and then keep adding the issue counts.
	issueCategoryMap := make(map[string]int)
	for _, value := range issueOccurenceMap {
		if _, ok := issueCategoryMap[value.IssueMeta.Category]; !ok {
			issueCategoryMap[value.IssueMeta.Category] = len(value.Occurences)
			continue
		}
		issueCategoryMap[value.IssueMeta.Category] = issueCategoryMap[value.IssueMeta.Category] + len(value.Occurences)
	}

	// Add remaining categories to the map.
	for key, value := range types.CategoryMaps {
		if _, ok := issueCategoryMap[value]; !ok {
			issueCategoryMap[key] = 0
			continue
		}
		issueCategoryMap[key] = issueCategoryMap[value]
		delete(issueCategoryMap, value)
	}
	d.AnalysisResultData.IssueCategoryCountMap = issueCategoryMap

	// Find out total occurences.
	for _, v := range issueOccurenceMap {
		d.AnalysisResultData.TotalOccurences = d.AnalysisResultData.TotalOccurences + len(v.Occurences)
	}
	d.AnalysisResultData.UniqueIssuesCount = len(d.AnalysisResultData.IssuesOccurenceMap)
	return nil
}

// getIssueMeta receives the issuecode that is raised and it reads the TOML of that issue and returns
// its details configured in the TOML like title, description and category.
func getIssueMeta(cwd, issueCode string) (types.AnalyzerIssue, error) {
	analyzerIssue := types.AnalyzerIssue{}
	// Read the toml file of the issue in .deepsource/analyzer/issues directory
	// TODO: Improve here.
	issueFilePath := path.Join(cwd, ".deepsource/analyzer/issues", fmt.Sprintf("%s.toml", issueCode))

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

// fetchVCSDetails fetches the VCS details to be shown on the dashboard.
func fetchVCSDetails(dir string) (string, string, error) {
	repo, err := git.PlainOpen(dir)
	if err != nil {
		return "", "", err
	}

	branchName, err := repo.Head()
	if err != nil {
		return "", "", err
	}

	// Fetch the commit SHA of the latest commit
	latestCommitHash, err := fetchHeadManually(dir)
	if err != nil {
		return "", "", err
	}
	branchData := branchName.String()
	branch := branchData[strings.LastIndex(branchData, "/")+1:]

	return branch, latestCommitHash[:7], nil
}

// fetchHeadManually fetches the latest commit hash using the command `git rev-parse HEAD`
// through go-git.
func fetchHeadManually(directoryPath string) (string, error) {
	gitOpts := &git.PlainOpenOptions{
		DetectDotGit: true,
	}

	// Open a new repository targeting the given path (the .git folder)
	repo, err := git.PlainOpenWithOptions(directoryPath, gitOpts)
	if err != nil {
		return "", err
	}

	// Resolve revision into a sha1 commit
	commitHash, err := repo.ResolveRevision(plumbing.Revision("HEAD"))
	if err != nil {
		return "", err
	}
	return commitHash.String(), nil
}
