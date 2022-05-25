package run

import (
	"fmt"
	"os"
	"path"
	"strings"
)

// Writes the analysis results into a file with the name specified in the `fileName` parameter
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
