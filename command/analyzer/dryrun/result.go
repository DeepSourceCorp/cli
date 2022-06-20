package dryrun

import (
	"errors"
	"os"
	"path"
	"strings"
)

// Writes the analysis results into a file with the name specified in the `fileName` parameter
func (a *AnalyzerDryRun) writeAnalysisResults(buf []byte, fileName string) (err error) {
	analysisResultsPath := path.Join(a.Client.AnalysisOpts.AnalysisResultsPath, fileName)

	// Ref: https://deepsource.io/directory/analyzers/go/issues/GSC-G305
	if !strings.Contains(string(buf), "..") {
		// Check if the results file already exists
		if _, err := os.Stat(analysisResultsPath); err != nil {
			if errors.Is(err, os.ErrNotExist) {
				// Create the file and allocate permissions to it
				_, err := os.Create(analysisResultsPath)
				if err != nil {
					return err
				}
				if err = os.Chmod(analysisResultsPath, 0o600); err != nil {
					return err
				}
			}
		}

		if err = os.WriteFile(path.Join(a.Client.AnalysisOpts.AnalysisResultsPath, fileName), buf, 0o600); err != nil {
			return err
		}
	}
	return nil
}
