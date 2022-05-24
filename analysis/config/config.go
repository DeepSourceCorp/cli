package config

import (
	"errors"
	"fmt"
	"os"
	"path"

	"github.com/pelletier/go-toml/v2"
)

type AnalysisRun struct {
	AnalyzerName      string
	LocalCodePath     string
	ContainerCodePath string
	DSConfig          DSConfig
	AnalysisFiles     []string
	ExcludedFiles     []string
	TestFiles         []string
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

/* Parses the DeepSource config (.deepsource.toml) located at the root of the project at CODE_PATH as does
 * .git directory and resolves the config data into AnalysisRun */
func (r *AnalysisRun) parseDeepSourceConfig() (err error) {
	r.DSConfig = DSConfig{}

	// Having resolved the project root path, check for the presence of .deepsource.toml in that path
	// Read it if it exists and throw error if it doesn't
	if _, err := os.Stat(path.Join(r.LocalCodePath, ".deepsource.toml")); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			fmt.Println("Could not find .deepsource.toml config at project root path:", r.LocalCodePath)
			// If DeepSource config is not present, keep empty r.DSConfig
			return nil
		}
	}

	// If present, read the DeepSource config and decode it into r.DSConfig
	config, err := os.ReadFile(path.Join(r.LocalCodePath, ".deepsource.toml"))
	if err != nil {
		fmt.Printf("Failed to read the .deepsource.toml config. Error: %s", err)
		return nil
	}

	// Unmarshal the []byte config data into struct
	err = toml.Unmarshal(config, &r.DSConfig)
	if err != nil {
		fmt.Printf("Failed to retrieve the .deepsource.toml config data. Error: %s", err)
		return nil
	}
	return err
}

/* Configures the analysis_config.json file which is used by analyzer to run analysis since it contains
 * metadata about the files to be analyzed, the test files in the project, the excluded files and analyzer meta */
func (r *AnalysisRun) ConfigureAnalysis() (*AnalysisConfig, error) {
	var err error
	analyzerConfig := &AnalysisConfig{}

	// Parse DeepSource config (.deepsource.toml) in order to get the
	// configured `exclude_patterns` and `test_patterns`
	if err = r.parseDeepSourceConfig(); err != nil {
		return analyzerConfig, err
	}

	// Get the list of all the files present in the CODE_PATH and are to be analyzed
	if r.AnalysisFiles, err = readAllFiles(r.LocalCodePath); err != nil {
		return analyzerConfig, err
	}

	// Gets the list of files to be excluded from analysis and the test files present
	// Doesn't return error, just logs it even if the error comes up since it doens't affect the analysis run
	if err = r.checkExcludedAndTestFiles(); err != nil {
		return analyzerConfig, nil
	}

	// Filter out the files to be analyzed by removing the r.ExcludedFiles from them and assign them to r.AnalysisFiles
	r.filterAnalysisFiles()

	// Format the analysis config data into LSP format of analysis_config.json
	return r.formatAnalysisConfigToLSP(), nil
}

func (r *AnalysisRun) FormatLSPResultToDefault(analysisResult *AnalysisResult) *DefaultAnalysisResult {
	return r.formatLSPResultsToDefault(analysisResult)
}
