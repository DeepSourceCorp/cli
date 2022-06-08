package validator

import (
	"fmt"
	"strings"

	"github.com/deepsourcelabs/cli/types"
	validate "github.com/go-playground/validator/v10"
)

var supportedEngines []string = []string{"docker"}

func validateAnalyzerTOMLFields(config *types.AnalyzerTOML, filePath string) (*ValidationFailure, error) {
	var supportedEnginesString string
	analyzerTOMLValidationErrors := ValidationFailure{}

	// Validate analyzer.toml fields based on type and sanity checks
	v := validate.New()
	// Custom validators for shortcode and engine
	v.RegisterValidation("shortcode", ValidateShortcode)
	v.RegisterValidation("engine", ValidateEngine)

	// Start the validation
	if err := v.Struct(config); err != nil {
		// List the missing required fields
		missingRequiredFields := getMissingRequiredFields(err, *config)
		analyzerTOMLValidationErrors = ValidationFailure{
			File: filePath,
		}

		// Find any missing "required" fields from analyzer.toml
		for _, missingField := range missingRequiredFields {
			analyzerTOMLValidationErrors.Errors = append(analyzerTOMLValidationErrors.Errors, ErrorMeta{
				Level:   Error,
				Field:   missingField,
				Message: fmt.Sprintf("Missing required field : %s", missingField),
			},
			)
		}

		// Check if the shortcode begins with @ and the right build engine is configured
		errs := err.(validate.ValidationErrors)
		for _, err := range errs {
			if err.Tag() == "shortcode" {
				analyzerTOMLValidationErrors.Errors = append(analyzerTOMLValidationErrors.Errors, ErrorMeta{
					Level:   Error,
					Field:   "shortcode",
					Message: "Analyzer shortcode should begin with '@'",
				})
			}

			if err.Tag() == "engine" {
				if len(supportedEngines) > 1 {
					supportedEnginesString = strings.Join(supportedEngines, ", ")
				} else {
					supportedEnginesString = supportedEngines[0]
				}

				analyzerTOMLValidationErrors.Errors = append(analyzerTOMLValidationErrors.Errors, ErrorMeta{
					Level:   Error,
					Field:   "engine",
					Message: fmt.Sprintf("Invalid build engine \"%s\". The following build engines are supported: [%s]", config.Build.Engine, supportedEnginesString),
				})
			}
		}
	}
	if len(analyzerTOMLValidationErrors.Errors) > 0 {
		return &analyzerTOMLValidationErrors, nil
	}
	return nil, nil
}

// Validates if the shortcode begins with `@`
func ValidateShortcode(fl validate.FieldLevel) bool {
	return strings.HasPrefix(fl.Field().String(), "@")
}

// Validates the supported engines. As of now, only docker is supported.
func ValidateEngine(fl validate.FieldLevel) bool {
	for _, supportedEngine := range supportedEngines {
		if fl.Field().String() == supportedEngine {
			return true
		}
	}
	return false
}
