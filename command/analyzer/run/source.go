package run

import (
	"fmt"
	"os"

	analysis_config "github.com/deepsourcelabs/cli/analysis/config"
	"github.com/go-git/go-git/v5"
)

func (a *AnalyzerRunOpts) prepareSourceForAnalysis() (err error) {
	// Resolve the path of source code to be analyzed based on the user input
	a.Client.AnalysisOpts.HostCodePath, err = a.resolveAnalysisSourcePath()
	if err != nil {
		return err
	}

	/* Prepare the analysis_config.json here and mount into the container at `TOOLBOX_PATH/analysis_config.json`
	 * The analysis_config.json will have path prepended with the CODE_PATH of the container and not local CODE_PATH */
	analysisRun := analysis_config.AnalysisRun{
		AnalyzerName:      a.Client.AnalysisOpts.AnalyzerName,
		LocalCodePath:     a.Client.AnalysisOpts.HostCodePath,
		ContainerCodePath: containerCodePath,
	}

	analysisConfig, err := analysisRun.ConfigureAnalysis()
	if err != nil {
		return err
	}

	// Modify the paths of analysis_config.json file to use the container based CODE_PATH instead
	// of the local CODE_PATH
	modifyAnalysisConfigFilepaths(analysisConfig, a.Client.AnalysisOpts.HostCodePath, a.Client.AnalysisOpts.ContainerCodePath)

	// Write the analysis_config.json to TOOLBOX_PATH
	if err = a.writeAnalysisConfig(analysisConfig); err != nil {
		return err
	}

	/* Assign the path of temporary local toolbox directory to the HostToolBoxPath(which shall be mounted into the container)
	 * and also use it to write the analysis_results.json file locally to the temporary */
	a.Client.AnalysisOpts.HostToolBoxPath = a.TempToolBoxDirectory
	a.Client.AnalysisOpts.AnalysisResultsPath = a.TempToolBoxDirectory

	return nil
}

/* Resolves the code to be analyzed by the Analyzer.
 * The user passes it as an argument to the command `deepsource analyzer run <directory/repository URL>`
 * Parse the argument and check if its a URL, if not then resolve the local directory path */
func (a *AnalyzerRunOpts) resolveAnalysisSourcePath() (string, error) {
	// Check if the source path is a valid VCS URL
	if isValidUrl(a.SourcePath) {
		fmt.Println("VALID URL")
		tempCloneDir, err := a.cloneRemoteSource()
		if err != nil {
			return "", err
		}
		a.SourcePath = tempCloneDir
	}
	return a.SourcePath, nil
}

func (a *AnalyzerRunOpts) cloneRemoteSource() (string, error) {
	var err error

	a.RemoteSource = true
	if a.TempCloneDirectory, err = createTemporaryDirectory("code"); err != nil {
		return "", err
	}

	// Clone the repository to a temporary directory
	fmt.Printf("Cloning %s to %s\n", a.SourcePath, a.TempCloneDirectory)
	if _, err := git.PlainClone(a.TempCloneDirectory, false, &git.CloneOptions{
		URL:      a.SourcePath,
		Depth:    1,
		Progress: os.Stdout,
	}); err != nil {
		return "", err
	}
	return a.TempCloneDirectory, nil
}
