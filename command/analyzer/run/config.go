package run

import (
	"encoding/json"
	"fmt"
	"os"
	"path"

	analysis_config "github.com/deepsourcelabs/cli/analysis/config"
)

// Writes the analysis_config.json into a temporary directory which shall be mounted as TOOLBOX directory in the container
func (a *AnalyzerRunOpts) writeAnalysisConfig(analysisConfig *analysis_config.AnalysisConfig) (err error) {
	// Create a temporary directory
	if a.TempToolBoxDirectory, err = createTemporaryDirectory("toolbox"); err != nil {
		return err
	}

	// Marshal the analysis_config data into JSON
	analysisConfigJSON, err := json.Marshal(analysisConfig)
	if err != nil {
		return err
	}

	// Create a temporary directory
	fmt.Printf("Writing analysis_config to %s\n", a.TempToolBoxDirectory)
	return os.WriteFile(path.Join(a.TempToolBoxDirectory, analysisConfigName+analysisConfigExt), analysisConfigJSON, 0o644)
}
