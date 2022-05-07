package validator

import (
	"bytes"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"

	validate "github.com/go-playground/validator/v10"
	"github.com/spf13/viper"
)

type Error struct {
	Type    string
	Field   string
	Message string
}

type ValidationError struct {
	File   string
	Errors []Error
}

// Checks if the analyzer.toml file and the issue directory is present
func CheckForAnalyzerConfig(analyzerTOMLPath, issuesDirectoryPath string) (err error) {
	// Check if `analyzer.toml` is present in `.deepsource/analyzer` folder
	if _, err := os.Stat(analyzerTOMLPath); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return errors.New("the analyzer.toml file doesn't exist")
		}
	}

	// Check if `issues/` directory is present in `.deepsource/analyzer` folder and is not empty.
	if _, err := os.Stat(issuesDirectoryPath); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return errors.New("the issue descriptions directory doesn't exist")
		}
	}

	// Check if there are any toml files in the `issues/` directory
	files, err := ioutil.ReadDir(issuesDirectoryPath)
	if err != nil {
		return fmt.Errorf("failed to read the files present in the issues directory at %s", issuesDirectoryPath)
	}

	// Check if its an empty directory
	if len(files) < 1 {
		return fmt.Errorf("found 0 issues configured in the issues directory at %s", issuesDirectoryPath)
	}

	tomlPresent := false
	// Check if there are TOML files configured in the issues/ directory
	for _, file := range files {
		if strings.Contains(file.Name(), ".toml") {
			tomlPresent = true
			break
		}
	}
	if !tomlPresent {
		return fmt.Errorf("found no toml files in the issues directory at %s", issuesDirectoryPath)
	}

	return
}

// Validates analyzer.toml file
func ValidateAnalyzerTOML(analyzerTOMLPath string) (analyzerConfig AnalyzerMetadata, err error) {
	config := AnalyzerMetadata{}
	// Read the contents of analyzer.toml file
	analyzerTOMLContent, err := ioutil.ReadFile(analyzerTOMLPath)
	if err != nil {
		return config, errors.New("failed to read analyzer.toml file")
	}

	viper.SetConfigType("toml")
	if err = viper.ReadConfig(bytes.NewBuffer(analyzerTOMLContent)); err != nil {
		return config, err
	}
	// Unmarshaling the configdata into AnalyzerMetadata struct
	viper.Unmarshal(&config)

	// Validate analyzer.toml fields based on type and sanity checks
	v := validate.New()
	if err := v.Struct(&config); err != nil {
		missingRequiredFields := getMissingRequiredFields(err, config)
		missingFields := strings.Join(missingRequiredFields, ", ")
		// Improve error message returned by `go-playground/validator`
		return config, fmt.Errorf("missing the following required fields from analyzer.toml: %v\n", missingFields)
	}
	return config, nil
}

// Validates issue description TOML files
func ValidateIssueDescriptions(issuesDirectoryPath string) ([]ValidationError, error) {
	idx := 0
	validationFailed := false
	issuesValidationErrors := make([]ValidationError, 1)

	// TODO: List only TOML files here
	issuesList, err := ioutil.ReadDir(issuesDirectoryPath)
	if err != nil {
		return nil, err
	}

	for _, issuePath := range issuesList {

		config := AnalyzerIssue{}

		// Read the contents of issue toml file
		issueTOMLContent, err := ioutil.ReadFile(filepath.Join(issuesDirectoryPath, issuePath.Name()))
		if err != nil {
			return nil, fmt.Errorf("failed to read file: %s", filepath.Join(issuesDirectoryPath, issuePath.Name()))
		}
		viper.SetConfigType("toml")
		if err = viper.ReadConfig(bytes.NewBuffer(issueTOMLContent)); err != nil {
			return nil, err
		}
		// Unmarshaling the configdata into AnalyzerMetadata struct
		viper.Unmarshal(&config)

		// Validate the data
		v := validate.New()

		if err := v.Struct(&config); err != nil {
			validationFailed = true
			missingRequiredFields := getMissingRequiredFields(err, config)

			issuesValidationErrors[idx].File = issuePath.Name()

			// TODO: Tweak this to accomodate other error types.
			for _, missingField := range missingRequiredFields {
				issuesValidationErrors[idx].Errors = append(issuesValidationErrors[idx].Errors, Error{
					Type:    "ERROR",
					Field:   missingField,
					Message: "Missing required field",
				},
				)
			}
		}
	}

	if validationFailed {
		return issuesValidationErrors, nil
	}
	return nil, nil
}
