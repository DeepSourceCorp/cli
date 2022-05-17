package validator

import (
	"fmt"
	"reflect"
)

// Validates the input data with respect to the types defined in the Struct
func validateAnalyzerTOMLTypes(inputData *AnalyzerMetadata) error {
	v := reflect.ValueOf(inputData).Elem()

	// Iterating over the fields
	for i := 0; i < v.NumField(); i++ {
		field := v.Field(i)
		fieldName := v.Type().Field(i).Name
		fieldType := field.Type().String()
		fieldWithKind := field.Type().Kind().String()

		fmt.Printf("Field - %s\nType - %s\nType Kind - %s\n", fieldName, fieldType, fieldWithKind)
	}

	// Check the ones entered by the user and validate the input using the types mentioned in types.go
	return nil
}
