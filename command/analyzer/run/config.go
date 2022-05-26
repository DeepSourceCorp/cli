package run

import (
	"encoding/json"
	"fmt"
	"os"
	"path"

	analysis_config "github.com/deepsourcelabs/cli/analysis/config"
)

// Prepares the analysis config and writes it to TOOLBOX_PATH
func (a *AnalyzerDryRun) prepareAnalysisConfig() (err error) {
	/* Prepare the analysis_config.json here and mount into the container at `TOOLBOX_PATH/analysis_config.json`
	 * The analysis_config.json will have path prepended with the CODE_PATH of the container and not local CODE_PATH */
	analysisRun := analysis_config.AnalysisRun{
		AnalyzerName:      a.Client.AnalysisOpts.AnalyzerName,
		LocalCodePath:     a.Client.AnalysisOpts.HostCodePath,
		ContainerCodePath: containerCodePath,
	}

	if a.AnalysisConfig, err = analysisRun.ConfigureAnalysis(); err != nil {
		return err
	}
	return nil
}

// Writes the analysis_config.json into a temporary directory which shall be mounted as TOOLBOX directory in the container
func (a *AnalyzerDryRun) writeAnalysisConfig() (err error) {
	// Modify the paths of analysis_config.json file to use the container based CODE_PATH instead
	// of the local CODE_PATH
	modifyAnalysisConfigFilepaths(a.AnalysisConfig, a.Client.AnalysisOpts.HostCodePath, a.Client.AnalysisOpts.ContainerCodePath)

	// Marshal the analysis_config data into JSON
	analysisConfigJSON, err := json.Marshal(a.AnalysisConfig)
	if err != nil {
		return err
	}
	a.Client.AnalysisOpts.AnalysisConfigPath = path.Join(a.TempToolBoxDirectory, analysisConfigName+analysisConfigExt)

	// Create a temporary directory
	fmt.Printf("Writing analysis_config to %s\n", a.TempToolBoxDirectory)
	return os.WriteFile(path.Join(a.TempToolBoxDirectory, analysisConfigName+analysisConfigExt), analysisConfigJSON, 0o644)
}
