package configvalidator

import (
	"reflect"
	"testing"

	"github.com/deepsourcelabs/cli/utils"
)

func TestValidateAnalyzersConfig(t *testing.T) {
	type test struct {
		inputConfig string
		result      bool
	}
	utils.AnaData.AnalyzerShortcodes = []string{"python", "test-coverage"}
	utils.AnaData.AnalyzersMeta = []string{`{
   "type": "object",
   "properties": {
      "max_line_length": {
         "type": "integer",
         "minimum": 79,
         "title": "Maximum line length",
         "description": "Customize this according to your project's conventions.",
         "default": 100
      },
      "runtime_version": {
         "enum": [
            "3.x.x",
            "2.x.x"
         ],
         "type": "string",
         "title": "Runtime version",
         "description": "Set it to the least version of Python that your code runs on.",
         "default": "3.x.x"
      },
      "skip_doc_coverage": {
         "type": "array",
         "title": "Skip in doc coverage",
         "description": "Types of objects that should be skipped while calculating documentation coverage.",
         "items": {
            "enum": [
               "magic",
               "init",
               "class",
               "module",
               "nonpublic"
            ],
            "type": "string"
         },
         "additionalProperties": false
      }
   },
   "optional_required": [
      "runtime_version"
   ],
   "additionalProperties": false
}`, "{}"}

	tests := []test{
		{
			inputConfig: "[[analyzers]]\nname = \"python\"\nenabled = true",
			result:      true,
		},
		{
			inputConfig: "[[analyzers]]\nname = \"python\"\nenabled = false",
			result:      false,
		},
		{
			inputConfig: "[[analyzers]]\nname = \"foobar\"\nenabled = true",
			result:      false,
		},
		{
			inputConfig: `
            [[analyzers]]
            name = "python"
            enabled = true

                [analyzers.meta]
                max_line_length = 100
                skip_doc_coverage = ["module", "magic", "class"]`,
			result: true,
		},
		{
			inputConfig: `
            [[analyzers]]
            name = "python"
            enabled = true

                [analyzers.meta]
                max_line_length = -100`,
			result: false,
		},
		{
			inputConfig: `
            [[analyzers]]
            name = "python"
            enabled = true

                [analyzers.meta]
                max_line_length = 100

            [[analyzers]]
            name = "test-coverage"
            enabled = true`,
			result: true,
		},
	}
	for _, tc := range tests {
		testConfig, err := getConfig([]byte(tc.inputConfig))
		if err != nil {
			t.Error(err)
		}
		c := &ConfigValidator{
			Config: *testConfig,
			Result: Result{
				Valid:           true,
				Errors:          []string{},
				ConfigReadError: false,
			},
		}
		c.validateAnalyzersConfig()
		if !reflect.DeepEqual(tc.result, c.Result.Valid) {
			t.Errorf("expected: %v, got: %v. Error: %v", tc.result, c.Result.Valid, c.Result.Errors)
		}
	}
}
