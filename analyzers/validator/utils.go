package validator

import (
	"errors"
	"fmt"
	"path"
	"reflect"
	"strings"

	validate "github.com/go-playground/validator/v10"
	"github.com/pelletier/go-toml/v2"
)

// Returns the list of required fields from the error message returned by the `go-playground/validator` library
func getMissingRequiredFields(err error, config interface{}) []string {
	missingRequiredFields := []string{}
	errs := err.(validate.ValidationErrors)
	for _, err := range errs {
		if err.Tag() == "required" {
			c := reflect.ValueOf(config)
			for i := 0; i < c.Type().NumField(); i++ {
				if err.Field() == c.Type().Field(i).Name {
					missingRequiredFields = append(missingRequiredFields, c.Type().Field(i).Tag.Get("toml"))
				}
			}
		}
	}
	return missingRequiredFields
}

// Handle decoding errors reported by go-toml
func handleTOMLDecodeErrors(err error, filePath string) *ValidationFailure {
	var usefulResponse, expectedType, receivedType, fieldName, decodeErrorMessage string

	// Get the DecodeError exported by go-toml
	// Ref: https://pkg.go.dev/github.com/pelletier/go-toml/v2#DecodeError
	var decodeErr *toml.DecodeError
	if !errors.As(err, &decodeErr) {
		decodeErrorMessage = err.Error()

		// Handle strict mode error when some alien fields are added in the user configured TOML
		if strings.HasPrefix(err.Error(), "strict mode") {
			decodeErrorMessage = fmt.Sprintf("failed to parse %s. Invalid fields detected.", path.Base(filePath))
		}
		validationError := ValidationFailure{
			File: filePath,
			Errors: []ErrorMeta{
				{
					Level:   DecodeErr,
					Field:   "",
					Message: decodeErrorMessage,
				},
			},
		}
		return &validationError
	}

	/* =================================================
	 * Extract the data about the decoding failure and return
	 * a validation failure response
	 * ================================================= */

	errorMessage := decodeErr.Error()
	// Error case 1: `toml: cannot decode TOML integer into struct field types.AnalyzerTOML.Name of type string"`
	if strings.HasPrefix(errorMessage, "toml: cannot decode TOML") {

		usefulResponse = strings.TrimPrefix(errorMessage, "toml: cannot decode TOML ")
		responseArray := strings.Split(usefulResponse, " ")

		expectedType = responseArray[len(responseArray)-1]
		receivedType = responseArray[0]
		fieldData := responseArray[len(responseArray)-4]
		index := strings.LastIndex(fieldData, ".")
		fieldName = strings.ToLower(fieldData[index:])
		// Framing the decoding failure error message
		decodeErrorMessage = fmt.Sprintf("expected the field \"%s\" of type %s. Got %s.", fieldName, expectedType, receivedType)

	} else if strings.HasPrefix(errorMessage, "toml: cannot store TOML") {

		// Error case 2: `toml: cannot store TOML string into a Go slice`
		usefulResponse = strings.TrimPrefix(errorMessage, "toml: cannot store TOML ")
		responseArray := strings.Split(usefulResponse, " ")

		expectedType = responseArray[len(responseArray)-1]
		receivedType = responseArray[0]
		decodeErrorMessage = fmt.Sprintf("expected type for one of the fields : %s. Received: %s.", expectedType, receivedType)
	} else {
		decodeErrorMessage = errorMessage
		fieldName = ""
	}

	validationError := ValidationFailure{
		File: filePath,
		Errors: []ErrorMeta{
			{
				Level:   DecodeErr,
				Field:   fieldName,
				Message: decodeErrorMessage,
			},
		},
	}
	return &validationError
}
