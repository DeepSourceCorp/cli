package validator

// func validateAnalyzerTOMLFields() {
//     // Validate analyzer.toml fields based on type and sanity checks
//     v := validate.New()
//     if err := v.Struct(&config); err != nil {
//         missingRequiredFields := getMissingRequiredFields(err, config)
//         analyzerTOMLValidationErrors = ValidationFailure{
//             File: analyzerTOMLPath,
//         }

//         // TODO: Tweak this to accomodate other error types.
//         for _, missingField := range missingRequiredFields {
//             analyzerTOMLValidationErrors.Errors = append(analyzerTOMLValidationErrors.Errors, ErrorMeta{
//                 Type:    Error,
//                 Field:   missingField,
//                 Message: "Missing required field",
//             },
//             )
//         }

//     }
// }
