package config

import (
	"os"
	"path/filepath"

	"github.com/deepsourcelabs/cli/utils"
)

var configFolder string = ".deepsource/analyzer"

func InitAnalyzerConfigurationPaths() (string, string, string) {
	cwd, _ := os.Getwd()

	// Extracting the path of the project root
	projectRoot, err := utils.ExtractProjectRootPath()
	if err != nil {
		projectRoot = cwd
	}

	// Configuring the paths of analyzer.toml and issues directory
	analyzerTOMLPath := filepath.Join(projectRoot, configFolder, "analyzer.toml")
	issuesDirPath := filepath.Join(projectRoot, configFolder, "issues/")
	return projectRoot, analyzerTOMLPath, issuesDirPath
}
