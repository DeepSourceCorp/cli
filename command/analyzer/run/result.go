package run

import (
	"encoding/json"
	"fmt"
	"os"
	"path"
	"strings"

	analysis_config "github.com/deepsourcelabs/cli/analysis/config"
)

// Reads the LSP based analysis result written in the `analysis_results.json` file present in
// the directory of the Analyzer
func (*AnalyzerRunOpts) processAnalysisResult() (err error) {
	analysisResultsData, err := os.ReadFile("analysis_results.json")
	if err != nil {
		return err
	}

	// Unmarshal the analysis result data present in the LSP format
	analysisResultContent := analysis_config.AnalysisResult{}
	return json.Unmarshal(analysisResultsData, &analysisResultContent)
}

// Writes the analysis results into a file with the name `fileName`
func (a *AnalyzerRunOpts) writeAnalysisResults(buf []byte, fileName string) (err error) {
	// Ref: https://deepsource.io/directory/analyzers/go/issues/GSC-G305
	if !strings.Contains(string(buf), "..") {
		fmt.Println("Writing analysis result to", path.Join(a.Client.AnalysisOpts.AnalysisResultsPath, fileName))
		if err = os.WriteFile(path.Join(a.Client.AnalysisOpts.AnalysisResultsPath, fileName), buf, 0o644); err != nil {
			return err
		}
	}
	return nil
}
