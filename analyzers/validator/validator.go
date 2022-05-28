package validator

import (
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"

	"github.com/BurntSushi/toml"
	"github.com/deepsourcelabs/cli/analyzers/config"
	validate "github.com/go-playground/validator/v10"
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

// Receives the path of the `analyzer.toml` and issue descriptions and
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

// Validates analyzer.toml file
func ValidateAnalyzerTOML(analyzerTOMLPath string) (*config.AnalyzerMetadata, *ValidationError, error) {
	config := config.AnalyzerMetadata{}
	analyzerTOMLValidationErrors := ValidationError{}

	// Read the contents of analyzer.toml file
	analyzerTOMLContent, err := ioutil.ReadFile(analyzerTOMLPath)
	if err != nil {
		return &config, nil, errors.New("failed to read analyzer.toml file")
	}

	// Using burntsushi/toml
	if _, err = toml.Decode(string(analyzerTOMLContent), &config); err != nil {
		fmt.Println(err)

		var derr toml.ParseError
		if errors.As(err, &derr) {
			fmt.Println(derr.ErrorWithUsage())
		} else {
			fmt.Println(derr)
		}
	}

	//
	// go-toml stuff //
	//

	// reader := strings.NewReader(string(analyzerTOMLContent))
	// decoder := toml.NewDecoder(reader)
	// decoder.DisallowUnknownFields()

	// err = decoder.Decode(&config)
	// if err != nil {
	//     fmt.Println(err.Error())

	//     var derr *toml.DecodeError
	//     if errors.As(err, &derr) {
	//         fmt.Println("Here")
	//         fmt.Println(derr.String())
	//         row, col := derr.Position()
	//         fmt.Println("error occurred at row", row, "column", col)
	//     }
	//     var errorDetails *toml.StrictMissingError
	//     if errors.As(err, &errorDetails) {
	//         fmt.Println(errorDetails.String())
	//     }

	// }

	// // Unmarshal TOML into config
	// if err = toml.Unmarshal(analyzerTOMLContent, &config); err != nil {
	//     fmt.Println("Found an error", err)
	//     return &config, nil, err
	// }

	// Validate types of analyzer.toml fields
	// if err = validateAnalyzerTOMLTypes(&config); err != nil {
	//     fmt.Println(err)
	// }

	// Validate analyzer.toml fields based on type and sanity checks
	v := validate.New()
	if err := v.Struct(&config); err != nil {
		missingRequiredFields := getMissingRequiredFields(err, config)
		analyzerTOMLValidationErrors = ValidationError{
			File: analyzerTOMLPath,
		}

		// TODO: Tweak this to accomodate other error types.
		for _, missingField := range missingRequiredFields {
			analyzerTOMLValidationErrors.Errors = append(analyzerTOMLValidationErrors.Errors, Error{
				Type:    "ERROR",
				Field:   missingField,
				Message: "Missing required field",
			},
			)
		}
		return &config, &analyzerTOMLValidationErrors, nil
	}

	return &config, nil, nil
}

// Validates issue description TOML files
func ValidateIssueDescriptions(issuesDirectoryPath string) (*[]ValidationError, error) {
	validationFailed := false
	issueValidationErrors := []ValidationError{}

	// TODO: List only TOML files here
	issuesList, err := ioutil.ReadDir(issuesDirectoryPath)
	if err != nil {
		return nil, err
	}

	for _, issuePath := range issuesList {
		config := AnalyzerIssue{}

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
			issueValidationError := ValidationError{
				File: issuePath.Name(),
			}

			// TODO: Tweak this to accomodate other error types.
			for _, missingField := range missingRequiredFields {
				issueValidationError.Errors = append(issueValidationError.Errors, Error{
					Type:    "ERROR",
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
