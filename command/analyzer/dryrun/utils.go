package dryrun

import (
	"fmt"
	"net/url"
	"os"
	"path"
	"strings"
	"time"

	analysis "github.com/deepsourcelabs/cli/analysis/config"
	"github.com/deepsourcelabs/cli/analysis/lsp"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/object"
	"github.com/hako/durafmt"
)

// isValidUrl tests a string to determine if it is a well-structured url or not.
func isValidUrl(toTest string) bool {
	_, err := url.ParseRequestURI(toTest)
	if err != nil {
		return false
	}

	u, err := url.Parse(toTest)
	if err != nil || u.Scheme == "" || u.Host == "" {
		return false
	}

	return true
}

// Modify the filepaths to use the container CODE_PATH and not the local CODE_PATH
// since the file will be mounted on the container and there, the container's path would
// only be resolvable
func modifyAnalysisConfigFilepaths(analysisConfig *analysis.AnalysisConfig, localCodePath, containerCodePath string) {
	for idx, file := range analysisConfig.Files {
		filePath := strings.TrimPrefix(string(file.URI), localCodePath)
		analysisConfig.Files[idx].URI = lsp.DocumentURI(path.Join(containerCodePath, filePath))
	}

	for idx, file := range analysisConfig.TestFiles {
		filePath := strings.TrimPrefix(string(file.URI), localCodePath)
		analysisConfig.TestFiles[idx].URI = lsp.DocumentURI(path.Join(containerCodePath, filePath))
	}

	for idx, file := range analysisConfig.ExcludedFiles {
		filePath := strings.TrimPrefix(string(file.URI), localCodePath)
		analysisConfig.ExcludedFiles[idx].URI = lsp.DocumentURI(path.Join(containerCodePath, filePath))
	}
}

// Creates a temporary directory with the name supplied as the parameter
func createTemporaryDirectory(directoryName string) (string, error) {
	return os.MkdirTemp("", directoryName)
}

/* Fetches environment variables like CODE_PATH and TOOLBOX_PATH set by the user
 * Check if the user supplied CODE_PATH and TOOLBOX_PATH, if not
 * use the default values of CODE_PATH and TOOLBOX_PATH  */
func fetchEnvironmentVariables() {
	// Set the value of container's code path
	if _, envVarPresent := os.LookupEnv("CODE_PATH"); envVarPresent {
		containerCodePath = os.Getenv("CODE_PATH")
	} else {
		containerCodePath = "/code"
	}

	// Set the value of container's toolbox path
	if _, envVarPresent := os.LookupEnv("TOOLBOX_PATH"); envVarPresent {
		containerToolBoxPath = os.Getenv("TOOLBOX_PATH")
	} else {
		containerToolBoxPath = "/toolbox"
	}
}

func (a *AnalyzerDryRun) createTemporaryToolBoxDir() (err error) {
	if a.TempToolBoxDirectory == "" {
		// Create a temporary directory
		if a.TempToolBoxDirectory, err = createTemporaryDirectory("toolbox"); err != nil {
			return err
		}
	}

	/* Assign the path of temporary local toolbox directory to the HostToolBoxPath(which shall be mounted into the container)
	 * and also use it to write the analysis_results.json file locally to the temporary */
	a.Client.AnalysisOpts.HostToolBoxPath = a.TempToolBoxDirectory
	a.Client.AnalysisOpts.AnalysisResultsPath = a.TempToolBoxDirectory
	return nil
}

// fetchRunSummary fetches the data for the run summary section involving the time since latest run
// and the run duration.
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
