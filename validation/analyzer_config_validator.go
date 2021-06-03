package validation

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"reflect"

	"github.com/xeipuuv/gojsonschema"
)

// Struct to store the Mock API response
type APIResponse struct {
	Data struct {
		Analyzers struct {
			Edges []struct {
				Node struct {
					Shortcode          string `json:"shortcode"`
					Metaschema         string `json:"metaSchema"`
					Transformertoolset struct {
						Edges []interface{} `json:"edges"`
					} `json:"transformertoolSet"`
				} `json:"node"`
			} `json:"edges"`
		} `json:"analyzers"`
	} `json:"data"`
}

// Analyzer Config Validator
func (c *ConfigValidator) validateAnalyzersConfig() {
	activatedAnalyzers := make(map[string]interface{})

	// TODO: Replace this file reading logic with API call
	// ==================================================
	apiData, err := ioutil.ReadFile("/Users/sidntrivedi012/Code/deepsource/cli/validation/api_response.json")
	if err != nil {
		log.Fatalln("Cant read api response", err)
	}

	var data APIResponse
	err = json.Unmarshal(apiData, &data)
	if err != nil {
		log.Fatalln("Error in unmarshaling api data")
	}
	// ==================================================

	// ==== Analyzer array should not be empty ====
	if len(c.Config.Analyzers) == 0 {
		c.pushError("There must be atleast one activated `analyzer` in the config. Found: 0")
	}

	// ==== Enabled must be boolean. And atleast one analyzer must be enabled among all mentioned in config ====
	countEnabled := 0
	for _, analyzer := range c.Config.Analyzers {
		enabledType := reflect.TypeOf(analyzer.Enabled).Kind().String()
		if enabledType != "bool" {
			c.pushError(fmt.Sprintf("The `enabled` property should be of boolean type. Found: %v", enabledType))
		}

		if analyzer.Enabled == true {
			countEnabled++
		}
	}

	if countEnabled == 0 {
		c.pushError("There must be atleast one enabled `analyzer`. Found: 0")
	}

	// ==== Analyzer shortcode validation ====
	supported := false
	for _, analyzer := range c.Config.Analyzers {

		for _, supportedAnalyzer := range data.Data.Analyzers.Edges {
			if analyzer.Name == supportedAnalyzer.Node.Shortcode {
				if analyzer.Enabled == true {
					activatedAnalyzers[analyzer.Name] = analyzer.Meta
				}
				supported = true
				break
			}
		}

		if supported == false {
			c.pushError(fmt.Sprintf("Analyzer for \"%s\" is not supported yet.", analyzer.Name))
		}

		supported = false
	}

	// ==== Meta Schema Validation ====

	var analyzerMetaSchema string
	var userActivatedSchema interface{}

	// Iterating over the activated analyzers and
	// validating the meta_schema
	for analyzer, meta := range activatedAnalyzers {

		for _, analyzerMetaResponse := range data.Data.Analyzers.Edges {

			if analyzer == analyzerMetaResponse.Node.Shortcode {
				analyzerMetaSchema = analyzerMetaResponse.Node.Metaschema
				userActivatedSchema = meta
				break
			}
		}

		// Loading the Meta Schema obtained from API
		schema := gojsonschema.NewStringLoader(analyzerMetaSchema)

		// Loading the Meta Schema of the user after converting it
		// into a JSON string
		jsonUserSchema, _ := json.Marshal(userActivatedSchema)
		inputMeta := gojsonschema.NewStringLoader(string(jsonUserSchema))

		// If there is no meta-schema, write empty object in the inputSchema
		if string(jsonUserSchema) == "null" {
			inputMeta = gojsonschema.NewStringLoader("{}")
		}

		// Validate the Meta Schema
		result, _ := gojsonschema.Validate(schema, inputMeta)

		if result.Valid() {
			continue
		} else {
			finalErrString := fmt.Sprintf("Errors found while validating meta of %s analyzer", analyzer)
			for _, err := range result.Errors() {
				errString := fmt.Sprintf("%s", err)
				finalErrString = finalErrString + errString
			}
			c.pushError(finalErrString)
		}
	}

}
