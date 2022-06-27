package dryrun

import (
	"embed"
	"fmt"
	"html/template"
	"io/fs"
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

/* TODO:
 * - Fix the case of running analysis on VCS repo.
 * - Fix the case of stripping cwd from the paths.
 * - Handle the case when error is found.
 * - Handle singularization / pluralization
 *  */

//go:embed views/*.html views/**/*.css
var tmplFS embed.FS

type RunSummary struct {
	RunDuration  string // Time taken to complete analysis.
	TimeSinceRun string // Time elapsed since the completion of the analysis run.
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
	RenderedSourceCode    []template.HTML          // The slice containing the source code snippets for each occurence.
}

type DataRenderOpts struct {
	Template             *template.Template // The go template field so that it can be accessible in `route.go` as well.
	PageTitle            string             // The title of the HTML page.
	AnalyzerShortcode    string             // The shortcode of the Analyzer.
	VCSInfo              VCSInfo            // The VCS information of the Analyzer.
	Summary              RunSummary         // The run summary.
	AnalysisResultData   ResultData         // The analysis result data.
	SelectedIssueCode    string             // The field used to recognize which issue code the user has clicked on to check its occurences.
	SelectedCategory     string             // The field used to recognize which category the user has clicked to filter the issues based on it.
	IssueCategoryNameMap map[string]string  // The map used to route category names to their codes. Eg: `Documentation`->`doc`.
}

// renderResultsOnBrowser renders the results on the browser through a local server,
// go template and an awesome frontend.
func (a *AnalyzerDryRun) renderResultsOnBrowser() (err error) {
	// Initialize `DataRenderOpts` with some of the data needed to be rendered.
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

	// Collect all other data to be rendered.
	if err = d.collectResultToBeRendered(); err != nil {
		return err
	}

	// In order to serve the static css files, this creates a handler to serve any static assets stored under
	// `views/` at `/static/assets/*`.
	fsys, err := fs.Sub(tmplFS, "views")

	// Parse the HTML templates.
	d.Template = template.Must(template.ParseFS(tmplFS, "views/*.html"))
	if err != nil {
		return err
	}

	// Define the routes using echo and start the server.
	echoInstance := d.declareRoutes(http.FS((fsys)))

	// Having received the user code, open the browser at the localhost:8080 endpoint.
	err = browser.OpenURL("http://localhost:8080")
	if err != nil {
		return err
	}
	return echoInstance.Start(":8080")
}

// collectResultToBeRendered formats all the result received after post-processing and then adds the
// extra data required for rendering on the browser
func (d *DataRenderOpts) collectResultToBeRendered() (err error) {
	cwd, _ := os.Getwd()

	// Fetch the run summary data.
	d.Summary.RunDuration, d.Summary.TimeSinceRun = fetchRunSummary()

	// Inject the Analyzer VCS information.
	d.VCSInfo.Branch, d.VCSInfo.CommitSHA = fetchVCSDetails(cwd)

	// Fetch the data as to status of Analyzer w.r.t the latest version/tag.
	d.VCSInfo.VersionDiff = fetchAnalyzerVCSData(cwd)

	d.getOccurencesData(cwd)
	d.getCategoryData()
	return nil
}

func (d *DataRenderOpts) getOccurencesData(cwd string) (err error) {
	// Create a map of occurences of the issues.
	issueOccurenceMap := make(map[string]OccurenceData)

	// Iterate over the analysis result issues.
	for _, issue := range d.AnalysisResultData.AnalysisResult.Issues {
		currentOccurence := OccurenceData{}

		if _, ok := issueOccurenceMap[issue.IssueCode]; !ok {
			// Fetch issue meta for the issue code raised.
			issueMeta, err := getIssueMeta(cwd, issue.IssueCode)
			if err != nil {
				fmt.Println(err)
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
	for issueCode, occurenceData := range issueOccurenceMap {
		filesMap := make(map[string]int, 0)
		uniqueFiles := make([]string, 0)

		// Setting the map value to 1 for the files in order to identify unique files.
		for _, file := range occurenceData.Files {
			filesMap[file] = 1
		}

		// Appending the unique files.
		for file := range filesMap {
			uniqueFiles = append(uniqueFiles, file)
		}
		occurence := issueOccurenceMap[issueCode]
		occurence.Files = append(occurence.Files, uniqueFiles...)
		issueOccurenceMap[issueCode] = occurence
	}

	// Create the files information string.
	for issueCode, occurenceData := range issueOccurenceMap {
		// TODO: Strip the cwd from the path sent here.
		occurenceData.FilesInfo = fmt.Sprintf("Found in %s and %d other file(s)", occurenceData.Files[0], len(occurenceData.Files)-1)
		issueOccurenceMap[issueCode] = occurenceData
	}
	d.AnalysisResultData.IssuesOccurenceMap = issueOccurenceMap

	// Find out total occurences.
	for _, v := range issueOccurenceMap {
		d.AnalysisResultData.TotalOccurences = d.AnalysisResultData.TotalOccurences + len(v.Occurences)
	}
	d.AnalysisResultData.UniqueIssuesCount = len(d.AnalysisResultData.IssuesOccurenceMap)
	return nil
}

func (d *DataRenderOpts) getCategoryData() {
	// Create a map of issue category to issue count.
	// Iterate over the map and then keep adding the issue counts.
	issueCategoryMap := make(map[string]int)
	for _, occurenceData := range d.AnalysisResultData.IssuesOccurenceMap {
		if _, ok := issueCategoryMap[occurenceData.IssueMeta.Category]; !ok {
			issueCategoryMap[occurenceData.IssueMeta.Category] = len(occurenceData.Occurences)
			continue
		}
		issueCategoryMap[occurenceData.IssueMeta.Category] = issueCategoryMap[occurenceData.IssueMeta.Category] + len(occurenceData.Occurences)
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
	// Open the Analyzer's git directory.
	repo, err := git.PlainOpenWithOptions(dir, &git.PlainOpenOptions{
		DetectDotGit: true,
	})
	if err != nil {
		fmt.Println(err)
		return ""
	}

	// Fetch the repo tags list.
	tagReferences, _ := repo.Tags()
	currentTagRef := []string{}
	if err = tagReferences.ForEach(func(t *plumbing.Reference) error {
		currentTagRef = append(currentTagRef, t.Name().String())
		return nil
	}); err != nil {
		fmt.Println(err)
		return ""
	}

	// currentTagRef slice is empty if there are not tags in the Analyzer git directory.
	if len(currentTagRef) == 0 {
		return ""
	}

	// Convert refs/tags/v0.2.1 -> v0.2.1
	latestTag := strings.TrimPrefix(currentTagRef[len(currentTagRef)-1], "refs/tags/")

	// Fetch the iterator to the tag objects latest git tag.
	tagsIter, _ := repo.TagObjects()

	// Fetch the current tag and the commit pointed by the current tag.
	currentTag := ""
	var currentCommitSHA plumbing.Hash
	var currentTagPushTime time.Time
	if err = tagsIter.ForEach(func(t *object.Tag) (err error) {
		if t.Name != latestTag {
			return nil
		}
		currentTag = t.Name
		commit, err := t.Commit()
		if err != nil {
			fmt.Println(err)
			return err
		}

		// Finds the hash of the commit and the timestamp of when the commit was pushed.
		currentCommitSHA = commit.Hash
		currentTagPushTime = commit.Author.When
		return nil
	}); err != nil {
		fmt.Println(err)
		return ""
	}

	// Retrieve the commit history from the current tag.
	commitIter, err := repo.Log(&git.LogOptions{
		Order: git.LogOrderCommitterTime,
		Since: &currentTagPushTime,
	})
	if err != nil {
		fmt.Println(err)
		return ""
	}

	// Just iterates over the commits and finds the count of how many commits have been
	// made since the current git tag.
	commitsSinceCurrentTag := 0
	if err = commitIter.ForEach(func(c *object.Commit) error {
		if c.Hash == currentCommitSHA {
			return nil
		}
		commitsSinceCurrentTag++
		return nil
	}); err != nil {
		fmt.Println(err)
		return ""
	}

	if commitsSinceCurrentTag == 0 {
		return fmt.Sprintf("This Analyzer is up to date with %s", currentTag)
	}
	return fmt.Sprintf("This Analyzer is %d commits ahead of %s", commitsSinceCurrentTag, currentTag)
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
func fetchRunSummary() (string, string) {
	// Find the time elapsed since the analysis run.
	timeSinceRun := fmt.Sprintf("%s ago", durafmt.Parse(time.Since(analysisEndTime)).LimitFirstN(1).String())

	// Find the run duration i.e. the time between the analysis start and end time.
	runDuration := durafmt.Parse(analysisEndTime.Sub(analysisStartTime)).LimitFirstN(1).String()
	return runDuration, timeSinceRun
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
