package dryrun

import (
	"embed"
	"fmt"
	"html/template"
	"net/http"
	"os"
	"path"
	"strings"
	"time"

	"github.com/cli/browser"
	"github.com/deepsourcelabs/cli/types"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/object"
	"github.com/hako/durafmt"
	"github.com/pelletier/go-toml/v2"
)

//go:embed views/*.html
var tmplFS embed.FS

type RunSummary struct {
	CurrentTime  string // <Month> <Date>, <Year> HH:MM am/pm
	RunDuration  string // <x> minutes <y> seconds
	TimeSinceRun string // <x> <seconds/minutes> ago
}

type VCSInfo struct {
	Branch      string
	CommitSHA   string
	VersionDiff string
}

type OccurenceData struct {
	IssueMeta  types.AnalyzerIssue
	Files      []string // Files where this issue has been reported.
	FilesInfo  string
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
	Summary              RunSummary
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
		PageTitle:         "Analyzer Dry Run",
		AnalyzerShortcode: a.Client.AnalysisOpts.AnalyzerShortcode,
		AnalysisResultData: ResultData{
			AnalysisResult: a.AnalysisResult,
			SourcePath:     a.SourcePath,
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
	d.VCSInfo.Branch, d.VCSInfo.CommitSHA = fetchVCSDetails(cwd)

	// Fetch the Analyzer tags data.
	d.VCSInfo.VersionDiff = fetchAnalyzerVCSData(cwd)

	// Fetch the run summary data.
	d.Summary.RunDuration, d.Summary.TimeSinceRun, d.Summary.CurrentTime = fetchRunSummary()

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
			currentOccurence.Files = append(currentOccurence.Files, issue.Location.Path)
			issueOccurenceMap[issue.IssueCode] = currentOccurence
			continue
		}

		// Get past occurences and append to it since maps don't allow direct append to a slice value.
		pastOccurences := issueOccurenceMap[issue.IssueCode]
		currentOccurence.IssueMeta = pastOccurences.IssueMeta
		currentOccurence.Occurences = append(pastOccurences.Occurences, issue)
		currentOccurence.Files = append(pastOccurences.Files, issue.Location.Path)
		issueOccurenceMap[issue.IssueCode] = currentOccurence
	}

	// Remove duplicates from the files array.
	for k, v := range issueOccurenceMap {
		filesMap := make(map[string]int, 0)
		uniqueFiles := make([]string, 0)
		for _, file := range v.Files {
			filesMap[file] = 1
		}

		for file := range filesMap {
			uniqueFiles = append(uniqueFiles, file)
		}
		occurence := issueOccurenceMap[k]
		occurence.Files = append(occurence.Files, uniqueFiles...)
		issueOccurenceMap[k] = occurence
	}

	// Create the files information string.
	for k, v := range issueOccurenceMap {
		v.FilesInfo = fmt.Sprintf("Found in %s and %d other file(s)", v.Files[0], len(v.Files)-1)
		issueOccurenceMap[k] = v
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

// fetchAnalyzerVCSDetails fetches Analyzer VCS details like how many commits is the Analyzer
// ahead of the latest git tag.
func fetchAnalyzerVCSData(dir string) string {
	// Git open the Analyzer directory.
	repo, err := git.PlainOpenWithOptions(dir, &git.PlainOpenOptions{
		DetectDotGit: true,
	})
	if err != nil {
		return ""
	}

	// Fetch the repo tags list.
	tagrefs, _ := repo.Tags()
	currentTagRef := ""
	_ = tagrefs.ForEach(func(t *plumbing.Reference) error {
		currentTagRef = t.Name().String()
		return nil
	})

	// Convert refs/tags/v0.2.1 -> v0.2.1
	currentTagRef = strings.TrimPrefix(currentTagRef, "refs/tags/")

	// Fetch the iterator to the tag objects latest git tag.
	tagsIter, _ := repo.TagObjects()

	// Fetch the current tag and the commit pointed by the current tag.
	currentTag := ""
	var currentCommitSHA plumbing.Hash
	var currentTagPushTime time.Time
	if err = tagsIter.ForEach(func(t *object.Tag) (err error) {
		if t.Name != currentTagRef {
			return nil
		}
		currentTag = t.Name
		commit, err := t.Commit()
		if err != nil {
			return err
		}
		currentCommitSHA = commit.Hash
		currentTagPushTime = commit.Author.When
		return nil
	}); err != nil {
		return ""
	}

	// Retrieve the commit history from the current tag.
	commitIter, err := repo.Log(&git.LogOptions{
		Order: git.LogOrderCommitterTime,
		Since: &currentTagPushTime,
	})
	if err != nil {
		return ""
	}

	// Just iterates over the commits and finds the count of how many commits have been
	// made since the current git tag.
	commitsSinceCurrentTag := 0
	_ = commitIter.ForEach(func(c *object.Commit) error {
		if c.Hash == currentCommitSHA {
			return nil
		}
		commitsSinceCurrentTag++
		return nil
	})

	if commitsSinceCurrentTag <= 1 {
		return fmt.Sprintf("This Analyzer is up to date with %s", currentTag)
	}
	return fmt.Sprintf("This Analyzer is %d commits ahead of %s", commitsSinceCurrentTag-1, currentTag)
}

// fetchVCSDetails fetches the VCS details to be shown on the dashboard.
func fetchVCSDetails(dir string) (string, string) {
	branch := ""
	latestCommitHash := ""

	repo, err := git.PlainOpen(dir)
	if err != nil {
		return "", ""
	}

	// Fetch the repository HEAD reference.
	headRef, _ := repo.Head()

	// Fetch the commit SHA of the latest commit
	latestCommitHash, _ = fetchHeadManually(dir)

	// Fetch the branch name.
	branchData := headRef.String()
	branch = branchData[strings.LastIndex(branchData, "/")+1:]

	return branch, latestCommitHash[:7]
}

// fetchRunSummary fetches the data for the run summary section.
func fetchRunSummary() (string, string, string) {
	// The layout to format the current timestamp to.
	const (
		layout = "January 2, 2006 3:04 PM"
	)
	currentDate := time.Now().Format(layout)

	// Find the time elapsed since the analysis run.
	timeSinceRun := fmt.Sprintf("%s ago", durafmt.Parse(time.Since(analysisEndTime)).LimitFirstN(1).String())

	// Find the run duration i.e. the time between the analysis start and end time.
	runDuration := durafmt.Parse(analysisEndTime.Sub(analysisStartTime)).LimitFirstN(1).String()
	return runDuration, timeSinceRun, currentDate
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
