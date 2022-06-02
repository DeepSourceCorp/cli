package validator

import (
	"bytes"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"

	"github.com/deepsourcelabs/cli/types"
	validate "github.com/go-playground/validator/v10"
	"github.com/pelletier/go-toml/v2"
)

/* ==================================================
 * Types used to report validation failure error data
 * ================================================== */
type ErrLevel int

const (
	DecodeErr   ErrLevel = 0
	Error       ErrLevel = 1
	Warning     ErrLevel = 2
	Information ErrLevel = 3
)

type ErrorMeta struct {
	Level   ErrLevel
	Field   string
	Message string
}

type ValidationFailure struct {
	File   string
	Errors []ErrorMeta
}

// CheckForAnalyzerConfig receives the path of the `analyzer.toml` and issue descriptions and
// checks if they are actually present
func CheckForAnalyzerConfig(analyzerTOMLPath, issuesDirectoryPath string) (err error) {
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

	return
}

// ValidateAnalyzerTOML validates analyzer.toml file of the Analyzer
func ValidateAnalyzerTOML(analyzerTOMLPath string) (*types.AnalyzerTOML, *ValidationFailure, error) {
	config := types.AnalyzerTOML{}
	analyzerTOMLValidationErrors := ValidationFailure{}

	// Read the contents of analyzer.toml file
	analyzerTOMLContent, err := ioutil.ReadFile(analyzerTOMLPath)
	if err != nil {
		return nil, nil, errors.New("failed to read analyzer.toml file")
	}

	// Decode the TOML into the struct
	d := toml.NewDecoder(bytes.NewBuffer(analyzerTOMLContent))
	d.DisallowUnknownFields()
	if err = d.Decode(&config); err != nil {
		// Get the DecodeError exported by go-toml
		// Ref: https://pkg.go.dev/github.com/pelletier/go-toml/v2#DecodeError
		var decodeErr *toml.DecodeError
		if errors.As(err, &decodeErr) {
			decodeErrorResp, err := handleTOMLDecodeErrors(decodeErr)
			if decodeErrorResp != nil {
				return nil, decodeErrorResp, err
			}
		}
		return nil, nil, err
	}

	// Validate analyzer.toml fields based on type and sanity checks
	v := validate.New()
	if err := v.Struct(&config); err != nil {
		missingRequiredFields := getMissingRequiredFields(err, config)
		analyzerTOMLValidationErrors = ValidationFailure{
			File: analyzerTOMLPath,
		}

		// TODO: Tweak this to accomodate other error types.
		for _, missingField := range missingRequiredFields {
			analyzerTOMLValidationErrors.Errors = append(analyzerTOMLValidationErrors.Errors, ErrorMeta{
				Level:   Error,
				Field:   missingField,
				Message: "Missing required field",
			},
			)
		}
		return &config, &analyzerTOMLValidationErrors, nil
	}
	return &config, nil, nil
}

// ValidateIssueDescriptions validates issue description TOML files
func ValidateIssueDescriptions(issuesDirectoryPath string) (*[]ValidationFailure, error) {
	validationFailed := false
	issueValidationErrors := []ValidationFailure{}

	// TODO: List only TOML files here
	issuesList, err := ioutil.ReadDir(issuesDirectoryPath)
	if err != nil {
		return nil, err
	}

	for _, issuePath := range issuesList {
		config := types.AnalyzerIssue{}

		// Set the issue shortcode as the filename
		config.Shortcode = strings.TrimSuffix(issuePath.Name(), ".toml")

		// Read the contents of issue toml file
		issueTOMLContent, err := ioutil.ReadFile(filepath.Join(issuesDirectoryPath, issuePath.Name()))
		if err != nil {
			return nil, fmt.Errorf("failed to read file: %s", filepath.Join(issuesDirectoryPath, issuePath.Name()))
		}

		// Unmarshal TOML into config
		if err = toml.Unmarshal(issueTOMLContent, &config); err != nil {
			return nil, err
		}

		// Validate the data
		v := validate.New()
		if err := v.Struct(&config); err != nil {
			validationFailed = true
			missingRequiredFields := getMissingRequiredFields(err, config)
			issueValidationError := ValidationFailure{
				File: issuePath.Name(),
			}

			// TODO: Tweak this to accomodate other error types.
			for _, missingField := range missingRequiredFields {
				issueValidationError.Errors = append(issueValidationError.Errors, ErrorMeta{
					Level:   Error,
					Field:   missingField,
					Message: "Missing required field",
				},
				)
			}
			issueValidationErrors = append(issueValidationErrors, issueValidationError)
		}
	}

	if validationFailed {
		return &issueValidationErrors, nil
	}
	return nil, nil
}
