package generate

import (
	"log"

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

// Extracts the fields that are compulsary according to the meta schema and require input
func populateMetaData(optionalFields []string, jsonParsed *gabs.Container) []AnalyzerMetadata {
	requiredFieldsData := make([]AnalyzerMetadata, len(optionalFields))

	// Iterate through the properties using the parsed json (jsonParsed) and extract the data of the
	// required analyzer meta fields
	count := 0
	for key, child := range jsonParsed.Search("properties").ChildrenMap() {
		if !isContains(optionalFields, key) {
			continue
		}
		propertyJSON, err := gabs.ParseJSON(child.Bytes())
		if err != nil {
			log.Printf("Error occured while parsing analyzer meta property: %v\n", err)
			continue
		}
		requiredFieldsData[count].FieldName = key
		requiredFieldsData[count].Title = propertyJSON.Search("title").Data().(string)
		requiredFieldsData[count].Description = propertyJSON.Search("description").Data().(string)
		requiredFieldsData[count].Type = propertyJSON.Search("type").Data().(string)

		// Check for enum property
		for _, child := range propertyJSON.Search("enum").Children() {
			requiredFieldsData[count].Options = append(requiredFieldsData[count].Options, child.Data().(string))
			requiredFieldsData[count].Type = "enum"
		}

		// Check for items property
		itemsPath := propertyJSON.Path("items")
		itemsJSON, _ := gabs.ParseJSON(itemsPath.Bytes())
		for _, child := range itemsJSON.Search("enum").Children() {
			requiredFieldsData[count].Options = append(requiredFieldsData[count].Options, child.Data().(string))
			requiredFieldsData[count].Type = "enum"
		}
		// Increment count to accomodate the next required field in next index
		count++
	}
	return requiredFieldsData
}

// The primary function to parse the API response of meta schema and filter out the `optional_required` fields
// Calls helper functions (mentioned above) to perform the required meta data extraction
// and handling prompt for inputting these fields
func (o *Options) extractRequiredAnalyzerMetaFields() error {
	var optionalFields []string
	var requireMetaData []AnalyzerMetadata
	var analyzerFieldsData = make(map[string][]AnalyzerMetadata)

	// Extract `optional_required` fields of analyzer meta of selected analyzers
	for _, activatedAnalyzer := range o.ActivatedAnalyzers {
		// Assigning optional fields to nil before checking for an analyzer
		optionalFields = nil
		for idx, supportedAnalyzer := range utils.AnaData.AnalyzerNames {
			if activatedAnalyzer != supportedAnalyzer {
				continue
			}
			analyzerMeta := utils.AnaData.AnalyzersMeta[idx]

			// Parse the analyzer meta of the analyzer using `gabs`
			jsonParsed, err := gabs.ParseJSON([]byte(analyzerMeta))
			if err != nil {
				log.Printf("Error occured while parsing meta for %s analyzer.\n", activatedAnalyzer)
				return err
			}

			// Search for "optional_required" fields in the meta-schema
			for _, child := range jsonParsed.Search("optional_required").Children() {
				optionalFields = append(optionalFields, child.Data().(string))
			}
			// Move on to next analyzer if no "optional_required" fields found
			if len(optionalFields) == 0 {
				continue
			}
			// Extract the the data to be input for all the required analyzer meta properties
			requireMetaData = populateMetaData(optionalFields, jsonParsed)
		}
		analyzerFieldsData[activatedAnalyzer] = requireMetaData
	}
	return o.inputAnalyzerMeta(analyzerFieldsData)
}
