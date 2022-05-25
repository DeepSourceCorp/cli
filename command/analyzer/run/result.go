package run

import (
	"encoding/json"
	"os"

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
	if err = json.Unmarshal(analysisResultsData, &analysisResultContent); err != nil {
		return err
	}
	return nil
}
