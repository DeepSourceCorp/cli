package configvalidator

import (
	"encoding/json"
	"fmt"
	"reflect"

	"github.com/deepsourcelabs/cli/utils"
	"github.com/xeipuuv/gojsonschema"
)

// Analyzer Config Validator
func (c *ConfigValidator) validateAnalyzersConfig() {
	activatedAnalyzers := make(map[string]interface{})

	// Analyzer array should not be empty
	if len(c.Config.Analyzers) == 0 {
		c.pushError("There must be atleast one activated `analyzer` in the config. Found: 0")
	}

	// Analyzers should be an array
	analyzersType := reflect.TypeOf(c.Config.Analyzers).Kind().String()
	if analyzersType != "slice" {
		c.pushError(fmt.Sprintf("Value of `analyzers` should be an array. Found: %v", analyzersType))
	}

	// Count enabled analyzers (missing enabled field defaults to true)
	countEnabled := 0
	for _, analyzer := range c.Config.Analyzers {
		// If enabled is not set (nil), consider it as enabled (true)
		// If enabled is set, use its value
		isEnabled := analyzer.Enabled == nil || *analyzer.Enabled

		if isEnabled {
			countEnabled++
		}
	}
	if countEnabled == 0 && len(c.Config.Analyzers) > 0 {
		c.pushError("There must be atleast one enabled `analyzer`. Found: 0")
	}

	// ==== Analyzer shortcode validation ====
	supported := false
	for _, analyzer := range c.Config.Analyzers {
		for _, supportedAnalyzer := range utils.AnalyzersData.AnalyzerShortcodes {
			if analyzer.Name == supportedAnalyzer {
				// Copy the meta of activated analyzer for usage in
				// analyzer meta validation
				isEnabled := analyzer.Enabled == nil || *analyzer.Enabled
				if isEnabled {
					activatedAnalyzers[analyzer.Name] = analyzer.Meta
				}
				supported = true
				break
			}
		}
		if !supported {
			c.pushError(fmt.Sprintf("Analyzer for \"%s\" is not supported yet.", analyzer.Name))
		}

		supported = false
	}

	// ==== Meta Schema Validation ====

	// Contains the meta-schema of the particular activated analyzer
	var analyzerMetaSchema string
	// Contains the user supplied meta
	var userActivatedSchema interface{}

	// Iterating over the activated analyzers and
	// validating the meta_schema
	for analyzer, meta := range activatedAnalyzers {
		analyzerMetaSchema = utils.AnalyzersData.AnalyzersMetaMap[analyzer]
		userActivatedSchema = meta

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
		}
		finalErrString := fmt.Sprintf("Errors found while validating meta of %s analyzer: ", analyzer)
		for _, err := range result.Errors() {
			errString := err.String()
			finalErrString = finalErrString + errString
		}
		c.pushError(finalErrString)
	}
}
