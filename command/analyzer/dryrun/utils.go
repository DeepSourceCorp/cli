package dryrun

import (
	"net/url"
	"os"
	"path"
	"strings"

	analysis "github.com/deepsourcelabs/cli/analysis/config"
)

// isValidUrl tests a string to determine if it is a well-structured url or not.
func isValidUrl(toTest string) bool {
	_, err := url.ParseRequestURI(toTest)
	if err != nil {
		return false
	}

	u, err := url.Parse(toTest)
	if err != nil || u.Scheme == "" || u.Host == "" {
		return false
	}

	return true
}

// Modify the filepaths to use the container CODE_PATH and not the local CODE_PATH
// since the file will be mounted on the container and there, the container's path would
// only be resolvable
func modifyAnalysisConfigFilepaths(analysisConfig *analysis.AnalysisConfig, localCodePath, containerCodePath string) {
	for idx, file := range analysisConfig.Files {
		filePath := strings.TrimPrefix(file, localCodePath)
		analysisConfig.Files[idx] = path.Join(containerCodePath, filePath)
	}

	for idx, file := range analysisConfig.TestFiles {
		filePath := strings.TrimPrefix(file, localCodePath)
		analysisConfig.TestFiles[idx] = path.Join(containerCodePath, filePath)
	}

	for idx, file := range analysisConfig.ExcludeFiles {
		filePath := strings.TrimPrefix(file, localCodePath)
		analysisConfig.ExcludeFiles[idx] = path.Join(containerCodePath, filePath)
	}
}

// Creates a temporary directory with the name supplied as the parameter
func createTemporaryDirectory(directoryName string) (string, error) {
	return os.MkdirTemp("", directoryName)
}

func (a *AnalyzerDryRun) createTemporaryToolBoxDir() (err error) {
	if a.TempToolBoxDirectory == "" {
		// Create a temporary directory
		if a.TempToolBoxDirectory, err = createTemporaryDirectory("toolbox"); err != nil {
			return err
		}
	}

	/* Assign the path of temporary local toolbox directory to the HostToolBoxPath(which shall be mounted into the container)
	 * and also use it to write the analysis_results.json file locally to the temporary */
	a.Client.AnalysisOpts.HostToolBoxPath = a.TempToolBoxDirectory
	a.Client.AnalysisOpts.AnalysisResultsPath = a.TempToolBoxDirectory
	return nil
}

// parseImageName returns the image name and the image tag from the complete image name.
func (a *AnalyzerDryRun) parseImageName() (string, string) {
	components := strings.Split(a.DockerImageName, ":")

	if len(components) > 1 {
		return components[0], components[1]
	} else {
		return components[0], "latest"
	}
}
