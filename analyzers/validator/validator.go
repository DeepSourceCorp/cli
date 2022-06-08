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
	"github.com/pelletier/go-toml/v2"
)

/* ==================================================
 * Types used to report validation failure error data
 * ================================================== */
type ErrLevel int

const (
	DecodeErr ErrLevel = iota
	Error
	Warning
	Information
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

// ValidateAnalyzerTOML receives the path of analyzer.toml and reads as well as validates it for
// the type checks, required fields etc. Returns the analyzer.toml content and the validation failures
// if any in the form of ValidationFailure struct.
func ValidateAnalyzerTOML(analyzerTOMLPath string) (*types.AnalyzerTOML, *ValidationFailure, error) {
	config := types.AnalyzerTOML{}

	// Read the contents of analyzer.toml file
	analyzerTOMLContent, err := ioutil.ReadFile(analyzerTOMLPath)
	if err != nil {
		return nil, nil, errors.New("failed to read analyzer.toml file")
	}

	// Decode the TOML into the struct
	d := toml.NewDecoder(bytes.NewBuffer(analyzerTOMLContent))
	d.DisallowUnknownFields()
	if err := d.Decode(&config); err != nil {
		decodeErrorResp := handleTOMLDecodeErrors(err, analyzerTOMLPath)
		if decodeErrorResp != nil {
			return nil, decodeErrorResp, nil
		}
		return nil, nil, err
	}

	// Validate the analyzer.toml fields for default/custom type checks, required fields
	analyzerTOMLValidationErrors, err := validateAnalyzerTOMLFields(&config, analyzerTOMLPath)
	if err != nil {
		return nil, nil, err
	}
	return &config, analyzerTOMLValidationErrors, nil
}

// ValidateIssueDescriptions receives the path of issues directory for reading and validating them
// for type checks and required fields. Returns an array of ValidationFailure struct containing
// validation errors for each issue TOML file.
func ValidateIssueDescriptions(issuesDirectoryPath string) (*[]ValidationFailure, error) {
	issueValidationErrors := []ValidationFailure{}

	// TODO: List only TOML files here
	issuesList, err := ioutil.ReadDir(issuesDirectoryPath)
	if err != nil {
		return nil, err
	}

	// Iterate over the issues one by one, read and decode them, validate the fields and return the
	// validation result.
	for _, issuePath := range issuesList {
		// Set the issue shortcode as the filename
		config := types.AnalyzerIssue{}
		config.Shortcode = strings.TrimSuffix(issuePath.Name(), ".toml")

		// Read the contents of issue toml file
		issueTOMLContent, err := ioutil.ReadFile(filepath.Join(issuesDirectoryPath, issuePath.Name()))
		if err != nil {
			return nil, fmt.Errorf("failed to read file: %s", filepath.Join(issuesDirectoryPath, issuePath.Name()))
		}

		// Decode the TOML content into the AnalyzerIssue struct object
		d := toml.NewDecoder(bytes.NewBuffer(issueTOMLContent))
		d.DisallowUnknownFields()
		if err = d.Decode(&config); err != nil {
			decodeErrorResp := handleTOMLDecodeErrors(err, issuePath.Name())
			if decodeErrorResp != nil {
				// Append the error to the array created for reporting issue validation errors and return it
				issueValidationErrors = append(issueValidationErrors, *decodeErrorResp)
				continue
			}
		}

		// Validate the analyzer.toml fields for default/custom type checks, required fields
		issueValidationError := validateIssueTOML(&config, issuePath.Name())
		if issueValidationError != nil {
			issueValidationErrors = append(issueValidationErrors, *issueValidationError)
		}
	}
	return &issueValidationErrors, nil
}
