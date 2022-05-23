package config

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path"

	"github.com/deepsourcelabs/cli/utils"
)

type AnalysisRun struct {
	AnalyzerName   string
	CodePath       string
	AnalysisFiles  []string
	ExcludedFiles  []string
	TestFiles      []string
	DSConfig       DSConfig
	AnalyzerConfig *AnalysisConfig
}

func (r *AnalysisRun) ConfigureAnalysis() (*AnalysisConfig, error) {
	var err error
	r.AnalyzerConfig = &AnalysisConfig{}

	// Parse DeepSource config (.deepsource.toml) in order to get the
	// configured `exclude_patterns` and `test_patterns`
	if err = r.parseDeepSourceConfig(); err != nil {
		return r.AnalyzerConfig, err
	}

	// Gets the list of files to be excluded from analysis and the test files present
	// Doesn't return error, just logs it even if the error comes up since it doens't affect the analysis run
	if err = r.checkExcludedAndTestFiles(); err != nil {
		return r.AnalyzerConfig, nil
	}

	// Get the list of all the files present in the CODE_PATH and are
	// to be analyzed
	if r.AnalysisFiles, err = readAllFiles(r.CodePath); err != nil {
		return r.AnalyzerConfig, err
	}

	// Filter out the files to be analyzed by removing the r.ExcludedFiles from them and assign them to r.AnalysisFiles
	r.filterAnalysisFiles()

	// Read analyzer_meta from DeepSource config (.deepsource.toml) and
	// store the one corresponding to the Analyzer whose check is scheduled in analysis_config.json
	for _, analyzer := range r.DSConfig.Analyzers {
		if analyzer.Name == r.AnalyzerName {
			r.AnalyzerConfig.AnalyzerMeta = analyzer.Meta
		}
	}

	return r.AnalyzerConfig, nil
}

/* Checks for excluded and test files based on the `exclude_patterns` and `test_patterns`
 * configured by the user */
func (r *AnalysisRun) checkExcludedAndTestFiles() (err error) {
	// Get a list of the files that match the `exclude_patterns` configured in `.deepsource.toml`
	r.ExcludedFiles, err = r.getMatchingFiles(r.DSConfig.ExcludePatterns)
	if err != nil {
		return err
	}

	// Get a list of the files that match the `test_patterns` configured in `.deepsource.toml`
	r.TestFiles, err = r.getMatchingFiles(r.DSConfig.TestPatterns)
	if err != nil {
		return err
	}
	return nil
}

/* Parses the DeepSource config (.deepsource.toml) located at the root of the project as does .git directory
 * and resolves the config data into AnalysisRun */
func (r *AnalysisRun) parseDeepSourceConfig() (err error) {
	r.DSConfig = DSConfig{}
	cwd, _ := os.Getwd()

	// Traverse and find the root directory of the project and read the .deepsource.toml file
	// The root directory is evaluated with the help of .git directory
	projectRoot, err := utils.ExtractProjectRootPath()
	if err != nil {
		projectRoot = cwd
	}

	// Having resolved the project root path, check for the presence of .deepsource.toml in that path
	// Read it if it exists and throw error if it doesn't
	if _, err := os.Stat(path.Join(projectRoot, ".deepsource.toml")); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			fmt.Println("Could not find .deepsource.toml config at project root path:", projectRoot)
			// If DeepSource config is not present, keep empty r.DSConfig
			return nil
		}
	}

	// If present, read the DeepSource config and decode it into r.DSConfig
	config, err := os.ReadFile(path.Join(projectRoot, ".deepsource.toml"))
	if err != nil {
		fmt.Println("Failed to read the .deepsource.toml config. Error: %s", err)
		return nil
	}

	// Unmarshal the []byte config data into struct
	err = json.Unmarshal(config, &r.DSConfig)
	if err != nil {
		fmt.Println("Failed to retrieve the .deepsource.toml config data. Error: %s", err)
		return nil
	}
	return err
}
