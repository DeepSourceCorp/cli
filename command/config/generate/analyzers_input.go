package generate

import (
	"encoding/json"

	"github.com/AlecAivazis/survey/v2"
	"github.com/deepsourcelabs/cli/utils"
)

type AnalyzerMetadata struct {
	FieldName   string
	Type        string
	Title       string
	Description string
	Options     []string
	InputType   string
	UserInput   string
}

// ==========
// Analyzers Input Prompt
// ==========
func (o *Options) collectAnalyzerInput() error {
	// Extracting languages and tools being used in the project for Analyzers
	analyzerPrompt := &survey.MultiSelect{
		Renderer: survey.Renderer{},
		Message:  "Which languages/tools does your project use?",
		Options:  utils.AnaData.AnalyzerNames,
		Help:     "Analyzers will find issues in your code. Add an analyzer by selecting a language you've written your code in.",
	}
	err := survey.AskOne(analyzerPrompt, &o.ActivatedAnalyzers, survey.WithValidator(survey.Required))
	if err != nil {
		return err
	}

	err = o.extractRequiredAnalyzerMetaFields()
	if err != nil {
		return err
	}

	return nil
}

func isContains(arr []string, value string) bool {
	for _, v := range arr {
		if value == v {
			return true
		}
	}
	return false
}

// Iterates over all the properties analyzer supports and
// extract data needed by only `optional_required` fields
// This data is then, used to get input from user
func extractMetaProperties(analyzerMetaProperties map[string]interface{}, optionalFields []string) []AnalyzerMetadata {
	var requiredPropertiesData []AnalyzerMetadata
	var analyzerPropertyData AnalyzerMetadata

	for key, value := range analyzerMetaProperties {
		// Check if the field is `optional_required`
		if !isContains(optionalFields, key) {
			continue
		}
		// If yes, parse its properties and append the data to a map
		// with the layout : map[analyzer]:[]OptionalFieldsProperties
		propertiesData := value.(map[string]interface{})

		// Setting default input type of the field to be String (single line input)
		analyzerPropertyData.InputType = "String"

		// Iterating over properties/fields and extracting necessary data of optional_required fields.
		// Like title, description, options. Help in generating prompt for user input
		for k, v := range propertiesData {
			switch k {
			case "type":
				analyzerPropertyData.Type = v.(string)
				if v.(string) == "boolean" {
					analyzerPropertyData.InputType = "Boolean"
				}
			case "title":
				analyzerPropertyData.Title = v.(string)
			case "description":
				analyzerPropertyData.Description = v.(string)
			case "enum":
				enumValues := v.([]interface{})
				for _, enumValue := range enumValues {
					analyzerPropertyData.Options = append(analyzerPropertyData.Options, enumValue.(string))
				}
				analyzerPropertyData.InputType = "Enum"
			case "items":
				analyzerPropertyData.InputType = "Enum"
				itemsValues := v.(map[string]interface{})
				for key, itemValue := range itemsValues {
					if key != "enum" {
						analyzerPropertyData.InputType = "String"
						break
					}
					enumValues := itemValue.([]interface{})
					for _, enumValue := range enumValues {
						analyzerPropertyData.Options = append(analyzerPropertyData.Options, enumValue.(string))
					}
				}
			}
		}
		analyzerPropertyData.FieldName = key

		requiredPropertiesData = append(requiredPropertiesData, analyzerPropertyData)
	}
	return requiredPropertiesData
}

func (o *Options) inputAnalyzerMeta(requiredFieldsData map[string][]AnalyzerMetadata) error {
	var err error
	// Iterate over the map and fetch the input for the fields from the user
	for analyzer, metaFields := range requiredFieldsData {
		for i := 0; i < len(metaFields); i++ {
			switch metaFields[i].InputType {
			case "Boolean":
				metaFields[i].UserInput = "true"
				res, err := utils.ConfirmFromUser(metaFields[i].Title, metaFields[i].Description)
				if err != nil {
					return err
				}
				if !res {
					metaFields[i].UserInput = "false"
				}
			case "Enum":
				metaFields[i].UserInput, err = utils.SelectFromOptions(metaFields[i].Title, metaFields[i].Description, metaFields[i].Options)
				if err != nil {
					return err
				}
			default:
				metaFields[i].UserInput, err = utils.GetSingleLineInput(metaFields[i].Title, metaFields[i].Description)
				if err != nil {
					return err
				}
			}
		}
		requiredFieldsData[analyzer] = metaFields
	}
	o.AnalyzerMetaMap = requiredFieldsData
	return nil
}

func (o *Options) extractRequiredAnalyzerMetaFields() error {
	var optionalFields []string
	var requiredFieldsData []AnalyzerMetadata
	var combinedRequiredFieldsData = make(map[string][]AnalyzerMetadata)

	// Extract `optional_required` fields of analyzer meta of selected analyzers
	for _, activatedAnalyzer := range o.ActivatedAnalyzers {
		for idx, supportedAnalyzer := range utils.AnaData.AnalyzerNames {
			if activatedAnalyzer == supportedAnalyzer {
				// If the analyzer matches, find the meta
				analyzerMeta := utils.AnaData.AnalyzersMeta[idx]

				// Parse the JSON metaschema
				var meta map[string]interface{}
				json.Unmarshal([]byte(analyzerMeta), &meta)
				optionalRequiredFieldPresent := false

				// Check if the meta contains the `optional_required` field
				for key := range meta {
					if key == "optional_required" {
						optionalRequiredFieldPresent = true
						break
					}
				}
				// If not present, move to check for next analyzer
				// by moving to next iteration
				if !optionalRequiredFieldPresent {
					continue
				}

				// Filter out `optional_required` fields
				optionalRequiredFields := meta["optional_required"].([]interface{})
				// if no optional_required field is present, move to checking for next
				// analyzer
				if len(optionalRequiredFields) == 0 {
					continue
				}

				// Creating a list of optional_required fields of the analyzer
				for _, value := range optionalRequiredFields {
					optionalFields = append(optionalFields, value.(string))
				}

				// Extract the list of all supported `fields`/`properties` present in
				// analyzer's metaschema
				analyzerMetaProperties := meta["properties"].(map[string]interface{})

				requiredFieldsData = extractMetaProperties(analyzerMetaProperties, optionalFields)
				combinedRequiredFieldsData[activatedAnalyzer] = requiredFieldsData
			}
		}
	}
	return o.inputAnalyzerMeta(combinedRequiredFieldsData)
}
