package configvalidator

import (
	"encoding/json"
	"fmt"
	"reflect"

	"github.com/xeipuuv/gojsonschema"
)

// Analyzer Config Validator
func (c *ConfigValidator) validateAnalyzersConfig(analyzers AnalyzersData) {

	activatedAnalyzers := make(map[string]interface{})

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

		if analyzer.Enabled {
			countEnabled++
		}
	}

	if countEnabled == 0 && len(c.Config.Analyzers) > 0 {
		c.pushError("There must be atleast one enabled `analyzer`. Found: 0")
	}

	// ==== Analyzer shortcode validation ====
	supported := false
	for _, analyzer := range c.Config.Analyzers {

		for _, supportedAnalyzer := range analyzers.AnalyzerShortcodes {
			if analyzer.Name == supportedAnalyzer {
				if analyzer.Enabled {
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

	var analyzerMetaSchema string
	var userActivatedSchema interface{}

	// Iterating over the activated analyzers and
	// validating the meta_schema
	for analyzer, meta := range activatedAnalyzers {
		for index, supportedAnalyzer := range analyzers.AnalyzerShortcodes {
			if analyzer == supportedAnalyzer {
				analyzerMetaSchema = analyzers.AnalyzesMeta[index]
				userActivatedSchema = meta
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
		}
		finalErrString := fmt.Sprintf("Errors found while validating meta of %s analyzer", analyzer)
		for _, err := range result.Errors() {
			errString := err.String()
			finalErrString = finalErrString + errString
		}
		c.pushError(finalErrString)
	}

}
