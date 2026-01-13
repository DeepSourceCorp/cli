package issues

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/deepsourcelabs/cli/deepsource/issues"
)

// FilterIssuesByPath filters issues based on a path, works for directories and files.
func FilterIssuesByPath(path string, issuesData []issues.Issue) ([]issues.Issue, error) {
	var filteredIssues []issues.Issue
	for _, issue := range issuesData {
		up := ".." + string(os.PathSeparator)

		rel, err := filepath.Rel(path, issue.Location.Path)
		if err != nil {
			return nil, err
		}

		if rel == "." {
			filteredIssues = append(filteredIssues, issue)
		}

		if !strings.HasPrefix(rel, up) && rel != ".." {
			filteredIssues = append(filteredIssues, issue)
		}
	}

	return UniqueIssues(filteredIssues), nil
}

// FilterIssuesByAnalyzer filters issues based on analyzer shortcodes.
func FilterIssuesByAnalyzer(analyzer []string, issuesData []issues.Issue) ([]issues.Issue, error) {
	var filteredIssues []issues.Issue

	analyzerMap := make(map[string]bool)
	for _, shortcode := range analyzer {
		analyzerMap[shortcode] = true
	}

	for _, issue := range issuesData {
		if analyzerMap[issue.Analyzer.Shortcode] {
			filteredIssues = append(filteredIssues, issue)
		}
	}

	return UniqueIssues(filteredIssues), nil
}

// UniqueIssues returns de-duplicated issues.
func UniqueIssues(fetchedIssues []issues.Issue) []issues.Issue {
	var uniqueIssues []issues.Issue
	inUnique := make(map[issues.Issue]bool)

	for _, issue := range fetchedIssues {
		if _, ok := inUnique[issue]; !ok {
			inUnique[issue] = true
			uniqueIssues = append(uniqueIssues, issue)
		}
	}

	return uniqueIssues
}
