package validator

import (
	"reflect"

	validate "github.com/go-playground/validator/v10"
)

// Returns the list of required fields from the error message returned by the `go-playground/validator` library
func formatValidationErrors(err error, config interface{}) []string {
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
