package validator

import (
	"fmt"

	validate "github.com/go-playground/validator/v10"
)

func validateAnalyzerTOMLFields() {
	v := validate.New()
	if err := v.Struct(&config); err != nil {
		if _, ok := err.(*validate.InvalidValidationError); ok {
			fmt.Println(err)
			// return err
		}

		if _, ok := err.(*validate.ValidationErrors); ok {
			fmt.Println(err)
			// return err
		}
		return err
	}
}
