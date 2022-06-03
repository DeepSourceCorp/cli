package validator

import (
	"fmt"
	"strings"

	"github.com/deepsourcelabs/cli/types"
	validate "github.com/go-playground/validator/v10"
)

var supportedIssueCategories = []string{
	"bug-risk",
	"antipattern",
	"security",
	"style",
	"performance",
	"doc",
	"typecheck",
	"coverage",
}

func validateIssueTOML(config *types.AnalyzerIssue, issuePath string) *ValidationFailure {
	issueValidationError := ValidationFailure{}
	// Validate the issue data
	v := validate.New()
	v.RegisterValidation("category", ValidateCategory)
	if err := v.Struct(config); err != nil {
		// validationFailed = true
		missingRequiredFields := getMissingRequiredFields(err, *config)
		issueValidationError = ValidationFailure{
			File: issuePath,
		}

		// TODO: Tweak this to accomodate other error types.
		for _, missingField := range missingRequiredFields {
			issueValidationError.Errors = append(issueValidationError.Errors, ErrorMeta{
				Level:   Error,
				Field:   missingField,
				Message: fmt.Sprintf("Missing required field: %s", missingField),
			},
			)
		}

		// Check if the shortcode begins with @ and the right build engine is configured
		errs := err.(validate.ValidationErrors)
		for _, err := range errs {
			if err.Tag() == "category" {
				supportedCategories := strings.Join(supportedIssueCategories, ", ")
				issueValidationError.Errors = append(issueValidationError.Errors, ErrorMeta{
					Level:   Error,
					Field:   "category",
					Message: fmt.Sprintf("Invalid issue category \"%s\". The following issue categories are supported: [%s]", config.Category, supportedCategories),
				})
			}
		}
	}

	// Return nil if no validation errors found
	if len(issueValidationError.Errors) > 0 {
		return &issueValidationError
	}
	return nil
}

func ValidateCategory(fl validate.FieldLevel) bool {
	for _, supportedCategory := range supportedIssueCategories {
		if fl.Field().String() == supportedCategory {
			return true
		}
	}
	return false
}
