package processor

import (
	"log"

	"github.com/deepsourcelabs/cli/types"
)

type ProcessAnalysisResults struct {
	Processors     []string
	Report         types.DefaultAnalysisResult
	AnalysisResult types.AnalysisResult
}

/* Accepts the result as a byte array and processes the results in the form of a
 * AnalysisReport struct instance */
func (p *ProcessAnalysisResults) ProcessAnalysisResult() error {
	// Covert the result from the LSP based format to the default format
	p.formatLSPResultsToDefault()

	// Once the result has been converted to the DeepSource format, start processing the issues

	log.Println("Total issues: ", len(p.Report.Issues))

	if len(p.Report.Issues) != 0 {
		err := p.processIssues()
		if err != nil {
			return err
		}
	}
	log.Println("Issues after processing: ", len(p.Report.Issues))
	return nil
}

/* Prepare a map with unique filenames as key and the issue range for each file as value
 * This is done to ensure fewer loops when processing issues. */
type IssueRange struct {
	Filename   string // The file which has the issues
	BeginIndex int    // Array index in report.Issues where the particular issue starts
	EndIndex   int    // Array index in report.Issues where the particular issue ends
}

/* processIssues sorts the issues in an alphabetical order & processes the issues for the
 * various required processors.
 * As of now, there are two processors supported:
 * - proc_skipcq : Processes the issues and checks if some of them should be ignored since they have
 *                 been ignored by the user through suitable `skipcq` comments.
 * - proc_source_code_load :  Processes the issues for the source code snippets, highlights the snippets
 *                            and adds them to the Analysis result. */
func (p *ProcessAnalysisResults) processIssues() error {
	fileCount := 0 // for 1 file, 0 based indexing
	issuesRange := []IssueRange{}
	prevFilename := p.Report.Issues[0].Location.Path

	issueRange := IssueRange{
		BeginIndex: 0,
		EndIndex:   len(p.Report.Issues) - 1,
		Filename:   prevFilename,
	}
	issuesRange = append(issuesRange, issueRange)

	// Iterating over the issues and creating an array containing issues with index data about
	// the files in which those issues are present
	for i := 1; i < len(p.Report.Issues); i++ {
		issue := p.Report.Issues[i]
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
				EndIndex:   len(p.Report.Issues) - 1,
			}

			issuesRange = append(issuesRange, issueRange)
			prevFilename = currentFilename
		}
	}
	return nil
}

/* GenerateIssueRangeSlice generates an array containing the issue ranges with respect to files
 * that helps us to go through them and map them to the files where they got reported instead
 * of opening the file for each of them */
func (p *ProcessAnalysisResults) generateIssueRangeSlice() {
}

/* While this loop looks like it would have a complexity of len(filesWIssueRange) * len(cachedFiles) * issues * len(processorList)
 * it only has a complexity of O(len(report.Issues)).
 * When there are a lot of files to be processed, opening all of them one by one takes time, while the CPU waits idly.
 * Opening all files and loading them into memory is expensive in terms of space, since there could be a lot of files.
 * Hence, opening files concurrently in batches (of, say, 30 files) and then processing all issues in those 30 files one by one
 * appears to be the best option. We cannot process each file's issues concurrently, because only the file loading operation is
 * IO intensive, and the rest is CPU intensive. */
func (p *ProcessAnalysisResults) processIssuesBatch() {
}
