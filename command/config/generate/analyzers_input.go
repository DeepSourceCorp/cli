package generate

import (
	"github.com/AlecAivazis/survey/v2"
	"github.com/Jeffail/gabs/v2"
	"github.com/deepsourcelabs/cli/utils"
)

// Struct to hold the data regarding the compulsary meta fields as required by analyzers
// Also, the userinput for that field
type AnalyzerMetadata struct {
	FieldName   string
	Type        string
	Title       string
	Description string
	Options     []string
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

// Uses the `survey` prompt API to gather user input and store in `Options` struct
// `Options` struct is later used for config generation
func (o *Options) inputAnalyzerMeta(requiredFieldsData map[string][]AnalyzerMetadata) error {
	var err error
	// Iterate over the map and fetch the input for the fields from the user
	for analyzer, metaFields := range requiredFieldsData {
		for i := 0; i < len(metaFields); i++ {
			switch metaFields[i].Type {
			case "boolean":
				metaFields[i].UserInput = "true"
				res, err := utils.ConfirmFromUser(metaFields[i].Title, metaFields[i].Description)
				if err != nil {
					return err
				}
				if !res {
					metaFields[i].UserInput = "false"
				}
			case "enum":
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

// Checks if the field is present in the array containing list of `optional_required`
// analyzer meta fields
func isContains(requiredFieldsList []string, field string) bool {
	for _, v := range requiredFieldsList {
		if field == v {
			return true
		}
	}
	return false
}

// The primary function to parse the API response of meta schema, filter out the `optional_required` fields
// and then gather user input by calling the above function `inputAnalyzerMeta`
// It iterates over all the properties the analyzer supports and extracts data needed by only `optional_required` fields.
// This data is then, used to get input from user
func (o *Options) extractRequiredAnalyzerMetaFields() error {
	var optionalFields []string
	var requiredFieldsData []AnalyzerMetadata
	var analyzerFieldsData = make(map[string][]AnalyzerMetadata)

	// Extract `optional_required` fields of analyzer meta of selected analyzers
	for _, activatedAnalyzer := range o.ActivatedAnalyzers {
		optionalFields = nil
		requiredFieldsData = nil
		for idx, supportedAnalyzer := range utils.AnaData.AnalyzerNames {
			if activatedAnalyzer != supportedAnalyzer {
				continue
			}
			analyzerMeta := utils.AnaData.AnalyzersMeta[idx]
			// Parse the analyzer meta of the analyzer using `gabs`
			jsonParsed, err := gabs.ParseJSON([]byte(analyzerMeta))
			if err != nil {
				return err
			}
			// Search for "optional_required" fields in the metaschema
			for _, child := range jsonParsed.Search("optional_required").Children() {
				optionalFields = append(optionalFields, child.Data().(string))
			}
			// Move on to next analyzer if no "optional_required" fields found
			if len(optionalFields) == 0 {
				continue
			}

			requiredFieldsData = make([]AnalyzerMetadata, len(optionalFields))
			// Iterate through the properties and extract the data of the
			// required analyzer meta fields
			count := 0
			for key, child := range jsonParsed.Search("properties").ChildrenMap() {
				if !isContains(optionalFields, key) {
					continue
				}
				propertyJSON, _ := gabs.ParseJSON(child.Bytes())
				requiredFieldsData[count].FieldName = key
				requiredFieldsData[count].Title = propertyJSON.Search("title").Data().(string)
				requiredFieldsData[count].Description = propertyJSON.Search("description").Data().(string)
				requiredFieldsData[count].Type = propertyJSON.Search("type").Data().(string)
				// Check for enum
				for _, child := range propertyJSON.Search("enum").Children() {
					requiredFieldsData[count].Options = append(requiredFieldsData[count].Options, child.Data().(string))
					requiredFieldsData[count].Type = "enum"
				}
				// Check for items
				itemsPath := propertyJSON.Path("items")
				itemsJSON, _ := gabs.ParseJSON(itemsPath.Bytes())
				for _, child := range itemsJSON.Search("enum").Children() {
					requiredFieldsData[count].Options = append(requiredFieldsData[count].Options, child.Data().(string))
					requiredFieldsData[count].Type = "enum"
				}
				count++
			}
		}
		analyzerFieldsData[activatedAnalyzer] = requiredFieldsData
	}
	return o.inputAnalyzerMeta(analyzerFieldsData)
}
