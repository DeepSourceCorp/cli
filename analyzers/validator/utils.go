package validator

import (
	"fmt"
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
func handleTOMLDecodeErrors(decodeErr *toml.DecodeError) (*ValidationFailure, error) {
	var usefulResponse, expectedType, receivedType, fieldName, decodeErrorMessage string
	errorMessage := decodeErr.Error()

	// Return error if the message doesn't begin with `toml` since then it can't be parsed
	// by the below logic
	if !strings.HasPrefix(errorMessage, "toml") {
		return nil, fmt.Errorf("failed to parse the TOML decoding error message")
	}

	/* =================================================
	 * Extract the data about the decoding failure and return
	 * a validation failure response
	 * ================================================= */

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
	}

	// Error case 2: `toml: cannot store TOML string into a Go slice`
	if strings.HasPrefix(errorMessage, "toml: cannot store TOML") {
		usefulResponse = strings.TrimPrefix(errorMessage, "toml: cannot store TOML ")
		responseArray := strings.Split(usefulResponse, " ")

		expectedType = responseArray[len(responseArray)-1]
		receivedType = responseArray[0]
		decodeErrorMessage = fmt.Sprintf("expected type for one of the fields : %s. Received: %s.", expectedType, receivedType)
	}

	validationError := ValidationFailure{
		File: "analyzer.toml",
		Errors: []ErrorMeta{
			{
				Level:   Error,
				Field:   fieldName,
				Message: decodeErrorMessage,
			},
		},
	}
	return &validationError, nil
}
