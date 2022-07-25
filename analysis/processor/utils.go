package processor

import (
	"path"
	"sort"
	"strings"

	"github.com/deepsourcelabs/cli/types"
)

// sortIssuesByFile sorts the issues in an alphabetical order according to the filenames
// where they got reported.
func (p *ReportProcessor) sortIssuesByFile(result *types.AnalysisResult) {
	sort.Slice(result.Issues, func(i, j int) bool {
		return result.Issues[i].Location.Path < result.Issues[j].Location.Path
	})
}

// Prepare a map with unique filenames as key and the issue range for each file as value
// This is done to ensure fewer loops when processing issues.
type IssueRange struct {
	Filename   string // The file which has the issues
	BeginIndex int    // Array index in report.Issues where the particular issue starts
	EndIndex   int    // Array index in report.Issues where the particular issue ends
}

// GenerateIssueRangeSlice generates an array containing the issue ranges with respect to files
// that helps us to go through them and map them to the files where they got reported instead
// of opening the file for each of them. The generated index looks like this:

// [{analyzer.go 0 0} {autofix_patch.go 1 1} {difftool.go 2 2} {patch.patch 3 5} {proc_skip_cq_test.go 6 6}]

// Here, the first field if filename and the second and third fields are the index range in which the issues reported
// in these files lie in the sorted AnalyzerReport slice.
func createIssueFileRange(report types.AnalysisResult) []IssueRange {
	fileCount := 0 // for 1 file, 0 based indexing
	issuesRange := []IssueRange{}
	prevFilename := report.Issues[0].Location.Path

	issueRange := IssueRange{
		BeginIndex: 0,
		EndIndex:   len(report.Issues) - 1,
		Filename:   prevFilename,
	}
	issuesRange = append(issuesRange, issueRange)

	// Iterating over the issues and creating an array containing issues with index data about
	// the files in which those issues are present
	for i := 1; i < len(report.Issues); i++ {
		issue := report.Issues[i]
		currentFilename := issue.Location.Path

		// TODO: Check when this condition is implied
		if issue.Location.Position.End.Line == -1 {
			issue.Location.Position.End.Line = issue.Location.Position.Begin.Line
		}

		if currentFilename != prevFilename {
			fileCount++

			issueRange = issuesRange[fileCount-1]
			issueRange.EndIndex = i - 1
			issuesRange[fileCount-1] = issueRange

			// Create for the new file
			issueRange = IssueRange{
				Filename:   currentFilename,
				BeginIndex: i,
				EndIndex:   len(report.Issues) - 1,
			}

			issuesRange = append(issuesRange, issueRange)
			prevFilename = currentFilename
		}
	}
	return issuesRange
}

// formatLSPResultsToDefault converts the LSP based analysis results into the default format supported by DeepSource.
func (p *ReportProcessor) formatLSPResultsToDefault() types.AnalysisResult {
	analysisResult := types.AnalysisResult{}
	analysisResult.IsPassed = p.Report.IsPassed
	analysisResult.Metrics = append(analysisResult.Metrics, p.Report.Metrics...)
	analysisResult.Errors = append(analysisResult.Errors, p.Report.Errors...)

	// Appending the issues to the default format of Analysis report
	for _, issue := range p.Report.Issues {
		analysisIssue := types.Issue{
			IssueCode: issue.Code,
			IssueText: issue.Title,
			Location: types.Location{
				Path: p.sanitizeFilePath(issue.Location.Path),
				Position: types.Position{
					Begin: types.Coordinate{
						Line:   issue.Location.Position.Begin.Line,
						Column: issue.Location.Position.Begin.Column,
					},
					End: types.Coordinate{
						Line:   issue.Location.Position.End.Line,
						Column: issue.Location.Position.End.Column,
					},
				},
			},
		}
		analysisResult.Issues = append(analysisResult.Issues, analysisIssue)
	}
	return analysisResult
}

func (p *ReportProcessor) sanitizeFilePath(filePath string) string {
	return path.Join(p.LocalSourcePath, strings.TrimPrefix(filePath, p.ContainerCodePath))
}
