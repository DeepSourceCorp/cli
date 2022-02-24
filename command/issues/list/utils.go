package list

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/deepsourcelabs/cli/deepsource/issues"
)

func FilterIssuesByPath(path string, issuesData []issues.Issue) ([]issues.Issue, error) {
	var filteredIssues []issues.Issue
	for _, issue := range issuesData {
		up := ".." + string(os.PathSeparator)

		// get relative path
		rel, err := filepath.Rel(path, issue.Location.Path)
		if err != nil {
			return nil, err
		}

		// check if the relative path has a parent directory
		if !strings.HasPrefix(rel, up) && rel != ".." {
			filteredIssues = append(filteredIssues, issue)
		}
	}

	return filteredIssues, nil
}
