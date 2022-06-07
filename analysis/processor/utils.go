package processor

import (
	"io/ioutil"
	"log"
	"path"
	"sort"
	"strings"

	"github.com/deepsourcelabs/cli/types"
)

func (p *ProcessAnalysisResults) sortIssuesByFile() {
	sort.Slice(p.AnalysisResult.Issues, func(i, j int) bool {
		return p.AnalysisResult.Issues[i].Location.Path < p.AnalysisResult.Issues[j].Location.Path
	})
}

/* Prepare a map with unique filenames as key and the issue range for each file as value
 * This is done to ensure fewer loops when processing issues. */
type IssueRange struct {
	Filename   string // The file which has the issues
	BeginIndex int    // Array index in report.Issues where the particular issue starts
	EndIndex   int    // Array index in report.Issues where the particular issue ends
}

/* GenerateIssueRangeSlice generates an array containing the issue ranges with respect to files
 * that helps us to go through them and map them to the files where they got reported instead
 * of opening the file for each of them */
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

/* Converts the LSP based analysis results into the default format supported by DeepSource */
func (p *ProcessAnalysisResults) formatLSPResultsToDefault() {
	p.AnalysisResult.IsPassed = p.Report.IsPassed
	p.AnalysisResult.Metrics = append(p.Report.Metrics, p.AnalysisResult.Metrics...)
	p.AnalysisResult.Errors = append(p.Report.Errors, p.AnalysisResult.Errors...)

	// Appending the issues to the default format of Analysis report
	for _, issue := range p.Report.Issues {
		analysisIssue := types.Issue{
			IssueCode: issue.Code,
			IssueText: issue.Message,
			Location: types.Location{
				Path: issue.RelatedInformation[0].Location.URI,
				Position: types.Position{
					Begin: types.Coordinate{
						Line:   issue.Range.Start.Line,
						Column: issue.Range.Start.Character,
					},
					End: types.Coordinate{
						Line:   issue.Range.End.Line,
						Column: issue.Range.End.Character,
					},
				},
			},
		}
		p.AnalysisResult.Issues = append(p.AnalysisResult.Issues, analysisIssue)
	}
}

func addFileToCache(cachedFilesChannel chan fileContentNode, filename, codePath string) {
	fileContentSlice := []string{}

	fileContentBytes, err := ioutil.ReadFile(path.Join(codePath, filename))
	if err != nil {
		log.Println("Could not process for file: ", filename, ". Err: ", err)
	} else if string(fileContentBytes) != "" {
		fileContentSlice = strings.Split(string(fileContentBytes), "\n")
	} else {
		fileContentSlice = []string{}
	}

	cachedFilesChannel <- fileContentNode{
		Filename:    filename,
		FileContent: fileContentSlice,
	}
}
