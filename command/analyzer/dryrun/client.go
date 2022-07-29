package dryrun

import (
	"strings"

	"github.com/deepsourcelabs/cli/analyzers/backend/docker"
	"github.com/deepsourcelabs/cli/analyzers/config"
)

// Reads the analyzer.toml data and environment variables and creates a docker client
// to be used in the docker related ops by the run command
func (a *AnalyzerDryRun) createDockerClient() error {
	// Get the Analyzer.toml contents
	analyzerTOMLData, err := config.GetAnalyzerTOML()
	if err != nil {
		return err
	}

	// Extracting the docker file and path details
	dockerFilePath, dockerFileName := docker.GetDockerImageDetails(analyzerTOMLData)
	analyzerName := strings.Split(dockerFileName, "/")[1]

	/* ====================================== */
	// Create a Docker Client
	/* ====================================== */

	a.Client = &docker.DockerClient{
		ImageName:      dockerFileName,
		ImagePlatform:  a.DockerImagePlatform,
		ImageTag:       docker.GenerateImageVersion(7),
		ContainerName:  analyzerName + "-" + docker.GenerateImageVersion(7),
		DockerfilePath: dockerFilePath,
		AnalysisOpts: docker.AnalysisParams{
			AnalyzerName:            analyzerTOMLData.Name,
			AnalyzerShortcode:       analyzerTOMLData.Shortcode,
			AnalysisCommand:         analyzerTOMLData.Analysis.Command,
			ContainerCodePath:       containerCodePath,
			ContainerToolBoxPath:    containerToolBoxPath,
			AnalysisResultsFilename: analysisResultsName + analysisResultsExt,
		},
	}
	return nil
}
