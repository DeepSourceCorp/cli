package config

import (
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"

	"github.com/deepsourcelabs/cli/utils"
	"github.com/pelletier/go-toml/v2"
)

var (
	analyzerTOMLPath    string
	issuesDirectoryPath string
	configFolder        string = ".deepsource/analyzer"
)

// Read the types and read the config
func resolveAnalyzerConfigurationPaths() {
	cwd, _ := os.Getwd()

	// Extracting the path of the project root
	projectRoot, err := utils.ExtractProjectRootPath()
	if err != nil {
		projectRoot = cwd
	}

	// Configuring the paths of analyzer.toml and issues directory
	analyzerTOMLPath = filepath.Join(projectRoot, configFolder, "analyzer.toml")
	issuesDirectoryPath = filepath.Join(projectRoot, configFolder, "issues/")
}

func VerifyAnalyzerConfigs() error {
	resolveAnalyzerConfigurationPaths()

	// Check if `analyzer.toml` is present in `.deepsource/analyzer` folder
	if _, err := os.Stat(analyzerTOMLPath); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return errors.New("the analyzer.toml file doesn't exist\n")
		}
	}

	// Check if `issues/` directory is present in `.deepsource/analyzer` folder and is not empty.
	if _, err := os.Stat(issuesDirectoryPath); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return errors.New("the issue descriptions directory doesn't exist\n")
		}
	}

	// Check if there are any toml files in the `issues/` directory
	files, err := ioutil.ReadDir(issuesDirectoryPath)
	if err != nil {
		return fmt.Errorf("failed to read the files present in the issues directory at %s\n", issuesDirectoryPath)
	}

	// Check if its an empty directory
	if len(files) < 1 {
		return fmt.Errorf("found 0 issues configured in the issues directory at %s\n", issuesDirectoryPath)
	}

	tomlPresent := false
	// Check if there are TOML files configured in the issues/ directory
	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".toml") {
			tomlPresent = true
			break
		}
	}
	if !tomlPresent {
		return fmt.Errorf("found no toml files in the issues directory at %s\n", issuesDirectoryPath)
	}
	return nil
}

func GetAnalyzerTOML() (*AnalyzerMetadata, error) {
	resolveAnalyzerConfigurationPaths()
	config := AnalyzerMetadata{}

	// Read the contents of analyzer.toml file
	analyzerTOMLContent, err := ioutil.ReadFile(analyzerTOMLPath)
	if err != nil {
		return &config, errors.New("failed to read analyzer.toml file")
	}

	// Unmarshal TOML into config
	if err = toml.Unmarshal(analyzerTOMLContent, &config); err != nil {
		return &config, err
	}
	return &config, nil
}

func GetIssueDescriptions() (*[]AnalyzerIssue, error) {
	resolveAnalyzerConfigurationPaths()
	issueDescriptions := []AnalyzerIssue{}

	issuesList, err := ioutil.ReadDir(issuesDirectoryPath)
	if err != nil {
		return nil, err
	}
	for _, issuePath := range issuesList {
		issue := AnalyzerIssue{}
		// Set the issue shortcode as the filename
		issue.Shortcode = strings.TrimSuffix(issuePath.Name(), ".toml")

		// Read the contents of issue toml file
		issueTOMLContent, err := ioutil.ReadFile(filepath.Join(issuesDirectoryPath, issuePath.Name()))
		if err != nil {
			return nil, fmt.Errorf("failed to read file: %s", filepath.Join(issuesDirectoryPath, issuePath.Name()))
		}

		// Unmarshal TOML into config
		if err = toml.Unmarshal(issueTOMLContent, &issue); err != nil {
			return nil, err
		}
		issueDescriptions = append(issueDescriptions, issue)
	}
	return &issueDescriptions, nil
}
