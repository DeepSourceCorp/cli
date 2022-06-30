package render

import (
	"bytes"
	"fmt"
	"html/template"
	"net"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/deepsourcelabs/cli/types"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/object"
	"github.com/hako/durafmt"
	"github.com/pelletier/go-toml/v2"
	"github.com/yuin/goldmark"
)

// fetchRunSummary fetches the data for the run summary section involving the time since latest run
// and the run duration.
func fetchRunSummary(startTime, endTime time.Time) (string, string) {
	// Find the time elapsed since the analysis run.
	timeSinceRun := fmt.Sprintf("%s ago", durafmt.Parse(time.Since(startTime)).LimitFirstN(1).String())

	// Find the run duration i.e. the time between the analysis start and end time.
	runDuration := durafmt.Parse(endTime.Sub(startTime)).LimitFirstN(1).String()
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

	// Return the Analyzer diff info.
	switch commitsSinceCurrentTag {
	case 0:
		return fmt.Sprintf("This Analyzer is up to date with %s", currentTag)
	case 1:
		return fmt.Sprintf("This Analyzer is %d commit ahead of %s", commitsSinceCurrentTag, currentTag)
	}

	return fmt.Sprintf("This Analyzer is %d commits ahead of %s", commitsSinceCurrentTag, currentTag)
}

// getServerPort returns the port used to render the server.
func getServerPort() string {
	serverPort := ":8080"

	// Check if the default port(8080) is available.
	listener, err := net.Listen("tcp", serverPort)
	if err == nil {
		// Close the listener if it starts to listen on the default port.
		listener.Close()
		return strings.TrimPrefix(serverPort, ":")
	}

	// If the port is busy, get a new port.
	listener, _ = net.Listen("tcp", ":0")
	// Close the listener if it starts to listen on the default port.
	serverPort = strings.TrimPrefix(listener.Addr().String(), "[::]:")
	listener.Close()
	return serverPort
}

// getIssueMeta receives the issuecode that is raised and it reads the TOML of that issue and returns
// its details configured in the TOML like title, description and category.
func getIssueMeta(cwd, issueCode string) (types.AnalyzerIssue, error) {
	analyzerIssue := types.AnalyzerIssue{}
	// Read the toml file of the issue in .deepsource/analyzer/issues directory
	issueFilePath := filepath.Join(cwd, ".deepsource/analyzer/issues", fmt.Sprintf("%s.toml", issueCode))

	// Read the issue and populate the data of issue category and description
	issueData, err := os.ReadFile(issueFilePath)
	if err != nil {
		return analyzerIssue, err
	}

	// Unmarshal the data from the issue TOMLs into the struct
	if err = toml.Unmarshal(issueData, &analyzerIssue); err != nil {
		return analyzerIssue, err
	}

	// Parsing the markdown issue description and passing it as an HTML string.
	var buf bytes.Buffer
	if err := goldmark.Convert([]byte(analyzerIssue.Description), &buf); err != nil {
		return types.AnalyzerIssue{}, err
	}
	analyzerIssue.HTMLDescription = template.HTML(buf.String())

	return analyzerIssue, nil
}
