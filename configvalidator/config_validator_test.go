package configvalidator

import (
	"reflect"
	"testing"

	"github.com/deepsourcelabs/cli/utils"
)

func TestValidateConfig(t *testing.T) {
	type test struct {
		inputConfig string
		valid       bool
	}
	setDummyAnalyzerTransformerData()

	tests := map[string]test{
		"blank config": {
			inputConfig: "",
			valid:       false,
		},
		"analyzer should be array": {
			inputConfig: `
            version = 1
            analyzers = "python",
            enabled = true`,
			valid: false,
		},
		"zero analyzers": {
			inputConfig: `
            version = 1

            [[analyzers]]
            name = "python"
            enabled = false

            [[analyzers]]
            name = "javascript"
            enabled = true`,
			valid: false,
		},
		"transformer without analyzer": {
			inputConfig: `
            version = 1

            [[transformers]]
            name = "black"
            enabled = true`,
			valid: false,
		},
		"no analyzer/transformer activated": {
			inputConfig: `
            version = 1

            [[analyzers]]
            name = "python"
            enabled = false

            [[transformers]]
            name = "black"
            enabled = false

            [[transformers]]
            name = "isort"
            enabled = false`,
			valid: false,
		},
		"tranformers with analyzer disabled": {
			inputConfig: `
            version = 1

            [[analyzers]]
            name = "python"
            enabled = false

            [[transformers]]
            name = "black"
            enabled = true

            [[transformers]]
            name = "isort"
            enabled = true`,
			valid: false,
		},
		"non-supported transformer": {
			inputConfig: `
            version = 1

            [[analyzers]]
            name = "python"
            enabled = true

            [[transformers]]
            name = "egg"
            enabled = true`,
			valid: false,
		},
		"transformer must be an array": {
			inputConfig: `
            version = 1

            [[analyzers]]
            name = "python"
            enabled = true

            transformers = "egg"
            enabled = true`,
			valid: false,
		},
		"valid config with enabled not set (defaults to true)": {
			inputConfig: `
            version = 1

            [[analyzers]]
            name = "python"

            [[transformers]]
            name = "black"`,
			valid: true,
		},

		"invalid config with enabled = \"falsee\" (non-boolean)": {
			inputConfig: `
            version = 1

            [[analyzers]]
            name = "python"
            enabled = "falsee"`,
			valid: false,
		},
	}

	for testName, tc := range tests {
		t.Run(testName, func(t *testing.T) {
			c := &ConfigValidator{}
			c.ValidateConfig([]byte(tc.inputConfig))
			if !reflect.DeepEqual(tc.valid, c.Result.Valid) {
				t.Errorf("%s: expected: %v, got: %v. Error: %v", testName, tc.valid, c.Result.Valid, c.Result.Errors)
			}
		})
	}
}

func setDummyAnalyzerTransformerData() {
	analyzersMetaMap := make(map[string]string)
	utils.AnalyzersData.AnalyzerShortcodes = []string{"python", "test-coverage"}
	utils.AnalyzersData.AnalyzersMeta = []string{`{
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

	analyzersMetaMap["python"] = utils.AnalyzersData.AnalyzersMeta[0]
	analyzersMetaMap["test-coverage"] = utils.AnalyzersData.AnalyzersMeta[1]
	utils.AnalyzersData.AnalyzersMetaMap = analyzersMetaMap

	utils.TransformersData.TransformerShortcodes = []string{"black", "prettier"}
}
