package generate

import (
	"encoding/json"
	"log"

	"github.com/AlecAivazis/survey/v2"
	"github.com/deepsourcelabs/cli/utils"
)

type AnalyzerMetadata struct {
	Field       string
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

	o.extractRequiredAnalyzerMeta()

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

func (o *Options) extractRequiredAnalyzerMeta() {
	var optionalFields []string

	analyzerRequiredFieds := make(map[string][]AnalyzerMetadata)

	// Extract `optional_required` fields of analyzer meta of selected analyzers
	for _, activatedAnalyzer := range o.ActivatedAnalyzers {
		for idx, supportedAnalyzer := range utils.AnaData.AnalyzerNames {
			if activatedAnalyzer == supportedAnalyzer {
				// If the analyzer matches, find the meta
				analyzerMeta := utils.AnaData.AnalyzersMeta[idx]

				// Parse the JSON metaschema
				var meta map[string]interface{}
				json.Unmarshal([]byte(analyzerMeta), &meta)
				optionalFieldPresent := false

				for key := range meta {
					if key == "optional_required" {
						optionalFieldPresent = true
						break
					}
				}
				if optionalFieldPresent == false {
					continue
				}

				// Filter out `optional_required` fields in a string array
				optionalRequiredFields := meta["optional_required"].([]interface{})
				if len(optionalRequiredFields) == 0 {
					continue
				}

				for _, value := range optionalRequiredFields {
					optionalFields = append(optionalFields, value.(string))
				}

				// Extract the list of `fields`/`properties` analyzer has in the meta
				analyzerMetaProperties := meta["properties"].(map[string]interface{})

				// Iterate over all the properties analyzer supports and
				// extract data needed by only `optional_required` fields
				count := 0
				for key, value := range analyzerMetaProperties {
					// Check if the field is `optional_required`
					if !isContains(optionalFields, key) {
						continue
					}
					// If yes, parse its properties and append the data to a map
					// with the layout : map[analyzer]:[]OptionalFieldsProperties
					propertiesData := value.(map[string]interface{})
					analyzerFieldsData := make([]AnalyzerMetadata, len(propertiesData))
					analyzerFieldsData[count].InputType = "String"

					for k, v := range propertiesData {
						switch k {
						case "type":
							analyzerFieldsData[count].Type = v.(string)
							if v.(string) == "boolean" {
								analyzerFieldsData[count].InputType = "Boolean"
							}
						case "title":
							analyzerFieldsData[count].Title = v.(string)
						case "description":
							analyzerFieldsData[count].Description = v.(string)
						case "enum":
							enumValues := v.([]interface{})
							for _, enumValue := range enumValues {
								analyzerFieldsData[count].Options = append(analyzerFieldsData[count].Options, enumValue.(string))
							}
							analyzerFieldsData[count].InputType = "Enum"
						case "items":
							itemsValues := v.(map[string]interface{})
							for _, itemValue := range itemsValues {
								enumValues := itemValue.([]interface{})
								for _, enumValue := range enumValues {
									analyzerFieldsData[count].Options = append(analyzerFieldsData[count].Options, enumValue.(string))
								}
							}
							analyzerFieldsData[count].InputType = "Enum"
						}
					}
					analyzerFieldsData[count].Field = key
					analyzerRequiredFieds[activatedAnalyzer] = append(analyzerRequiredFieds[activatedAnalyzer], analyzerFieldsData[count])
					count++
				}
			}
		}
	}

	var err error
	// Iterate over the map and fetch the input for the fields from the user
	for analyzer, metaFields := range analyzerRequiredFieds {

		for i := 0; i < len(metaFields); i++ {

			switch metaFields[i].InputType {
			case "Boolean":
				metaFields[i].UserInput = "true"
				res, err := utils.ConfirmFromUser(metaFields[i].Title, metaFields[i].Description)
				if err != nil {
					log.Println(err)
				}
				if res == false {
					metaFields[i].UserInput = "false"
				}
			case "Enum":
				metaFields[i].UserInput, err = utils.SelectFromOptions(metaFields[i].Title, metaFields[i].Description, metaFields[i].Options)
				if err != nil {
					log.Println(err)
				}
			default:
				metaFields[i].UserInput, err = utils.GetSingleLineInput(metaFields[i].Title, metaFields[i].Description)
				if err != nil {
					log.Println(err)
				}
			}
		}
		analyzerRequiredFieds[analyzer] = metaFields
	}
	o.AnalyzerMetaMap = analyzerRequiredFieds
}
