package processor

import (
	"encoding/json"
	"fmt"
	"os"
	"path"

	"github.com/deepsourcelabs/cli/types"
)

const sourceCodeOffset int = 3

type fileContentNode struct {
	Filename    string
	FileContent []string
}

type ProcessAnalysisResults struct {
	CodePath        string
	Processors      []string             // The list of supported post-analysis processors.
	ProcessedIssues []types.Issue        // List of issues post-processing.
	Report          types.AnalyzerReport // The report generated by the Analyzer post analysis.
	AnalysisResult  types.AnalysisResult // The final result published post processing the Analyzer report.
}

/* Accepts the result as a byte array and processes the results in the form of a
 * AnalyzerReport struct instance. */
func (p *ProcessAnalysisResults) ProcessAnalysisResult() error {
	// Covert the Analyzer report from LSP based format to the default results format.
	p.formatLSPResultsToDefault()
	fmt.Println("Total issues reported by the Analyzer: ", len(p.AnalysisResult.Issues))

	// Once the result has been converted to the DeepSource format, start processing the issues.
	if len(p.AnalysisResult.Issues) > 0 {
		err := p.processIssues()
		if err != nil {
			return err
		}
	}

	// REMOVE THIS-----------------------------------------------------------
	fmt.Println("Issues after processing: ", len(p.AnalysisResult.Issues))
	b, _ := json.Marshal(p.AnalysisResult.Issues)
	if err := os.WriteFile(path.Join("/Users/phoenix/Code/deepsource/result.json"), b, 0o600); err != nil {
		return err
	}
	// -----------------------------------------------------------------------
	return nil
}

/* processIssues sorts the issues in an alphabetical order of filenames just to ensure that all issues getting
 * reported for the same files come together & processes the issues for the various required processors.
 * As of now, there are two processors supported:
 * - skipcq : Processes the issues and checks if some of them should be ignored since they have
 *            been ignored by the user through suitable `skipcq` comments.
 * - source_code_load :  Processes the issues for the source code snippets, highlights the snippets
 *                       and adds them to the Analysis result. */
func (p *ProcessAnalysisResults) processIssues() error {
	// All the files that appear in the issues are now processed by the processors listed in analyzer conf
	// We must cache the files in order to not do file IO for every processor.
	p.sortIssuesByFile()

	// Get the issues to file range.
	filesIndex := createIssueFileRange(p.AnalysisResult)
	fmt.Println(filesIndex)

	// Generate the silencers regexMap.
	generateSilencersRegexMap()

	// Iterate over the filesIndex and read the files and process the issues using the suitable processors.
	p.processIssuesBatch(filesIndex)
	p.AnalysisResult.Issues = p.ProcessedIssues

	// Sort again for consistency (mostly for test to pass).
	p.sortIssuesByFile()

	return nil
}