package dryrun

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"path"

	"github.com/deepsourcelabs/cli/types"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/pelletier/go-toml/v2"
)

/* Routes:
 * /issues
 * /issue/TCV-001/occurences
 * /issues?category=all
 * /issues?category=performance  */

type VCSInfo struct {
	Branch    string
	CommitSHA string
}

type ResultToRender struct {
	AnalyzerName      string
	Issues            []types.Issue
	IssueOccurenceMap map[types.Issue]int
	VCSInfo           VCSInfo
	Data              ResultData
}

type ResultData struct {
	Title              string
	SourcePath         string
	AnalyzerTOMLData   types.AnalyzerTOML
	AnalysisResult     types.AnalysisResult
	Issues             []types.Issue
	RenderedSourceCode []template.HTML
}

// renderResultsOnBrowser renders the results on the browser through a local server.
func (a *AnalyzerDryRun) renderResultsOnBrowser() (err error) {
	const tpl = `<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>{{.Title}}</title>
        <link href="static/style.css" type="text/css" rel="stylesheet"/>
	</head>
	<body>
    {{ $scd := .RenderedSourceCode }}
    {{ range $index, $issue := .Issues }}
            <div>{{ $issue.IssueCode }} {{ $issue.IssueText }} {{ $issue.Location.Path }}<br>
            {{index $scd $index}}
            </div>
        {{end}}
	</body>
</html>`

	// Declare routes.
	a.declareRoutes()

	// Collect the result to be rendered.
	if err = a.collectResultToBeRendered(); err != nil {
		return err
	}

	t, err := template.New("issues").Parse(tpl)
	if err != nil {
		fmt.Println(err)
	}

	data := ResultData{
		Title:          "Analyzer Dry Run",
		AnalysisResult: a.AnalysisResult,
		Issues:         a.AnalysisResult.Issues,
	}

	for _, issue := range a.AnalysisResult.Issues {
		data.RenderedSourceCode = append(data.RenderedSourceCode, template.HTML(issue.ProcessedData.SourceCode.Rendered))
	}

	http.HandleFunc("/", func(w http.ResponseWriter, _ *http.Request) {
		err = t.Execute(w, data)
		if err != nil {
			fmt.Println(err)
		}
	})
	log.Fatalln(http.ListenAndServe(":8080", nil))
	return nil
}

// collectResultToBeRendered formats all the result received after post-processing and then adds the
// extra data required for rendering on the browser
func (a *AnalyzerDryRun) collectResultToBeRendered() (err error) {
	cwd, _ := os.Getwd()
	analyzerIssue := types.AnalyzerIssue{}

	// Iterate over the reported issues and create the data to be shown on the browser.
	for i := 0; i < len(a.AnalysisResult.Issues); i++ {
		issueCode := a.AnalysisResult.Issues[i].IssueCode

		// Read the toml file of the issue in .deepsource/analyzer/issues directory
		issueFilePath := path.Join(cwd, ".deepsource/analyzer/issues", fmt.Sprintf("%s.toml", issueCode))

		// Read the issue and populate the data of issue category and description
		issueData, err := os.ReadFile(issueFilePath)
		if err != nil {
			return err
		}

		// Unmarshal the data from the issue TOMLs into the struct
		err = toml.Unmarshal(issueData, analyzerIssue)
		if err != nil {
			return err
		}
		a.AnalysisResult.Issues[i].IssueTitle = analyzerIssue.Title
		a.AnalysisResult.Issues[i].IssueCategory = analyzerIssue.Category
		a.AnalysisResult.Issues[i].IssueDescription = analyzerIssue.Description
	}

	// Create a map of occurences of the issues.
	issueOccurenceMap := make(map[types.Issue]int)
	for _, issue := range a.AnalysisResult.Issues {
		if _, ok := issueOccurenceMap[issue]; !ok {
			issueOccurenceMap[issue] = 1
			continue
		}
		issueOccurenceMap[issue] = issueOccurenceMap[issue] + 1
	}

	// Create a map of issue category to issue count
	// Iterate over the map and then keep adding the issue counts
	issueCategoryMap := make(map[string]int)
	for key, value := range issueOccurenceMap {
		if _, ok := issueCategoryMap[key.IssueCategory]; !ok {
			issueCategoryMap[key.IssueCategory] = value
			continue
		}
		issueCategoryMap[key.IssueCategory] = issueCategoryMap[key.IssueCategory] + value
	}

	// Get the VCS details like branch name and commit SHA.
	a.fetchVCSDetails()
	return nil
}

// fetchVCSDetails fetches the VCS details to be shown on the dashboard.
func (a *AnalyzerDryRun) fetchVCSDetails() (string, string, error) {
	// Fetch the branch name
	dir, err := os.Getwd()
	if err != nil {
		return "", "", err
	}

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

	return branchName.String(), latestCommitHash, nil
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
